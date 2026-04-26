export const dynamic = 'force-dynamic'

async function getStatus() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/status`, { cache: 'no-store' })
    return res.json()
  } catch {
    return { status: 'error' }
  }
}

export default async function StatusPage() {
  const data = await getStatus()
  return (
    <div className="mx-auto max-w-md p-8 space-y-4">
      <h1 className="text-2xl font-bold">System Status</h1>
      <div className="space-y-2 rounded-lg border p-4 text-sm">
        <div className="flex justify-between"><span>App</span><span className={data.status === 'ok' ? 'text-green-600' : 'text-red-600'}>{data.status === 'ok' ? '✓ Operational' : '✗ Degraded'}</span></div>
        <div className="flex justify-between"><span>Database</span><span className={data.db === 'ok' ? 'text-green-600' : 'text-red-600'}>{data.db === 'ok' ? '✓ Operational' : '✗ Unreachable'}</span></div>
        <div className="flex justify-between"><span>Updated</span><span className="text-muted-foreground">{data.timestamp ?? '—'}</span></div>
      </div>
    </div>
  )
}
