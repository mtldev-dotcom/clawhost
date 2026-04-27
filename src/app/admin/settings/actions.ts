'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { SubscriptionStatus } from '@prisma/client'

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Forbidden')
}

export async function savePlatformSettings(data: {
  signupEnabled: boolean
  requireEmailConfirm: boolean
  defaultCredits: number
  defaultSubStatus: SubscriptionStatus
  maintenanceMode: boolean
}) {
  await requireAdmin()
  await prisma.platformSettings.upsert({
    where: { id: 'global' },
    create: { id: 'global', ...data },
    update: data,
  })
  revalidatePath('/admin/settings')
}
