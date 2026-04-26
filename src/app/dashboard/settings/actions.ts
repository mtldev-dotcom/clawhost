'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { provisionInstance } from '@/lib/dokploy'
import { revalidatePath } from 'next/cache'
import { env } from '@/lib/env'
import { isSupportedPlatformModel } from '@/lib/platform'
import { encrypt } from '@/lib/crypto'

async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { instance: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

export async function savePlatformModel(model: string) {
  const user = await requireUser()

  if (!isSupportedPlatformModel(model)) {
    throw new Error('Unsupported model')
  }

  await prisma.instance.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      aiProvider: 'openrouter',
      activeModel: model,
      status: 'pending',
    },
    update: {
      aiProvider: 'openrouter',
      activeModel: model,
    },
  })

  revalidatePath('/dashboard/settings')
  revalidatePath('/onboarding')
  return { success: true }
}

export async function saveTelegramBot(botToken: string, chatId: string) {
  const user = await requireUser()

  const trimmedToken = botToken.trim()
  const trimmedChatId = chatId.trim()

  if (!trimmedToken || !trimmedChatId) {
    throw new Error('Bot token and Chat ID are both required')
  }

  // Validate bot token format: numeric_id:hash
  if (!/^\d+:[A-Za-z0-9_-]{35,}$/.test(trimmedToken)) {
    throw new Error('Invalid bot token format. It should look like: 1234567890:ABCdef...')
  }

  if (!/^-?\d+$/.test(trimmedChatId)) {
    throw new Error('Chat ID must be a number (e.g. 123456789)')
  }

  // Verify token is real by calling Telegram getMe
  const res = await fetch(`https://api.telegram.org/bot${trimmedToken}/getMe`)
  if (!res.ok) {
    throw new Error('Telegram rejected the bot token — make sure you copied it correctly from BotFather')
  }
  const data = await res.json()
  const botUsername: string = data.result?.username ?? 'unknown'
  const botId: string = String(data.result?.id ?? trimmedToken.split(':')[0])

  await prisma.user.update({
    where: { id: user.id },
    data: {
      telegramBotToken: encrypt(trimmedToken),
      telegramBotId: botId,
      telegramChatId: trimmedChatId,
      telegramUsername: botUsername,
      telegramLinkedAt: new Date(),
    },
  })

  // Register webhook with Telegram (only works when app is on HTTPS)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  if (appUrl.startsWith('https')) {
    await fetch(`https://api.telegram.org/bot${trimmedToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: `${appUrl}/api/telegram/webhook`,
        secret_token: user.id,
        allowed_updates: ['message'],
      }),
    })
  }

  revalidatePath('/dashboard/settings')
  return { success: true, botUsername }
}

export async function deployInstance() {
  const user = await requireUser()

  if (user.subscriptionStatus !== 'active') {
    throw new Error('An active subscription is required before deploy')
  }

  if (user.creditsBalance <= 0) {
    throw new Error('No credits available for this account')
  }

  const instance = await prisma.instance.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      status: 'provisioning',
      aiProvider: 'openrouter',
      activeModel: env.PLATFORM_DEFAULT_MODEL,
      stripePriceId: env.STRIPE_PRICE_ID,
    },
    update: {
      status: 'provisioning',
      aiProvider: user.instance?.aiProvider || 'openrouter',
      activeModel: user.instance?.activeModel || env.PLATFORM_DEFAULT_MODEL,
      stripePriceId: user.instance?.stripePriceId || env.STRIPE_PRICE_ID,
    },
  })

  provisionInstance(user, instance).catch(async (error) => {
    console.error('Provisioning failed:', error)
    await prisma.instance.update({
      where: { id: instance.id },
      data: { status: 'failed' },
    })
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}
