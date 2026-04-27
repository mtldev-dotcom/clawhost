import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { UserDetailClient } from './client'

export const metadata = { title: 'Admin — User Detail' }

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: { instance: true },
  })

  if (!user) notFound()

  return <UserDetailClient user={user} />
}
