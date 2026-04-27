import { prisma } from '@/lib/prisma'
import { UsersTable } from './UsersTable'

export const metadata = { title: 'Admin — Users' }

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      subscriptionStatus: true,
      creditsBalance: true,
      createdAt: true,
    },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Users</h1>
      <UsersTable users={users} />
    </div>
  )
}
