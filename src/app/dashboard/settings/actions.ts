'use server'

import { randomBytes } from 'node:crypto'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { provisionInstance } from '@/lib/dokploy'
import { revalidatePath } from 'next/cache'
import { env } from '@/lib/env'
import { isSupportedPlatformModel } from '@/lib/platform'

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

export async function createTelegramConnectLink() {
  const user = await requireUser()

  if (!env.TELEGRAM_SHARED_BOT_USERNAME) {
    throw new Error('TELEGRAM_SHARED_BOT_USERNAME is not configured')
  }

  await prisma.telegramLinkToken.deleteMany({
    where: {
      userId: user.id,
      consumedAt: null,
    },
  })

  const token = randomBytes(24).toString('base64url')
  await prisma.telegramLinkToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15),
    },
  })

  return {
    url: `https://t.me/${env.TELEGRAM_SHARED_BOT_USERNAME}?start=${token}`,
  }
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
