'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import type { User, Instance, SubscriptionStatus, UserRole } from '@prisma/client'
import { grantCredits, setSubscriptionStatus, setUserRole } from './actions'

type Props = {
  user: User & { instance: Instance | null }
}

const SUB_STATUSES: SubscriptionStatus[] = ['inactive', 'active', 'past_due', 'cancelled']
const ROLES: UserRole[] = ['user', 'admin']

export function UserDetailClient({ user }: Props) {
  const [creditAmount, setCreditAmount] = useState('')
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)

  function act(fn: () => Promise<void>) {
    startTransition(async () => {
      try {
        await fn()
        setFeedback('Saved')
        setTimeout(() => setFeedback(null), 2000)
      } catch {
        setFeedback('Error — check console')
      }
    })
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/users" className="text-sm text-gray-500 hover:text-gray-300">
          ← Users
        </Link>
        {feedback && (
          <span className="rounded bg-green-900 px-2 py-0.5 text-xs text-green-300">{feedback}</span>
        )}
      </div>

      <h1 className="mb-6 text-2xl font-semibold">{user.email}</h1>

      {/* Info */}
      <section className="mb-8 rounded-lg border border-gray-800 bg-gray-900 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          User Info
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <dt className="text-gray-500">ID</dt>
          <dd className="font-mono text-xs">{user.id}</dd>
          <dt className="text-gray-500">Name</dt>
          <dd>{user.name ?? '—'}</dd>
          <dt className="text-gray-500">Locale</dt>
          <dd>{user.locale}</dd>
          <dt className="text-gray-500">Credits Balance</dt>
          <dd className="tabular-nums">{user.creditsBalance}</dd>
          <dt className="text-gray-500">Lifetime Credits</dt>
          <dd className="tabular-nums">{user.lifetimeCreditsGranted}</dd>
          <dt className="text-gray-500">Telegram</dt>
          <dd>{user.telegramUserId ? `@${user.telegramUsername ?? user.telegramUserId}` : '—'}</dd>
          <dt className="text-gray-500">Joined</dt>
          <dd>{new Date(user.createdAt).toLocaleString()}</dd>
        </dl>
      </section>

      {/* Instance */}
      {user.instance && (
        <section className="mb-8 rounded-lg border border-gray-800 bg-gray-900 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Instance
          </h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-gray-500">Status</dt>
            <dd>{user.instance.status}</dd>
            <dt className="text-gray-500">Model</dt>
            <dd>{user.instance.activeModel ?? '—'}</dd>
            <dt className="text-gray-500">App URL</dt>
            <dd>
              {user.instance.appUrl ? (
                <a href={user.instance.appUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                  {user.instance.appUrl}
                </a>
              ) : '—'}
            </dd>
            <dt className="text-gray-500">Gateway Token</dt>
            <dd className="font-mono text-xs text-gray-500">
              {user.instance.gatewayToken ? '••••••••' + user.instance.gatewayToken.slice(-4) : '—'}
            </dd>
          </dl>
        </section>
      )}

      {/* Actions */}
      <section className="rounded-lg border border-gray-800 bg-gray-900 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Actions
        </h2>

        {/* Credits */}
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-400">Adjust credits (+ or −)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="e.g. 100 or -50"
              className="w-32 rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <button
              disabled={isPending || !creditAmount}
              onClick={() =>
                act(() => grantCredits(user.id, parseInt(creditAmount, 10)))
              }
              className="rounded bg-blue-700 px-3 py-1.5 text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Subscription status */}
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-400">Subscription status</label>
          <div className="flex gap-2">
            <select
              defaultValue={user.subscriptionStatus}
              onChange={(e) =>
                act(() => setSubscriptionStatus(user.id, e.target.value as SubscriptionStatus))
              }
              className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm focus:outline-none"
            >
              {SUB_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="mb-1 block text-sm text-gray-400">Role</label>
          <div className="flex gap-2">
            <select
              defaultValue={user.role}
              onChange={(e) =>
                act(() => setUserRole(user.id, e.target.value as UserRole))
              }
              className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </div>
  )
}
