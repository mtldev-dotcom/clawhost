import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
      command: 'npx',
      args: ['-y', '@anthropic/mcp-server-gmail'],
      env: {
        GMAIL_CLIENT_ID: '${GMAIL_CLIENT_ID}',
        GMAIL_CLIENT_SECRET: '${GMAIL_CLIENT_SECRET}',
        GMAIL_REDIRECT_URI: '${GMAIL_REDIRECT_URI}',
      },
      capabilities: ['read_emails', 'send_emails', 'manage_labels', 'search_emails'],
    },
  },
  {
    name: 'Google Calendar',
    slug: 'gcal',
    description: 'Manage calendar events and scheduling',
    category: 'productivity',
    iconUrl: '/icons/gcal.svg',
    mcpConfig: {
      type: 'mcp',
      server: 'gcal-mcp',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-server-gcal'],
      env: {
        GCAL_CLIENT_ID: '${GCAL_CLIENT_ID}',
        GCAL_CLIENT_SECRET: '${GCAL_CLIENT_SECRET}',
        GCAL_REDIRECT_URI: '${GCAL_REDIRECT_URI}',
      },
      capabilities: ['list_events', 'create_event', 'update_event', 'delete_event', 'get_freebusy'],
    },
  },
  {
    name: 'Notion',
    slug: 'notion',
    description: 'Read and write Notion pages and databases',
    category: 'productivity',
    iconUrl: '/icons/notion.svg',
    mcpConfig: {
      type: 'mcp',
      server: 'notion-mcp',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-server-notion'],
      env: {
        NOTION_API_KEY: '${NOTION_API_KEY}',
      },
      capabilities: ['read_pages', 'create_pages', 'update_pages', 'query_databases', 'search'],
    },
  },
  {
    name: 'GitHub',
    slug: 'github',
    description: 'Manage issues, PRs, and repos',
    category: 'dev',
    iconUrl: '/icons/github.svg',
    mcpConfig: {
      type: 'mcp',
      server: 'github-mcp',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-server-github'],
      env: {
        GITHUB_TOKEN: '${GITHUB_TOKEN}',
      },
      capabilities: ['list_repos', 'create_issue', 'list_issues', 'create_pr', 'review_pr', 'merge_pr'],
    },
  },
  {
    name: 'Telegram',
    slug: 'telegram',
    description: 'Send messages via Telegram bot',
    category: 'messaging',
    iconUrl: '/icons/telegram.svg',
    mcpConfig: {
      type: 'mcp',
      server: 'telegram-mcp',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-server-telegram'],
      env: {
        TELEGRAM_BOT_TOKEN: '${TELEGRAM_BOT_TOKEN}',
      },
      capabilities: ['send_message', 'receive_message', 'send_photo', 'send_document'],
    },
  },
  {
    name: 'Discord',
    slug: 'discord',
    description: 'Post to Discord channels',
    category: 'messaging',
    iconUrl: '/icons/discord.svg',
    mcpConfig: {
      type: 'mcp',
      server: 'discord-mcp',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-server-discord'],
      env: {
        DISCORD_TOKEN: '${DISCORD_TOKEN}',
        DISCORD_APPLICATION_ID: '${DISCORD_APPLICATION_ID}',
      },
      capabilities: ['send_message', 'read_messages', 'manage_channels', 'create_thread'],
    },
  },
]

async function main() {
  console.log('Seeding skills...')

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: {
        name: skill.name,
        description: skill.description,
        category: skill.category,
        iconUrl: skill.iconUrl,
        mcpConfig: skill.mcpConfig,
        active: true,
      },
      create: {
        name: skill.name,
        slug: skill.slug,
        description: skill.description,
        category: skill.category,
        iconUrl: skill.iconUrl,
        mcpConfig: skill.mcpConfig,
        active: true,
      },
    })
    console.log(`  + ${skill.name}`)
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
