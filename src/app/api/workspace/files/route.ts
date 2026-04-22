import path from 'node:path'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWorkspaceForUser } from '@/lib/workspace'
import { ensureWorkspaceFileStructure, getWorkspaceFiles } from '@/lib/workspace-files'
import { extractInlineTextContent, storeWorkspaceFile } from '@/lib/workspace-storage'

const MAX_FILE_BYTES = 50 * 1024 * 1024

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspace = await getWorkspaceForUser(session.user.id)
    const { searchParams } = new URL(req.url)
    const folderId = searchParams.get('folderId') || undefined
    const search = searchParams.get('search')?.trim()

    await ensureWorkspaceFileStructure(workspace.id)

    if (search) {
      const [folders, files] = await Promise.all([
        prisma.workspaceFolder.findMany({
          where: {
            workspaceId: workspace.id,
            name: { contains: search, mode: 'insensitive' },
          },
          orderBy: [{ createdAt: 'asc' }],
        }),
        prisma.workspaceFile.findMany({
          where: {
            workspaceId: workspace.id,
            deletedAt: null,
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          },
          orderBy: [{ createdAt: 'desc' }],
        }),
      ])

      return NextResponse.json({ folders, files })
    }

    const state = await getWorkspaceFiles(workspace.id, folderId)
    return NextResponse.json(state)
  } catch (error) {
    console.error('Workspace files GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspace = await getWorkspaceForUser(session.user.id)
    const formData = await req.formData()
    const file = formData.get('file')
    const folderId = String(formData.get('folderId') || '').trim() || null
    const description = String(formData.get('description') || '').trim() || null

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!file.name.trim()) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 })
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File size must be 50MB or less' }, { status: 400 })
    }

    let folder = null
    if (folderId) {
      folder = await prisma.workspaceFolder.findFirst({
        where: {
          id: folderId,
          workspaceId: workspace.id,
        },
      })

      if (!folder) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
      }
    }

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const text = new TextDecoder().decode(bytes)
    const stored = await storeWorkspaceFile({
      workspaceId: workspace.id,
      fileName: file.name,
      bytes,
    })

    const savedFile = await prisma.workspaceFile.create({
      data: {
        workspaceId: workspace.id,
        folderId: folder?.id ?? null,
        name: stored.safeName,
        path: folder ? path.posix.join(folder.name, stored.safeName) : stored.safeName,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        content: extractInlineTextContent(file, text),
        storageKey: stored.storageKey,
        createdBy: 'user',
        description,
      },
    })

    return NextResponse.json({ file: savedFile }, { status: 201 })
  } catch (error) {
    console.error('Workspace files POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
