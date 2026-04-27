import { prisma } from '@/lib/prisma'
import { getPlatformSettings } from '@/lib/platform-settings'
import Link from 'next/link'

export const metadata = { title: 'Admin — Overview' }

export default async function AdminPage() {
  const [totalUsers, activeUsers, unverifiedUsers, creditSum, activeInstances, totalInstances, settings] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscriptionStatus: 'active' } }),
      prisma.user.count({ where: { emailVerified: false } }),
      prisma.user.aggregate({ _sum: { creditsBalance: true } }),
      prisma.instance.count({ where: { status: 'active' } }),
      prisma.instance.count(),
      getPlatformSettings(),
    ])

  const stats = [
    { label: 'Total Users', value: totalUsers },
    { label: 'Active Subscriptions', value: activeUsers },
    { label: 'Credits in System', value: (creditSum._sum.creditsBalance ?? 0).toLocaleString() },
    { label: 'Active Instances', value: `${activeInstances} / ${totalInstances}` },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Overview</h1>

      {/* Status banners */}
      <div className="mb-6 flex flex-col gap-2">
        {settings.maintenanceMode && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-700 bg-yellow-950 px-4 py-2 text-sm text-yellow-300">
            <span className="font-semibold">Maintenance mode is ON.</span>
            <Link href="/admin/settings" className="underline opacity-70 hover:opacity-100">Turn off</Link>
          </div>
        )}
        {!settings.signupEnabled && (
          <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-950 px-4 py-2 text-sm text-red-300">
            <span className="font-semibold">Signup is DISABLED.</span>
            <Link href="/admin/settings" className="underline opacity-70 hover:opacity-100">Enable</Link>
          </div>
        )}
        {unverifiedUsers > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-800 bg-blue-950 px-4 py-2 text-sm text-blue-300">
            <span><strong>{unverifiedUsers}</strong> user{unverifiedUsers > 1 ? 's' : ''} pending email verification.</span>
            <Link href="/admin/users" className="underline opacity-70 hover:opacity-100">Review</Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-800 bg-gray-900 p-5">
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Settings summary */}
      <div className="mt-8 rounded-lg border border-gray-800 bg-gray-900 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Platform Settings</h2>
          <Link href="/admin/settings" className="text-xs text-blue-400 hover:underline">Edit →</Link>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <dt className="text-gray-500">Signup</dt>
          <dd className={settings.signupEnabled ? 'text-green-400' : 'text-red-400'}>
            {settings.signupEnabled ? 'Open' : 'Closed'}
          </dd>
          <dt className="text-gray-500">Email confirm</dt>
          <dd>{settings.requireEmailConfirm ? 'Required' : 'Not required'}</dd>
          <dt className="text-gray-500">Default credits</dt>
          <dd>{settings.defaultCredits}</dd>
          <dt className="text-gray-500">Default sub status</dt>
          <dd>{settings.defaultSubStatus}</dd>
          <dt className="text-gray-500">Maintenance</dt>
          <dd className={settings.maintenanceMode ? 'text-yellow-400' : 'text-gray-400'}>
            {settings.maintenanceMode ? 'ON' : 'Off'}
          </dd>
        </dl>
      </div>
    </div>
  )
}
