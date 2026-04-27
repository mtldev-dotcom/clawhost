import { getPlatformSettings } from '@/lib/platform-settings'
import { SettingsClient } from './client'

export const metadata = { title: 'Admin — Settings' }

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings()
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Platform Settings</h1>
      <p className="mb-8 text-sm text-gray-500">
        Controls signup, email verification, and defaults for new accounts.
      </p>
      <SettingsClient settings={settings} />
    </div>
  )
}
