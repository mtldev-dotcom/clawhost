import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SettingsClient } from './client'
import { platformModels } from '@/lib/platform'
import { env } from '@/lib/env'

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { instance: true },
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>
      <SettingsClient
        user={{
          name: user.name ?? '',
          email: user.email,
          hasPassword: !!user.passwordHash,
          subscriptionStatus: user.subscriptionStatus,
          creditsBalance: user.creditsBalance,
          lifetimeCreditsGranted: user.lifetimeCreditsGranted,
          telegramUsername: user.telegramUsername,
          telegramLinkedAt: user.telegramLinkedAt?.toISOString() ?? null,
        }}
        instance={{
          status: user.instance?.status ?? 'pending',
          appUrl: user.instance?.appUrl ?? null,
          activeModel: user.instance?.activeModel ?? env.PLATFORM_DEFAULT_MODEL,
        }}
        models={platformModels}
      />
    </div>
  )
}
