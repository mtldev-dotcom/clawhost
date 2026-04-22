import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prismaMock } from '../../setup/prisma-mock'
import { setAuthenticatedUser, setUnauthenticated } from '../../setup/auth-mock'

vi.mock('@/lib/workspace-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/workspace-storage')>()
  return {
    ...actual,
    readWorkspaceFile: vi.fn().mockResolvedValue(Buffer.from('hello world')),
  }
})

describe('/api/workspace/files/[id]/download', () => {
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
  })

  it('returns 401 for unauthenticated download', async () => {
    setUnauthenticated()
    const { GET } = await import('@/app/api/workspace/files/[id]/download/route')

    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ id: 'file-1' }),
    })

    expect(response.status).toBe(401)
  })

  it('returns 404 when file is missing', async () => {
    setAuthenticatedUser({ id: 'user-1' })
    prismaMock.workspaceFile.findFirst.mockResolvedValue(null)
    const { GET } = await import('@/app/api/workspace/files/[id]/download/route')

    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ id: 'file-1' }),
    })

    expect(response.status).toBe(404)
  })

  it('streams the requested file for the workspace owner', async () => {
    setAuthenticatedUser({ id: 'user-1' })
    prismaMock.workspaceFile.findFirst.mockResolvedValue({
      id: 'file-1',
      workspaceId: 'workspace-1',
      folderId: null,
      name: 'brief.txt',
      path: 'brief.txt',
      mimeType: 'text/plain',
      sizeBytes: 11,
      content: 'hello world',
      storageKey: 'stored-file.txt',
      createdBy: 'user',
      description: null,
      indexed: false,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const { GET } = await import('@/app/api/workspace/files/[id]/download/route')
    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ id: 'file-1' }),
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/plain')
    expect(response.headers.get('Content-Disposition')).toContain('brief.txt')
  })
})
