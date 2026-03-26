# AGENT: Skills Marketplace (Phase 2)

## Your job
Build the skills/integrations marketplace that lets users add tools to their OpenClaw instance.

## How skills work
Each skill is an MCP (Model Context Protocol) server config.
When a user enables a skill:
1. The skill's `mcpConfig` is merged into the instance's OpenClaw config
2. The compose service is restarted with new env vars
3. DB `enabledSkills` array is updated

## `src/app/api/skills/route.ts`
```typescript
// GET  → list all available skills from DB
// POST → enable/disable a skill for current user's instance
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { injectSkill } from '@/lib/dokploy'
import { NextResponse } from 'next/server'

export async function GET() {
  const skills = await prisma.skill.findMany({ where: { active: true } })
  return NextResponse.json(skills)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { skillSlug, enable } = await req.json()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { instance: true },
  })
  if (!user?.instance) return NextResponse.json({ error: 'No instance' }, { status: 404 })

  const skill = await prisma.skill.findUnique({ where: { slug: skillSlug } })
  if (!skill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 })

  const current = user.instance.enabledSkills
  const updated = enable
    ? [...new Set([...current, skillSlug])]
    : current.filter(s => s !== skillSlug)

  await prisma.instance.update({
    where: { id: user.instance.id },
    data: { enabledSkills: updated },
  })

  if (enable) {
    await injectSkill(user.instance, skill.mcpConfig as object)
  }

  return NextResponse.json({ enabledSkills: updated })
}
```

## `src/app/dashboard/skills/page.tsx`
Grid of SkillCard components. Each card:
- Icon + Name + Description
- Category badge
- Toggle button (enabled = green, disabled = grey)
- On toggle → POST `/api/skills`

## `src/components/dashboard/SkillCard.tsx`
```typescript
// Props: skill: Skill, enabled: boolean, onToggle: () => void
// Card with hover effect, toggle button
```

## Seed data for skills (goes in prisma/seed.ts)
```typescript
const skills = [
  {
    name: 'Gmail',
    slug: 'gmail',
    description: 'Read, send, and manage emails',
    category: 'productivity',
    iconUrl: '/icons/gmail.svg',
    mcpConfig: {
      type: 'mcp',
      server: 'gmail-mcp',
      env: { GMAIL_CLIENT_ID: '', GMAIL_CLIENT_SECRET: '' }
    }
  },
  {
    name: 'Google Calendar',
    slug: 'gcal',
    description: 'Manage calendar events and scheduling',
    category: 'productivity',
    mcpConfig: { type: 'mcp', server: 'gcal-mcp', env: {} }
  },
  {
    name: 'Notion',
    slug: 'notion',
    description: 'Read and write Notion pages and databases',
    category: 'productivity',
    mcpConfig: { type: 'mcp', server: 'notion-mcp', env: { NOTION_API_KEY: '' } }
  },
  {
    name: 'GitHub',
    slug: 'github',
    description: 'Manage issues, PRs, and repos',
    category: 'dev',
    mcpConfig: { type: 'mcp', server: 'github-mcp', env: { GITHUB_TOKEN: '' } }
  },
  {
    name: 'Telegram',
    slug: 'telegram',
    description: 'Send messages via Telegram bot',
    category: 'messaging',
    mcpConfig: { type: 'mcp', server: 'telegram-mcp', env: { TELEGRAM_BOT_TOKEN: '' } }
  },
  {
    name: 'Discord',
    slug: 'discord',
    description: 'Post to Discord channels',
    category: 'messaging',
    mcpConfig: { type: 'mcp', server: 'discord-mcp', env: { DISCORD_TOKEN: '' } }
  },
]
```
