import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Admin — Overview' }

export default async function AdminPage() {
  const [totalUsers, activeUsers, creditSum, activeInstances, totalInstances] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionStatus: 'active' } }),
    prisma.user.aggregate({ _sum: { creditsBalance: true } }),
    prisma.instance.count({ where: { status: 'active' } }),
    prisma.instance.count(),
  ])

  const stats = [
    { label: 'Total Users', value: totalUsers },
    { label: 'Active Subscriptions', value: activeUsers },
    { label: 'Credits in System', value: (creditSum._sum.creditsBalance ?? 0).toLocaleString() },
    { label: 'Active Instances', value: `${activeInstances} / ${totalInstances}` },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Overview</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-800 bg-gray-900 p-5">
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
