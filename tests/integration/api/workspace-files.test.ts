import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prismaMock } from '../../setup/prisma-mock'
import { setAuthenticatedUser, setUnauthenticated } from '../../setup/auth-mock'

vi.mock('@/lib/workspace-storage', () => ({
  storeWorkspaceFile: vi.fn().mockResolvedValue({
    storageKey: 'stored-file.txt',
    absolutePath: '/tmp/stored-file.txt',
    relativePath: 'workspace-1/stored-file.txt',
    safeName: 'notes.txt',
  }),
  extractInlineTextContent: vi.fn().mockReturnValue('hello world'),
}))

vi.mock('@/lib/workspace-files', () => ({
  ensureWorkspaceFileStructure: vi.fn().mockResolvedValue([]),
  getWorkspaceFiles: vi.fn().mockResolvedValue({
    folders: [
      { id: 'folder-1', workspaceId: 'workspace-1', name: 'Inbox', parentId: null, createdAt: new Date(), updatedAt: new Date() },
    ],
    files: [
      {
        id: 'file-1',
        workspaceId: 'workspace-1',
        folderId: null,
        name: 'brief.txt',
        path: 'brief.txt',
        mimeType: 'text/plain',
        sizeBytes: 1024,
        content: 'hello',
        storageKey: 'brief.txt',
        createdBy: 'user',
        description: null,
        indexed: false,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  }),
}))

describe('/api/workspace/files', () => {
  const workspace = {
    id: 'workspace-1',
    userId: 'user-1',
    name: 'My Workspace',
    createdAt: new Date('2026-04-22T00:00:00Z'),
    updatedAt: new Date('2026-04-22T00:00:00Z'),
    pages: [
      {
        id: 'root-page',
        workspaceId: 'workspace-1',
        parentId: null,
        title: 'Home',
        pageType: 'standard',
        status: 'active',
        position: 0,
        content: { text: '' },
        isRoot: true,
        createdAt: new Date('2026-04-22T00:00:00Z'),
        updatedAt: new Date('2026-04-22T00:00:00Z'),
      },
    ],
  }

  beforeEach(() => {
    prismaMock.workspace.findUnique.mockResolvedValue(workspace as never)
    prismaMock.workspaceFolder.findMany.mockResolvedValue([] as never)
    prismaMock.workspaceFolder.createMany.mockResolvedValue({ count: 3 } as never)
    prismaMock.workspaceFile.findMany.mockResolvedValue([] as never)
  })

  it('returns 401 for unauthenticated GET', async () => {
    setUnauthenticated()
    const { GET } = await import('@/app/api/workspace/files/route')

    const response = await GET(new Request('http://localhost/api/workspace/files'))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns folders and files for authenticated GET', async () => {
    setAuthenticatedUser({ id: 'user-1' })
    const { GET } = await import('@/app/api/workspace/files/route')
    const response = await GET(new Request('http://localhost/api/workspace/files'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.folders).toHaveLength(1)
    expect(data.files).toHaveLength(1)
  })

  it('creates a workspace file from multipart POST', async () => {
    setAuthenticatedUser({ id: 'user-1' })
    prismaMock.workspaceFile.create.mockResolvedValue({
      id: 'file-1',
      workspaceId: 'workspace-1',
      folderId: null,
      name: 'notes.txt',
      path: 'notes.txt',
      mimeType: 'text/plain',
      sizeBytes: 11,
      content: 'hello world',
      storageKey: 'stored-file.txt',
      createdBy: 'user',
      description: 'Test file',
      indexed: false,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const formData = new FormData()
    formData.set('file', new Blob(['hello world'], { type: 'text/plain' }), 'notes.txt')
    formData.set('description', 'Test file')

    const { POST } = await import('@/app/api/workspace/files/route')
    const response = await POST({
      formData: async () => formData,
    } as Request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.file.name).toBe('notes.txt')
    expect(prismaMock.workspaceFile.create).toHaveBeenCalled()
  })
})
