import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { redirect } from 'next/navigation'
import { getLocale, getMessages } from 'next-intl/server'
import type { Locale } from '@/i18n/config'

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [instance, locale, messages] = await Promise.all([
    prisma.instance.findUnique({
      where: { userId: session.user.id },
      select: {
        activeModel: true,
        status: true,
      },
    }),
    getLocale(),
    getMessages(),
  ])

  const translations = {
    nav: (messages as { nav: { workspace: string; chat: string; settings: string; skills: string } }).nav,
    common: (messages as { common: { signOut: string } }).common,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader
        activeModel={instance?.activeModel}
        instanceStatus={instance?.status}
        locale={locale as Locale}
        translations={translations}
      />
      <main className="flex-1">{children}</main>
    </div>
  )
}