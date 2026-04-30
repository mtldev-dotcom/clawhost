'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { provisionInstance, setChannelTelegramToken, approvePairing } from '@/lib/dokploy'
import { revalidatePath } from 'next/cache'
import { env } from '@/lib/env'
import { isSupportedPlatformModel } from '@/lib/platform'
import { encrypt } from '@/lib/crypto'
import bcrypt from 'bcryptjs'

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

export async function saveTelegramBot(botToken: string) {
  const user = await requireUser()

  const trimmedToken = botToken.trim()

  if (!trimmedToken) {
    throw new Error('Bot token is required')
  }

  if (!/^\d+:[A-Za-z0-9_-]{35,}$/.test(trimmedToken)) {
    throw new Error('Invalid bot token format. It should look like: 1234567890:ABCdef...')
  }

  // Verify the token by calling Telegram getMe
  const res = await fetch(`https://api.telegram.org/bot${trimmedToken}/getMe`)
  if (!res.ok) {
    throw new Error('Telegram rejected the bot token — make sure you copied it correctly from BotFather')
  }
  const data = await res.json()
  const botUsername: string = data.result?.username ?? 'unknown'
  const botId: string = String(data.result?.id ?? trimmedToken.split(':')[0])

  // The OpenClaw runtime owns the Telegram channel (long-poll, no HTTPS needed).
  // Push the token into the user's container and reload the gateway.
  if (!user.instance?.dokployAppId || user.instance.status !== 'active') {
    throw new Error('Your runtime is not active yet — deploy it from Settings before linking Telegram.')
  }

  await setChannelTelegramToken(user.instance.dokployAppId, trimmedToken)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      telegramBotToken: encrypt(trimmedToken),
      telegramBotId: botId,
      telegramUsername: botUsername,
      telegramLinkedAt: new Date(),
    },
  })

  revalidatePath('/dashboard/settings')
  return { success: true, botUsername }
}

export async function approveTelegramPairing(pairingCode: string) {
  const user = await requireUser()

  const code = pairingCode.trim()
  if (!/^[a-zA-Z0-9]{4,32}$/.test(code)) {
    throw new Error('Pairing code must be 4–32 alphanumeric characters')
  }

  if (!user.instance?.dokployAppId || user.instance.status !== 'active') {
    throw new Error('Your runtime is not active yet — deploy it from Settings.')
  }

  await approvePairing(user.instance.dokployAppId, code)

  revalidatePath('/dashboard/settings')
  return { success: true }
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

export async function saveProfile(data: {
  name: string
  email: string
  currentPassword?: string
  newPassword?: string
}) {
  const user = await requireUser()

  const name = data.name.trim()
  const email = data.email.trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Valid email is required')
  }

  if (email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('That email is already in use')
  }

  const updateData: Record<string, unknown> = { name, email }

  if (data.newPassword) {
    if (!data.currentPassword) throw new Error('Current password is required to set a new one')
    if (!user.passwordHash) throw new Error('No password set on this account')
    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash)
    if (!valid) throw new Error('Current password is incorrect')
    if (data.newPassword.length < 8) throw new Error('New password must be at least 8 characters')
    updateData.passwordHash = await bcrypt.hash(data.newPassword, 10)
  }

  await prisma.user.update({ where: { id: user.id }, data: updateData })

  revalidatePath('/dashboard/settings')
  return { success: true }
}
