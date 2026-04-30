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

  const [user, locale, messages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { creditsBalance: true },
    }),
    getLocale(),
    getMessages(),
  ])

  const translations = {
    nav: (messages as { nav: { workspace: string; inbox: string; today: string; chat: string; settings: string; skills: string } }).nav,
    common: (messages as { common: { signOut: string } }).common,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader
        credits={user?.creditsBalance}
        locale={locale as Locale}
        translations={translations}
      />
      <main className="flex-1">{children}</main>
    </div>
  )
}