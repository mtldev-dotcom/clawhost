# AGENT: Provisioner (Dokploy API)

## Your job
Build `src/lib/dokploy.ts` — the full provisioning/deprovisioning service.

## Dokploy API reference
- Base URL: `process.env.DOKPLOY_URL` (e.g. https://deploy.nickybruno.com)
- Auth header: `x-api-key: process.env.DOKPLOY_API_KEY`
- All endpoints are REST JSON

## Key API calls needed
| Action | Method | Endpoint |
|--------|--------|----------|
| Create project | POST | `/api/project.create` |
| Create compose service | POST | `/api/compose.create` |
| Update compose (set docker-compose content) | POST | `/api/compose.update` |
| Set env vars | POST | `/api/environment.create` |
| Add domain | POST | `/api/domain.create` |
| Deploy | POST | `/api/compose.deploy` |
| Delete project | POST | `/api/project.remove` |

## Security Warning

**CRITICAL:** Never pass user input directly to shell commands. The production `dokploy.ts` uses `spawn()` with array arguments and strict input validation to prevent shell injection attacks.

**Key Security Features:**
- `validateContainerName()` - Only allows alphanumeric, hyphens, underscores
- `validateCommandArg()` - Blocks shell metacharacters (; | & $ ` " etc.)
- `validatePairingCode()` - Alphanumeric only, 4-32 characters
- `execDocker()` - Uses `spawn()` with array args, never string interpolation

## Create `src/lib/dokploy.ts`

```typescript
import { env } from './env'
import { prisma } from './prisma'
import { spawn } from 'child_process'
import type { User, Instance } from '@prisma/client'

const DOKPLOY_BASE = env.DOKPLOY_URL
const HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': env.DOKPLOY_API_KEY,
}

// SECURITY: Input validators to prevent injection
function validateContainerName(name: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(name) && name.length <= 64
}

function validateCommandArg(arg: string): boolean {
  return /^[a-zA-Z0-9_.\/:=-]+$/.test(arg) && arg.length <= 256
}

function validatePairingCode(code: string): boolean {
  return /^[a-zA-Z0-9]{4,32}$/.test(code)
}

// SECURITY: Safe command execution using spawn with array args
function execSafe(command: string, args: string[]): Promise<{ stdout: string }> {
  return new Promise((resolve, reject) => {
    if (args.some(arg => !validateCommandArg(arg))) {
      reject(new Error('Invalid command argument'))
      return
    }
    const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = ''
    child.stdout?.on('data', (data) => { stdout += data.toString() })
    child.on('close', (code) => {
      if (code !== 0) reject(new Error(`Exit code: ${code}`))
      else resolve({ stdout: stdout.trim() })
    })
  })
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
        port: 3000,
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

    console.log(`✅ Provisioned ${subdomain}`)
  } catch (err) {
    await prisma.instance.update({
      where: { id: instance.id },
      data: { status: 'failed' },
    })
    throw err
  }
}

export async function deprovisionInstance(instance: Instance) {
  if (instance.dokployProjectId) {
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
  // Restart compose with new env vars for the MCP skill
  // Read current env, merge, update, redeploy
  if (!instance.dokployAppId) throw new Error('No composeId')
  // TODO: fetch current compose, inject MCP server config, redeploy
  await dokployFetch('/api/compose.deploy', {
    method: 'POST',
    body: JSON.stringify({ composeId: instance.dokployAppId }),
  })
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
```

## Also create `src/app/api/provision/route.ts`
Manual provision endpoint (for admin use / retry):
```typescript
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { provisionInstance } from '@/lib/dokploy'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { instance: true },
  })
  if (!user?.instance) return NextResponse.json({ error: 'No instance' }, { status: 404 })

  await provisionInstance(user, user.instance)
  return NextResponse.json({ status: 'provisioning' })
}
```

## Important: OpenClaw Docker image
Default image: `ghcr.io/openclaw/openclaw:latest`
If this image doesn't exist yet or is private, substitute with a placeholder nginx image during dev.
Check https://github.com/openclaw/openclaw for the correct image name.
