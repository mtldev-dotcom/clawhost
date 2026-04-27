'use client'

import { useState, useTransition } from 'react'
import type { SubscriptionStatus } from '@prisma/client'
import { savePlatformSettings } from './actions'

type Settings = {
  signupEnabled: boolean
  requireEmailConfirm: boolean
  defaultCredits: number
  defaultSubStatus: SubscriptionStatus
  maintenanceMode: boolean
}

const SUB_STATUSES: SubscriptionStatus[] = ['inactive', 'active', 'past_due', 'cancelled']

function Toggle({
  label,
  description,
  checked,
  onChange,
  danger,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  danger?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
          checked
            ? danger
              ? 'bg-red-600'
              : 'bg-emerald-600'
            : 'bg-gray-700'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export function SettingsClient({ settings: initial }: { settings: Settings }) {
  const [s, setS] = useState<Settings>(initial)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setS((prev) => ({ ...prev, [key]: value }))
    setStatus('idle')
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await savePlatformSettings(s)
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 2500)
      } catch {
        setStatus('error')
      }
    })
  }

  return (
    <div className="max-w-xl">
      <div className="rounded-lg border border-gray-800 bg-gray-900 px-5 divide-y divide-gray-800">

        {/* Signup */}
        <Toggle
          label="Signup enabled"
          description="Allow new users to register. Disable to close registration entirely."
          checked={s.signupEnabled}
          onChange={(v) => set('signupEnabled', v)}
        />

        {/* Email confirm */}
        <Toggle
          label="Require email confirmation"
          description="New accounts are created with emailVerified = false and cannot log in until an admin verifies them from the Users page."
          checked={s.requireEmailConfirm}
          onChange={(v) => set('requireEmailConfirm', v)}
        />

        {/* Maintenance mode */}
        <Toggle
          label="Maintenance mode"
          description="Flag to indicate the platform is under maintenance. Shown in the admin overview."
          checked={s.maintenanceMode}
          onChange={(v) => set('maintenanceMode', v)}
          danger
        />

        {/* Default credits */}
        <div className="py-4">
          <label className="block text-sm font-medium">Default credits for new users</label>
          <p className="mt-0.5 mb-2 text-xs text-gray-500">
            Credits granted automatically on successful registration (0 = none).
          </p>
          <input
            type="number"
            min={0}
            value={s.defaultCredits}
            onChange={(e) => set('defaultCredits', Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-28 rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        {/* Default subscription status */}
        <div className="py-4">
          <label className="block text-sm font-medium">Default subscription status</label>
          <p className="mt-0.5 mb-2 text-xs text-gray-500">
            Subscription status assigned to new users on registration.
          </p>
          <select
            value={s.defaultSubStatus}
            onChange={(e) => set('defaultSubStatus', e.target.value as SubscriptionStatus)}
            className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm focus:outline-none"
          >
            {SUB_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded bg-blue-700 px-5 py-2 text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save settings'}
        </button>
        {status === 'saved' && (
          <span className="text-sm text-emerald-400">Settings saved.</span>
        )}
        {status === 'error' && (
          <span className="text-sm text-red-400">Save failed — check console.</span>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-xs text-gray-500">
        <p className="font-medium text-gray-400 mb-1">How email confirmation works (no email infra needed)</p>
        <p>When enabled, new registrations get <code className="bg-gray-800 px-1 rounded">emailVerified = false</code> and are blocked from logging in. Go to <strong>Users → [user] → Verify Email</strong> to manually approve them.</p>
      </div>
    </div>
  )
}
