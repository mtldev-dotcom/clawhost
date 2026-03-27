import { env } from './env'
import { prisma } from './prisma'
import { exec } from 'child_process'
import { promisify } from 'util'
import type { User, Instance } from '@prisma/client'

const execAsync = promisify(exec)
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

export async function provisionInstance(user: User, instance: Instance) {
  const slug = slugify(user.email!)  // e.g. nick-gmail-com
  const subdomain = `${slug}.nickybruno.com`

  // Local Docker provisioning when Dokploy is not configured
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
    const project = await dokployFetch('/api/project.create', {
      method: 'POST',
      body: JSON.stringify({ name: `clawhost-${slug}`, description: `ClawHost for ${user.email}` }),
    })

    // 2. Create compose service inside project
    const compose = await dokployFetch('/api/compose.create', {
      method: 'POST',
      body: JSON.stringify({
        name: `openclaw-${slug}`,
        projectId: project.projectId,
        composeType: 'docker-compose',
      }),
    })

    // 3. Set the docker-compose content
    const composeYaml = buildComposeYaml({
      slug,
      subdomain,
      channelToken: instance.channelToken ?? '',
      aiApiKey: instance.aiApiKey ?? '',
      aiProvider: instance.aiProvider ?? 'openai',
    })

    await dokployFetch('/api/compose.update', {
      method: 'POST',
      body: JSON.stringify({
        composeId: compose.composeId,
        composeFile: composeYaml,
      }),
    })

    // 4. Add domain (Traefik handles SSL automatically)
    await dokployFetch('/api/domain.create', {
      method: 'POST',
      body: JSON.stringify({
        host: subdomain,
        port: 18789,
        https: true,
        composeId: compose.composeId,
        serviceName: 'openclaw',
      }),
    })

    // 5. Deploy
    await dokployFetch('/api/compose.deploy', {
      method: 'POST',
      body: JSON.stringify({ composeId: compose.composeId }),
    })

    // 6. Update DB
    await prisma.instance.update({
      where: { id: instance.id },
      data: {
        status: 'active',
        appUrl: `https://${subdomain}`,
        dokployProjectId: project.projectId,
        dokployAppId: compose.composeId,
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
    // Local Docker cleanup
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

export async function injectSkill(instance: Instance, mcpConfig: object) {
  if (!DOKPLOY_CONFIGURED) {
    // For local, we'd need to restart the container with new config
    // For now just log - full implementation would recreate container
    console.log(`[LOCAL] Skill injection requires container restart (not implemented)`)
    return
  }
  // Restart compose with new env vars for the MCP skill
  // Read current env, merge, update, redeploy
  if (!instance.dokployAppId) throw new Error('No composeId')
  // TODO: fetch current compose, inject MCP server config, redeploy
  await dokployFetch('/api/compose.deploy', {
    method: 'POST',
    body: JSON.stringify({ composeId: instance.dokployAppId }),
  })
}

export async function getGatewayToken(containerName: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(
      `docker exec ${containerName} node /app/openclaw.mjs config get gateway.auth.token`
    )
    // Output is JSON string like "abc123", need to parse it
    const token = stdout.trim().replace(/^"|"$/g, '')
    return token || null
  } catch {
    return null
  }
}

export async function approvePairing(containerName: string, channel: string, pairingCode: string) {
  // Validate pairing code format (alphanumeric)
  if (!/^[a-zA-Z0-9]+$/.test(pairingCode)) {
    throw new Error('Invalid pairing code format')
  }

  const cmd = `docker exec ${containerName} node /app/openclaw.mjs pairing approve ${channel} ${pairingCode}`
  console.log(`[LOCAL] Approving pairing: ${channel} ${pairingCode}`)

  const { stdout, stderr } = await execAsync(cmd)
  if (stderr && !stdout) {
    throw new Error(stderr)
  }

  console.log(`[LOCAL] Pairing approved:`, stdout)
  return { success: true }
}

function buildComposeYaml({ slug, subdomain, channelToken, aiApiKey, aiProvider }: {
  slug: string, subdomain: string, channelToken: string, aiApiKey: string, aiProvider: string
}) {
  return `
version: '3.8'
services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    restart: unless-stopped
    environment:
      - OPENCLAW_CHANNEL_TOKEN=${channelToken}
      - OPENCLAW_AI_PROVIDER=${aiProvider}
      - OPENCLAW_AI_API_KEY=${aiApiKey}
      - OPENCLAW_INSTANCE_SLUG=${slug}
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
  // Find highest port in use by existing instances
  const instances = await prisma.instance.findMany({
    where: { appUrl: { startsWith: 'http://localhost:' } },
    select: { appUrl: true },
  })

  let maxPort = LOCAL_PORT_START - 1
  for (const inst of instances) {
    const match = inst.appUrl?.match(/:(\d+)/)
    if (match) {
      const port = parseInt(match[1], 10)
      if (port > maxPort) maxPort = port
    }
  }
  return maxPort + 1
}

async function provisionLocal(slug: string, instance: Instance) {
  const containerName = `openclaw-${slug}`
  const port = await getNextPort()

  // Stop & remove existing container if any
  await execAsync(`docker rm -f ${containerName} 2>/dev/null || true`)

  // Map provider to standard env var name
  const getApiKeyEnvVar = (provider: string | null) => {
    switch (provider) {
      case 'anthropic': return 'ANTHROPIC_API_KEY'
      case 'openrouter': return 'OPENROUTER_API_KEY'
      default: return 'OPENAI_API_KEY'
    }
  }
  const apiKeyEnvVar = getApiKeyEnvVar(instance.aiProvider)

  // Build docker run command (port 18789 is OpenClaw's gateway port)
  // No volume mount - container manages its own state (ephemeral for local dev)
  const envVars = [
    `-e ${apiKeyEnvVar}=${instance.aiApiKey || ''}`,
  ].join(' ')

  const cmd = `docker run -d --name ${containerName} -p ${port}:18789 ${envVars} ${OPENCLAW_IMAGE}`

  console.log(`[LOCAL] Running: docker run ... -p ${port}:18789 ${containerName}`)

  const { stdout } = await execAsync(cmd)
  const containerId = stdout.trim().slice(0, 12)

  // Wait for gateway to initialize
  console.log(`[LOCAL] Waiting 3s for gateway to initialize...`)
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Configure secrets provider to read API keys from env vars
  const secretsCmd = `docker exec ${containerName} node /app/openclaw.mjs config set secrets.providers.default --provider-source env --provider-allowlist OPENAI_API_KEY --provider-allowlist ANTHROPIC_API_KEY --provider-allowlist OPENROUTER_API_KEY`
  console.log(`[LOCAL] Configuring secrets provider...`)
  await execAsync(secretsCmd)

  // Set default model based on provider
  const getDefaultModel = (provider: string | null) => {
    switch (provider) {
      case 'anthropic': return 'anthropic/claude-sonnet-4-6'
      case 'openrouter': return 'openrouter/anthropic/claude-sonnet-4-6'
      default: return 'openai/gpt-4o'
    }
  }
  const modelCmd = `docker exec ${containerName} node /app/openclaw.mjs config set agents.defaults.model '"${getDefaultModel(instance.aiProvider)}"'`
  console.log(`[LOCAL] Setting model: ${getDefaultModel(instance.aiProvider)}`)
  await execAsync(modelCmd)

  // Configure channel via CLI (channels can't be set via env vars)
  // Note: channels add triggers OpenClaw's internal restart which kills PID 1
  // We need to restart the container after to recover
  if (instance.channel && instance.channelToken) {
    const channelCmd = `docker exec ${containerName} node /app/openclaw.mjs channels add --channel ${instance.channel} --token ${instance.channelToken}`
    console.log(`[LOCAL] Adding channel: ${instance.channel}`)
    try {
      await execAsync(channelCmd)
    } catch (err) {
      // Expected - container restarts itself and exec fails
      console.log(`[LOCAL] Channel added (container restarting...)`)
    }
  }

  // Restart container to apply all config changes
  await new Promise(resolve => setTimeout(resolve, 2000))
  await execAsync(`docker restart ${containerName}`)
  console.log(`[LOCAL] Container restarted`)

  // Wait for gateway to be ready
  await new Promise(resolve => setTimeout(resolve, 4000))

  // Update DB
  await prisma.instance.update({
    where: { id: instance.id },
    data: {
      status: 'active',
      appUrl: `http://localhost:${port}`,
      dokployProjectId: `local-${containerId}`,
      dokployAppId: containerName,
    },
  })

  console.log(`[LOCAL] Started ${containerName} on port ${port}`)
}

async function deprovisionLocal(instance: Instance) {
  if (instance.dokployAppId) {
    const containerName = instance.dokployAppId
    await execAsync(`docker rm -f ${containerName} 2>/dev/null || true`)
    console.log(`[LOCAL] Stopped ${containerName}`)
  }
}
