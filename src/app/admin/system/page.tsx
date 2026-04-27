import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Admin — System' }

const statusColor: Record<string, string> = {
  active: 'bg-green-900 text-green-300',
  pending: 'bg-gray-800 text-gray-400',
  provisioning: 'bg-blue-900 text-blue-300',
  failed: 'bg-red-900 text-red-300',
  cancelled: 'bg-gray-800 text-gray-500',
}

export default async function AdminSystemPage() {
  const instances = await prisma.instance.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">System — Instances</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs uppercase tracking-wider text-gray-500">
              <th className="pb-2 pr-4">User</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Model</th>
              <th className="pb-2 pr-4">App URL</th>
              <th className="pb-2 pr-4">Provider</th>
              <th className="pb-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {instances.map((inst) => (
              <tr key={inst.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                <td className="py-2 pr-4 font-mono text-xs">{inst.user.email}</td>
                <td className="py-2 pr-4">
                  <span className={`rounded px-2 py-0.5 text-xs ${statusColor[inst.status] ?? 'bg-gray-800 text-gray-400'}`}>
                    {inst.status}
                  </span>
                </td>
                <td className="py-2 pr-4 text-gray-400">{inst.activeModel ?? '—'}</td>
                <td className="py-2 pr-4">
                  {inst.appUrl ? (
                    <a href={inst.appUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                      {inst.appUrl}
                    </a>
                  ) : '—'}
                </td>
                <td className="py-2 pr-4 text-gray-400">{inst.aiProvider ?? '—'}</td>
                <td className="py-2 text-gray-500">{new Date(inst.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {instances.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No instances</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
