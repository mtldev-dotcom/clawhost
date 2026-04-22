import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWorkspaceForUser } from '@/lib/workspace'
import { readWorkspaceFile } from '@/lib/workspace-storage'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspace = await getWorkspaceForUser(session.user.id)
    const { id } = await params

    const file = await prisma.workspaceFile.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
        deletedAt: null,
      },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const buffer = await readWorkspaceFile(workspace.id, file.storageKey)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.name}"`,
      },
    })
  } catch (error) {
    console.error('Workspace file download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
