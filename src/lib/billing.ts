import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

export async function grantSubscriptionCredits(userId: string, amount = env.PLATFORM_MONTHLY_CREDITS) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: 'active',
      creditsBalance: { increment: amount },
      lifetimeCreditsGranted: { increment: amount },
    },
  })
}

export async function updateSubscriptionStatus(userId: string, status: 'active' | 'past_due' | 'cancelled' | 'inactive') {
  return prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: status },
  })
}
