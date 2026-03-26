import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { InstanceCard } from '@/components/dashboard/InstanceCard'
import { DashboardClient } from './client'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const instance = await prisma.instance.findUnique({
    where: { userId: session.user.id },
  })

  if (!instance) {
    // User has no instance, redirect to onboarding or show message
    redirect('/onboarding')
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <div className="space-y-6">
        <InstanceCard instance={instance} />

        <DashboardClient
          instance={instance}
        />
      </div>
    </div>
  )
}
