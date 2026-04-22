import { prisma } from '@/lib/prisma'

export async function ensureWorkspaceFileStructure(workspaceId: string) {
  const existingRootFolders = await prisma.workspaceFolder.findMany({
    where: {
      workspaceId,
      parentId: null,
    },
    orderBy: [{ createdAt: 'asc' }],
  })

  if (existingRootFolders.length > 0) {
    return existingRootFolders
  }

  await prisma.workspaceFolder.createMany({
    data: [
      { workspaceId, name: 'Inbox' },
      { workspaceId, name: 'Projects' },
      { workspaceId, name: 'Notes' },
    ],
  })

  return prisma.workspaceFolder.findMany({
    where: {
      workspaceId,
      parentId: null,
    },
    orderBy: [{ createdAt: 'asc' }],
  })
}

export async function getWorkspaceFiles(workspaceId: string, folderId?: string) {
  await ensureWorkspaceFileStructure(workspaceId)

  const [folders, files] = await Promise.all([
    prisma.workspaceFolder.findMany({
      where: {
        workspaceId,
        parentId: folderId ?? null,
      },
      orderBy: [{ createdAt: 'asc' }],
    }),
    prisma.workspaceFile.findMany({
      where: {
        workspaceId,
        folderId: folderId ?? null,
        deletedAt: null,
      },
      orderBy: [{ createdAt: 'desc' }],
    }),
  ])

  return {
    folders,
    files,
  }
}
