import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SettingsClient } from './client'
import { getMessages } from 'next-intl/server'

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [instance, messages] = await Promise.all([
    prisma.instance.findUnique({
      where: { userId: session.user.id },
      include: {
        providers: true,
      },
    }),
    getMessages(),
  ])

  if (!instance) {
    redirect('/onboarding')
  }

  const m = messages as {
    settings: {
      title: string
      instanceStatus: string
      runningAt: string
      configureFirst: string
      aiProviders: string
      channel: string
      addProvider: string
      saveProvider: string
      testKey: string
      providerSaved: string
      providerDeleted: string
      keyValid: string
      keyInvalid: string
      switchedTo: string
      channelSaved: string
      deploymentStarted: string
    }
    providers: Record<string, { label: string; description: string }>
    channels: Record<string, { label: string; placeholder: string }>
    common: {
      save: string
      cancel: string
      delete: string
      deploy: string
      redeploy: string
      deploying: string
      active: string
      valid: string
      invalid: string
    }
  }

  const translations = {
    settings: m.settings,
    providers: m.providers,
    channels: m.channels,
    common: m.common,
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="mb-8 text-3xl font-bold">{translations.settings.title}</h1>
      <SettingsClient instance={instance} providers={instance.providers} translations={translations} />
    </div>
  )
}
