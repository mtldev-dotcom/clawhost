import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getWorkspaceForUser } from '@/lib/workspace'
import { triageCapture } from '@/app/dashboard/workspace/actions'

export default async function InboxPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const workspace = await getWorkspaceForUser(session.user.id)
  const inbox = await prisma.page.findFirst({
    where: { workspaceId: workspace.id, title: 'Inbox', parentId: workspace.rootPage?.id, status: 'active' },
  })
  const captures = inbox
    ? await prisma.page.findMany({
        where: { workspaceId: workspace.id, parentId: inbox.id, status: 'active' },
        orderBy: { createdAt: 'asc' },
      })
    : []

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-2">Inbox</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {captures.length} capture{captures.length === 1 ? '' : 's'} to triage.
      </p>
      {captures.length === 0 && (
        <p className="text-sm text-muted-foreground">Nothing to triage. Captures land here as you make them.</p>
      )}
      <div className="space-y-3">
        {captures.map((c) => (
          <div key={c.id} className="rounded-lg border p-4">
            <p className="font-medium">{c.title}</p>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
              {(c.content as { text?: string })?.text ?? ''}
            </p>
            <div className="mt-3 flex gap-2">
              <form action={triageCapture}>
                <input type="hidden" name="pageId" value={c.id} />
                <input type="hidden" name="action" value="move-projects" />
                <button
                  type="submit"
                  className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  Move to Projects
                </button>
              </form>
              <form action={triageCapture}>
                <input type="hidden" name="pageId" value={c.id} />
                <input type="hidden" name="action" value="archive" />
                <button
                  type="submit"
                  className="rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Archive
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
