'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { approvePairing, getGatewayToken } from '@/lib/dokploy'
import { revalidatePath } from 'next/cache'

// Re-export settings actions for backward compatibility
export { deployInstance } from './settings/actions'

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

export async function approveChannelPairing(pairingCode: string) {
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

  const containerName = instance.containerHost ?? instance.dokployAppId

  if (!containerName) {
    throw new Error('Instance not deployed')
  }

  if (!instance.channel) {
    throw new Error('No channel configured')
  }

  await approvePairing(containerName, instance.channel, pairingCode)

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getOpenClawDashboardUrl() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const instance = await prisma.instance.findUnique({
    where: { userId: session.user.id },
  })

  const containerName = instance?.containerHost ?? instance?.dokployAppId

  if (!instance || !containerName || !instance.appUrl) {
    throw new Error('Instance not deployed')
  }

  const token = await getGatewayToken(containerName)
  if (!token) {
    throw new Error('Could not retrieve gateway token')
  }

  // Build dashboard URL: http://localhost:PORT/#token=TOKEN
  return `${instance.appUrl}/#token=${token}`
}
