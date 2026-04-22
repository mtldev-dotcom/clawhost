import { env } from './env'
import { prisma } from './prisma'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { existsSync } from 'fs'
import type { User, Instance } from '@prisma/client'
import { extractComposeId, extractEnvironmentId, extractProjectId } from './dokploy-api'

const execAsync = promisify(exec)

// Detect if running in production (Docker socket available) or local dev
const isProduction = existsSync('/var/run/docker.sock')
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || 'clawdbot-nickdevmtl'
const GCP_ZONE = process.env.GCP_ZONE || 'us-central1-a'

// ============ SAFETY HELPERS ============

/**
 * Validate container name to prevent injection
 * Only allows alphanumeric, hyphens, and underscores
 */
function validateContainerName(name: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(name) && name.length <= 64
}

/**
 * Validate command arguments to prevent injection
 * Only allows safe characters for CLI arguments
 */
function validateCommandArg(arg: string): boolean {
  // Allow alphanumeric, hyphens, underscores, dots, slashes, colons
  // Block: ; | & $ ` " ' \ < > ( ) { } [ ]
  return /^[a-zA-Z0-9_.\/:=-]+$/.test(arg) && arg.length <= 256
}

/**
 * Validate pairing code format
 */
function validatePairingCode(code: string): boolean {
  return /^[a-zA-Z0-9]{4,32}$/.test(code)
}

/**
 * Safe command execution using spawn instead of exec
 * Prevents shell injection by using array arguments
 */
function execSafe(
  command: string,
  args: string[],
  options?: { timeout?: number; cwd?: string }
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      timeout: options?.timeout || 60000,
      cwd: options?.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Command failed with code ${code}: ${stderr || 'Unknown error'}`
          )
        )
      } else {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() })
      }
    })

    child.on('error', (error) => {
      reject(error)
    })
  })
}

/**
 * Execute Docker command with validation
 * Uses spawn to prevent injection
 */
async function execDocker(
  containerName: string,
  args: string[],
  useGcloud = false
): Promise<{ stdout: string; stderr: string }> {
  // Validate container name
  if (!validateContainerName(containerName)) {
    throw new Error('Invalid container name')
  }

  // Validate all args
  for (const arg of args) {
    if (!validateCommandArg(arg)) {
      throw new Error('Invalid command argument')
    }
  }

  if (useGcloud) {
    // For gcloud, we need to wrap the docker command
    const sshArgs = [
      'compute', 'ssh', 'dokploy',
      '--zone', GCP_ZONE,
      '--project', GCP_PROJECT_ID,
      '--command', `sudo docker exec ${containerName} ${args.join(' ')}`
    ]
    return execSafe('gcloud', sshArgs, { timeout: 60000 })
  }

  // Direct Docker execution
  return execSafe('docker', ['exec', containerName, ...args], { timeout: 60000 })
}

// ============ DOKPLOY CONFIG ============

const DOKPLOY_CONFIGURED = !!(env.DOKPLOY_URL && env.DOKPLOY_API_KEY)
const DOKPLOY_BASE = env.DOKPLOY_URL ?? ''
const HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': env.DOKPLOY_API_KEY ?? '',
}

async function dokployFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${DOKPLOY_BASE}${path}`, {
    ...options,
    headers: { ...HEADERS, ...(options.headers ?? {}) },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Dokploy ${path} failed: ${res.status} ${text}`)
  }
  return res.json()
}

function requireIdentifier(value: string | null, label: string, response: unknown): string {
  if (value) {
    return value
  }

  throw new Error(
    `Dokploy ${label} succeeded but returned no identifier: ${JSON.stringify(response)}`
  )
}

async function resolveEnvironmentId(projectId: string, projectResponse: unknown) {
  const directEnvironmentId = extractEnvironmentId(projectResponse)
  if (directEnvironmentId) {
    return directEnvironmentId
  }

  try {
    const projectDetails = await dokployFetch(`/api/project.one?projectId=${projectId}`)
    const projectEnvironmentId = extractEnvironmentId(projectDetails)
    if (projectEnvironmentId) {
      return projectEnvironmentId
    }
  } catch (error) {
    console.warn(`Dokploy project.one lookup failed for ${projectId}:`, error)
  }

  try {
    const environments = await dokployFetch(`/api/environment.byProjectId?projectId=${projectId}`)
    const environmentId = extractEnvironmentId(environments)
    if (environmentId) {
      return environmentId
    }
  } catch (error) {
    console.warn(`Dokploy environment.byProjectId lookup failed for ${projectId}:`, error)
  }

  throw new Error(`Dokploy could not resolve an environment for project ${projectId}`)
}

async function createCompose(name: string, projectId: string, environmentId: string) {
  const payloads = [
    { name, projectId, environmentId, composeType: 'docker-compose' },
    { name, projectId, composeType: 'docker-compose' },
  ]

  let lastError: unknown

  for (const payload of payloads) {
    try {
      return await dokployFetch('/api/compose.create', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (error) {
      lastError = error
      if ('environmentId' in payload) {
        console.warn('Dokploy compose.create with environmentId failed, retrying with projectId only:', error)
        continue
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Dokploy compose.create failed')
}

// ============ PUBLIC API ============

export async function provisionInstance(user: User, instance: Instance) {
  const slug = slugify(user.email!)
  const subdomain = `${slug}.nickybruno.com`

  if (!DOKPLOY_CONFIGURED) {
    console.log(`[LOCAL] Provisioning ${slug} via Docker...`)
    try {
      await provisionLocal(slug, instance)
    } catch (err) {
      await prisma.instance.update({
        where: { id: instance.id },
        data: { status: 'failed' },
      })
      throw err
    }
    return
  }

  try {
    // 1. Create project
    const projectResponse = await dokployFetch('/api/project.create', {
      method: 'POST',
      body: JSON.stringify({ name: `clawhost-${slug}`, description: `ClawHost for ${user.email}` }),
    })
    const projectId = requireIdentifier(
      extractProjectId(projectResponse),
      'project.create',
      projectResponse
    )

    // 2. Get the project's default environment
    const environmentId = await resolveEnvironmentId(projectId, projectResponse)

    // 3. Create compose service inside project
    const composeResponse = await createCompose(`openclaw-${slug}`, projectId, environmentId)
    const composeId = requireIdentifier(
      extractComposeId(composeResponse),
      'compose.create',
      composeResponse
    )

    // 4. Set the docker-compose content
    const composeYaml = buildComposeYaml({
      slug,
      subdomain,
      channelToken: instance.channelToken ?? '',
      aiApiKey: instance.aiApiKey ?? '',
      aiProvider: instance.aiProvider ?? 'openai',
      model: instance.activeModel ?? undefined,
    })

    await dokployFetch('/api/compose.update', {
      method: 'POST',
      body: JSON.stringify({
        composeId,
        composeFile: composeYaml,
        sourceType: 'raw',
      }),
    })

    // 5. Add domain
    await dokployFetch('/api/domain.create', {
      method: 'POST',
      body: JSON.stringify({
        host: subdomain,
        port: 18789,
        https: true,
        composeId,
        serviceName: 'openclaw',
      }),
    })

    // 6. Deploy
    await dokployFetch('/api/compose.deploy', {
      method: 'POST',
      body: JSON.stringify({ composeId }),
    })

    // 7. Get gateway token from container
    const containerName = `openclaw-${slug}-openclaw-1`
    let gatewayToken: string | null = null
    try {
      gatewayToken = await getGatewayToken(containerName)
      console.log(`Retrieved gateway token for ${slug}`)
    } catch (err) {
      console.warn(`Failed to get gateway token for ${slug}:`, err)
    }

    // 8. Update DB
    await prisma.instance.update({
      where: { id: instance.id },
      data: {
        status: 'active',
        appUrl: `https://${subdomain}`,
        dokployProjectId: projectId,
        dokployAppId: composeId,
        containerHost: containerName,
        gatewayToken: gatewayToken,
      },
    })

    console.log(`Provisioned ${subdomain}`)
  } catch (err) {
    await prisma.instance.update({
      where: { id: instance.id },
      data: { status: 'failed' },
    })
    throw err
  }
}

export async function deprovisionInstance(instance: Instance) {
  if (!DOKPLOY_CONFIGURED) {
    await deprovisionLocal(instance)
  } else if (instance.dokployProjectId) {
    await dokployFetch('/api/project.remove', {
      method: 'POST',
      body: JSON.stringify({ projectId: instance.dokployProjectId }),
    })
  }
  await prisma.instance.update({
    where: { id: instance.id },
    data: { status: 'cancelled', appUrl: null, dokployProjectId: null, dokployAppId: null },
  })
}

export async function execInContainer(composeId: string, command: string): Promise<{ success: boolean; output?: string; error?: string }> {
  if (!DOKPLOY_CONFIGURED) {
    return { success: false, error: 'Dokploy not configured' }
  }

  try {
    // Get compose details to find container name
    const compose = await dokployFetch(`/api/compose.one?composeId=${composeId}`)
    const containerName = `${compose.appName}-openclaw-1`

    // Split command into args safely
    const commandArgs = command.split(' ').filter(arg => arg.length > 0)
    
    // Validate command args
    if (commandArgs.some(arg => !validateCommandArg(arg))) {
      return { success: false, error: 'Invalid command arguments' }
    }

    const { stdout, stderr } = await execDocker(
      containerName,
      commandArgs,
      !isProduction
    )

    const output = stdout || stderr

    if (output.includes('No pending pairing request') || output.includes('not found')) {
      return { success: false, error: 'Pairing code expired. Send a new message to the bot.' }
    }

    return { success: true, output }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    console.error('execInContainer failed:', error)

    if (error.includes('No pending pairing request')) {
      return { success: false, error: 'Pairing code expired. Send a new message to the bot.' }
    }
    if (error.includes('No such container')) {
      return { success: false, error: 'Instance still starting. Wait 30 seconds and try again.' }
    }

    return { success: false, error }
  }
}

export async function injectSkill(instance: Instance, mcpConfig: object) {
  if (!DOKPLOY_CONFIGURED) {
    console.log(`[LOCAL] Skill injection requires container restart (not implemented)`)
    return
  }
  if (!instance.dokployAppId) throw new Error('No composeId')
  await dokployFetch('/api/compose.deploy', {
    method: 'POST',
    body: JSON.stringify({ composeId: instance.dokployAppId }),
  })
}

export async function getGatewayToken(containerName: string): Promise<string | null> {
  try {
    if (!validateContainerName(containerName)) {
      console.error('Invalid container name')
      return null
    }

    const { stdout } = await execDocker(
      containerName,
      ['node', '/app/openclaw.mjs', 'config', 'get', 'gateway.auth.token'],
      !isProduction
    )
    
    const token = stdout.trim().replace(/^"|"$/g, '')
    return token || null
  } catch {
    return null
  }
}

export async function approvePairing(containerName: string, channel: string, pairingCode: string) {
  // Validate inputs
  if (!validateContainerName(containerName)) {
    throw new Error('Invalid container name')
  }
  
  if (!validateCommandArg(channel)) {
    throw new Error('Invalid channel')
  }
  
  if (!validatePairingCode(pairingCode)) {
    throw new Error('Invalid pairing code format')
  }

  console.log(`Approving pairing: ${channel} ${pairingCode}`)

  const { stdout, stderr } = await execDocker(
    containerName,
    ['node', '/app/openclaw.mjs', 'pairing', 'approve', channel, pairingCode],
    !isProduction
  )

  if (stderr && !stdout) {
    throw new Error(stderr)
  }

  console.log(`Pairing approved:`, stdout)
  return { success: true }
}

function buildComposeYaml({ slug, subdomain, channelToken, aiApiKey, aiProvider, model }: {
  slug: string
  subdomain: string
  channelToken: string
  aiApiKey: string
  aiProvider: string
  model?: string
}) {
  const aiKeyEnvVar = aiProvider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY'

  const envVars = [
    `TELEGRAM_BOT_TOKEN=${escapeEnvVar(channelToken)}`,
    `${aiKeyEnvVar}=${escapeEnvVar(aiApiKey)}`,
  ]

  if (model) {
    envVars.push(`OPENCLAW_MODEL=${escapeEnvVar(model)}`)
  }

  const envBlock = envVars.map(v => `      - ${v}`).join('\n')

  return `
version: '3.8'
services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    restart: unless-stopped
    environment:
${envBlock}
    volumes:
      - openclaw_data:/app/data
    networks:
      - dokploy-network

volumes:
  openclaw_data:

networks:
  dokploy-network:
    external: true
`.trim()
}

/**
 * Escape environment variable values for Docker Compose YAML
 * Prevents YAML injection
 */
function escapeEnvVar(value: string): string {
  // Remove newlines and carriage returns
  return value
    .replace(/[\n\r]/g, '')
    // Escape double quotes for YAML
    .replace(/"/g, '\\"')
    // Remove null bytes
    .replace(/\0/g, '')
}

function slugify(email: string) {
  return email
    .toLowerCase()
    .replace('@', '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
}

// ============ LOCAL DOCKER PROVISIONING ============

const OPENCLAW_IMAGE = process.env.OPENCLAW_IMAGE || 'ghcr.io/openclaw/openclaw:latest'
const LOCAL_PORT_START = 4000

async function getNextPort(): Promise<number> {
  const usedPorts = new Set<number>()

  const instances = await prisma.instance.findMany({
    where: { appUrl: { startsWith: 'http://localhost:' } },
    select: { appUrl: true },
  })
  for (const inst of instances) {
    const match = inst.appUrl?.match(/:(\d+)/)
    if (match) usedPorts.add(parseInt(match[1], 10))
  }

  try {
    const { stdout } = await execAsync('docker ps --format "{{.Ports}}" 2>/dev/null || true')
    const portMatches = stdout.matchAll(/0\.0\.0\.0:(\d+)->/g)
    for (const match of portMatches) {
      usedPorts.add(parseInt(match[1], 10))
    }
  } catch {
    // Docker might not be available
  }

  let port = LOCAL_PORT_START
  while (usedPorts.has(port)) {
    port++
  }
  return port
}

async function provisionLocal(slug: string, instance: Instance) {
  const containerName = `openclaw-${slug}`
  const port = await getNextPort()

  // Validate slug to prevent injection
  if (!/^[a-z0-9-]+$/.test(slug) || slug.length > 40) {
    throw new Error('Invalid slug format')
  }

  // Stop & remove existing container
  await execAsync(`docker rm -f ${containerName} 2>/dev/null || true`)

  const getApiKeyEnvVar = (provider: string | null) => {
    switch (provider) {
      case 'anthropic': return 'ANTHROPIC_API_KEY'
      case 'openrouter': return 'OPENROUTER_API_KEY'
      default: return 'OPENAI_API_KEY'
    }
  }
  const apiKeyEnvVar = getApiKeyEnvVar(instance.aiProvider)

  // Use execSafe with array args instead of shell string
  const dockerArgs = [
    'run', '-d',
    '--name', containerName,
    '-p', `${port}:18789`,
    '-e', `${apiKeyEnvVar}=${instance.aiApiKey || ''}`,
    OPENCLAW_IMAGE
  ]

  console.log(`[LOCAL] Starting container ${containerName} on port ${port}`)
  const { stdout } = await execSafe('docker', dockerArgs)
  const containerId = stdout.trim().slice(0, 12)

  // Wait for gateway
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Configure secrets provider
  try {
    await execDocker(containerName, [
      'node', '/app/openclaw.mjs', 'config', 'set', 'secrets.providers.default',
      '--provider-source', 'env',
      '--provider-allowlist', 'OPENAI_API_KEY',
      '--provider-allowlist', 'ANTHROPIC_API_KEY',
      '--provider-allowlist', 'OPENROUTER_API_KEY'
    ])
  } catch {
    console.log('[LOCAL] Secrets config triggered restart')
  }

  await new Promise(resolve => setTimeout(resolve, 5000))

  // Set default model
  const getDefaultModel = (provider: string | null) => {
    switch (provider) {
      case 'anthropic': return 'anthropic/claude-sonnet-4-6'
      case 'openrouter': return 'openrouter/anthropic/claude-sonnet-4-6'
      default: return 'openai/gpt-4o'
    }
  }
  const model = getDefaultModel(instance.aiProvider)
  console.log(`[LOCAL] Setting model: ${model}`)

  try {
    await execDocker(containerName, [
      'node', '/app/openclaw.mjs', 'config', 'set', 'agents.defaults.model', `"${model}"`
    ])
  } catch {
    console.log('[LOCAL] Model config triggered restart')
  }

  await new Promise(resolve => setTimeout(resolve, 3000))

  // Add channel
  if (instance.channel && instance.channelToken) {
    const validChannels = ['telegram', 'discord', 'whatsapp']
    if (validChannels.includes(instance.channel)) {
      console.log(`[LOCAL] Adding channel: ${instance.channel}`)
      try {
        await execDocker(containerName, [
          'node', '/app/openclaw.mjs', 'channels', 'add',
          '--channel', instance.channel,
          '--token', instance.channelToken
        ])
      } catch {
        console.log('[LOCAL] Channel added (container may restart)')
      }
    }
  }

  await new Promise(resolve => setTimeout(resolve, 2000))

  try {
    await execDocker(containerName, ['restart'])
    console.log('[LOCAL] Container restarted')
  } catch {
    console.log('[LOCAL] Container already restarting')
  }

  await new Promise(resolve => setTimeout(resolve, 4000))

  // Get gateway token from local container
  let gatewayToken: string | null = null
  try {
    gatewayToken = await getGatewayToken(containerName)
    console.log(`[LOCAL] Retrieved gateway token for ${slug}`)
  } catch (err) {
    console.warn(`[LOCAL] Failed to get gateway token for ${slug}:`, err)
  }

  await prisma.instance.update({
    where: { id: instance.id },
    data: {
      status: 'active',
      appUrl: `http://localhost:${port}`,
      dokployProjectId: `local-${containerId}`,
      dokployAppId: containerName,
      containerHost: 'localhost',
      gatewayPort: port,
      gatewayToken: gatewayToken,
    },
  })

  console.log(`[LOCAL] Started ${containerName} on port ${port}`)
}

async function deprovisionLocal(instance: Instance) {
  if (instance.dokployAppId) {
    const containerName = instance.dokployAppId
    if (validateContainerName(containerName)) {
      try {
        await execSafe('docker', ['rm', '-f', containerName])
        console.log(`[LOCAL] Stopped ${containerName}`)
      } catch (error) {
        console.error(`[LOCAL] Failed to stop ${containerName}:`, error)
      }
    }
  }
}
