import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getWorkspaceForUser } from '@/lib/workspace'

export const dynamic = 'force-dynamic'

export default async function TodayPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const workspace = await getWorkspaceForUser(session.user.id)

  const todayPlan = await prisma.page.findFirst({
    where: {
      workspaceId: workspace.id,
      pageType: 'capture',
      status: 'active',
      OR: [
        { title: { contains: 'Daily Plan', mode: 'insensitive' } },
        { title: { contains: 'Today', mode: 'insensitive' } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
  })

  const openActions = await prisma.actionItem.findMany({
    where: { workspaceId: workspace.id, status: 'open' },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { sourcePage: { select: { id: true, title: true } } },
  })

  const grouped = new Map<string, typeof openActions>()
  for (const a of openActions) {
    const key = a.sourcePage?.title ?? 'Unsorted'
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(a)
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Today</h1>
        <p className="text-sm text-muted-foreground">Your plan and open action items.</p>
      </header>

      <section>
        <h2 className="text-lg font-medium mb-2">Plan</h2>
        {todayPlan ? (
          <div className="rounded-lg border p-4 whitespace-pre-wrap text-sm">
            {(todayPlan.content as { text?: string })?.text ?? ''}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No Daily Plan yet — create one from the workspace empty-state templates.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Open action items</h2>
        {grouped.size === 0 && <p className="text-sm text-muted-foreground">No action items extracted yet.</p>}
        {[...grouped.entries()].map(([source, items]) => (
          <div key={source} className="mb-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{source}</p>
            <ul className="space-y-1">
              {items.map(a => (
                <li key={a.id} className="text-sm rounded-md border px-3 py-2">{a.text}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  )
}
