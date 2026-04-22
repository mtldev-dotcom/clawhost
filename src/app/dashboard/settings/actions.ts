'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { provisionInstance } from '@/lib/dokploy'
import { revalidatePath } from 'next/cache'
import type { Channel, AiProvider } from '@/types'

export async function saveProvider(provider: AiProvider, apiKey: string) {
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

  // Upsert provider config
  const providerConfig = await prisma.providerConfig.upsert({
    where: {
      instanceId_provider: {
        instanceId: instance.id,
        provider,
      },
    },
    create: {
      instanceId: instance.id,
      provider,
      apiKey,
      isValid: null,
    },
    update: {
      apiKey,
      isValid: null,
    },
  })

  // Also update the instance's primary provider fields for backward compatibility
  await prisma.instance.update({
    where: { id: instance.id },
    data: {
      aiProvider: provider,
      aiApiKey: apiKey,
    },
  })

  revalidatePath('/dashboard/settings')
  return providerConfig
}

export async function deleteProvider(providerId: string) {
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

  // Verify ownership
  const provider = await prisma.providerConfig.findFirst({
    where: {
      id: providerId,
      instanceId: instance.id,
    },
  })

  if (!provider) {
    throw new Error('Provider not found')
  }

  await prisma.providerConfig.delete({
    where: { id: providerId },
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function testProvider(providerId: string) {
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

  const provider = await prisma.providerConfig.findFirst({
    where: {
      id: providerId,
      instanceId: instance.id,
    },
  })

  if (!provider) {
    throw new Error('Provider not found')
  }

  // Test the API key by making a simple request
  let valid = false

  try {
    if (provider.provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${provider.apiKey}` },
      })
      valid = res.ok
    } else if (provider.provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': provider.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      })
      // Anthropic returns 200 or 401/403 for auth issues
      valid = res.ok || res.status === 400 // 400 means auth worked but request was bad
    } else if (provider.provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${provider.apiKey}` },
      })
      valid = res.ok
    }
  } catch {
    valid = false
  }

  // Update the provider's validity status
  await prisma.providerConfig.update({
    where: { id: providerId },
    data: { isValid: valid },
  })

  revalidatePath('/dashboard/settings')
  return { valid }
}

export async function setActiveProvider(providerId: string, model: string) {
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

  const provider = await prisma.providerConfig.findFirst({
    where: {
      id: providerId,
      instanceId: instance.id,
    },
  })

  if (!provider) {
    throw new Error('Provider not found')
  }

  // Set all providers inactive, then activate the selected one
  await prisma.providerConfig.updateMany({
    where: { instanceId: instance.id },
    data: { isActive: false },
  })

  await prisma.providerConfig.update({
    where: { id: providerId },
    data: { isActive: true },
  })

  // Update instance with active model and provider
  await prisma.instance.update({
    where: { id: instance.id },
    data: {
      activeModel: model,
      aiProvider: provider.provider,
      aiApiKey: provider.apiKey,
    },
  })

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: true }
}

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

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function approvePairingCode(code: string) {
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

  if (!instance.dokployAppId) {
    throw new Error('Instance not deployed yet')
  }

  // Execute pairing approve command in the container via Dokploy
  const { execInContainer } = await import('@/lib/dokploy')
  const result = await execInContainer(
    instance.dokployAppId,
    `openclaw pairing approve telegram ${code}`
  )

  if (!result.success) {
    throw new Error(result.error || 'Failed to approve pairing')
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function deployInstance() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const instance = await prisma.instance.findUnique({
    where: { userId: session.user.id },
    include: { providers: true },
  })

  if (!instance) {
    throw new Error('No instance found')
  }

  if (!instance.channel || !instance.channelToken) {
    throw new Error('Please configure a channel before deploying')
  }

  if (instance.providers.length === 0) {
    throw new Error('Please add at least one AI provider before deploying')
  }

  // Get active provider or first one
  const activeProvider = instance.providers.find((p) => p.isActive) || instance.providers[0]

  // Update status to provisioning
  const updatedInstance = await prisma.instance.update({
    where: { id: instance.id },
    data: {
      status: 'provisioning',
      aiProvider: activeProvider.provider,
      aiApiKey: activeProvider.apiKey,
    },
  })

  // Get user for provisioning
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Trigger provisioning (runs async, don't await)
  provisionInstance(user, updatedInstance).catch(async (error) => {
    console.error('Provisioning failed:', error)
    await prisma.instance.update({
      where: { id: updatedInstance.id },
      data: { status: 'failed' },
    })
  })

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: true }
}
