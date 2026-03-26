'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { provisionInstance } from '@/lib/dokploy'
import { revalidatePath } from 'next/cache'
import type { Channel, AiProvider } from '@/types'

export async function updateChannelConfig(channel: Channel, token: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const instance = await prisma.instance.findUnique({
    where: { userId: session.user.id },
  })

  if (!instance) {
    throw new Error('No instance found')
  }

  await prisma.instance.update({
    where: { id: instance.id },
    data: {
      channel,
      channelToken: token,
    },
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateAiConfig(provider: AiProvider, apiKey: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const instance = await prisma.instance.findUnique({
    where: { userId: session.user.id },
  })

  if (!instance) {
    throw new Error('No instance found')
  }

  await prisma.instance.update({
    where: { id: instance.id },
    data: {
      aiProvider: provider,
      aiApiKey: apiKey,
    },
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deployInstance() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const instance = await prisma.instance.findUnique({
    where: { userId: session.user.id },
  })

  if (!instance) {
    throw new Error('No instance found')
  }

  if (!instance.channel || !instance.channelToken || !instance.aiProvider || !instance.aiApiKey) {
    throw new Error('Please configure both channel and AI provider before deploying')
  }

  // Update status to provisioning
  const updatedInstance = await prisma.instance.update({
    where: { id: instance.id },
    data: { status: 'provisioning' },
  })

  // Get user for provisioning
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Trigger provisioning (runs async, don't await)
  provisionInstance(user, updatedInstance).catch(console.error)

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getInstanceStatus() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const instance = await prisma.instance.findUnique({
    where: { userId: session.user.id },
  })

  return instance
}
