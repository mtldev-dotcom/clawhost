'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { SubscriptionStatus, UserRole } from '@prisma/client'

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Forbidden')
}

export async function grantCredits(userId: string, amount: number) {
  await requireAdmin()
  await prisma.user.update({
    where: { id: userId },
    data: {
      creditsBalance: { increment: amount },
      lifetimeCreditsGranted: amount > 0 ? { increment: amount } : undefined,
    },
  })
  revalidatePath(`/admin/users/${userId}`)
}

export async function setSubscriptionStatus(userId: string, status: SubscriptionStatus) {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: status } })
  revalidatePath(`/admin/users/${userId}`)
}

export async function setUserRole(userId: string, role: UserRole) {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath(`/admin/users/${userId}`)
}

export async function setEmailVerified(userId: string, emailVerified: boolean) {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { emailVerified } })
  revalidatePath(`/admin/users/${userId}`)
}
