import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getWorkspaceForUser } from '@/lib/workspace'
import { getWorkspaceFiles } from '@/lib/workspace-files'
import { WorkspaceShell } from '@/components/dashboard/WorkspaceShell'

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [workspace, resolvedSearchParams] = await Promise.all([
    getWorkspaceForUser(session.user.id),
    searchParams ?? Promise.resolve({}),
  ])

  const fileState = await getWorkspaceFiles(workspace.id)

  return (
    <WorkspaceShell
      workspaceName={workspace.name}
      pages={workspace.pages}
      selectedPageId={resolvedSearchParams.page}
      rootFolders={fileState.folders}
      rootFiles={fileState.files}
    />
  )
}
