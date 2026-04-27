'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SubscriptionStatus, UserRole } from '@prisma/client'

type UserRow = {
  id: string
  email: string
  name: string | null
  role: UserRole
  subscriptionStatus: SubscriptionStatus
  creditsBalance: number
  createdAt: Date
}

const statusColor: Record<SubscriptionStatus, string> = {
  active: 'bg-green-900 text-green-300',
  inactive: 'bg-gray-800 text-gray-400',
  past_due: 'bg-yellow-900 text-yellow-300',
  cancelled: 'bg-red-900 text-red-300',
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState('')

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <input
        type="text"
        placeholder="Search by email or name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs uppercase tracking-wider text-gray-500">
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Role</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Credits</th>
              <th className="pb-2 pr-4">Joined</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                <td className="py-2 pr-4 font-mono text-xs">{u.email}</td>
                <td className="py-2 pr-4 text-gray-300">{u.name ?? '—'}</td>
                <td className="py-2 pr-4">
                  {u.role === 'admin' ? (
                    <span className="rounded bg-purple-900 px-2 py-0.5 text-xs text-purple-300">
                      admin
                    </span>
                  ) : (
                    <span className="text-gray-500">user</span>
                  )}
                </td>
                <td className="py-2 pr-4">
                  <span className={`rounded px-2 py-0.5 text-xs ${statusColor[u.subscriptionStatus]}`}>
                    {u.subscriptionStatus}
                  </span>
                </td>
                <td className="py-2 pr-4 tabular-nums">{u.creditsBalance}</td>
                <td className="py-2 pr-4 text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-600">{filtered.length} of {users.length} users</p>
    </div>
  )
}
