import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ChatInterface } from '@/components/dashboard/ChatInterface'
import { getMessages } from 'next-intl/server'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [instance, messages] = await Promise.all([
    prisma.instance.findUnique({
      where: { userId: session.user.id },
    }),
    getMessages(),
  ])

  if (!instance) {
    redirect('/onboarding')
  }

  const chatTranslations = (messages as { chat: typeof import('@/i18n/messages/en.json')['chat'] }).chat

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <ChatInterface
        instanceStatus={instance.status}
        activeModel={instance.activeModel}
        translations={chatTranslations}
      />
    </div>
  )
}
