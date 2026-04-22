import { describe, expect, it } from 'vitest'
import { prismaMock } from '../../setup/prisma-mock'

describe('workspace bootstrap', () => {
  it('returns an existing workspace with nested page tree', async () => {
    const now = new Date('2026-04-22T07:00:00Z')
    prismaMock.workspace.findUnique.mockResolvedValue({
      id: 'workspace-1',
      userId: 'user-1',
      name: 'My Workspace',
      createdAt: now,
      updatedAt: now,
      pages: [
        {
          id: 'root',
          workspaceId: 'workspace-1',
          parentId: null,
          title: 'Home',
          pageType: 'standard',
          status: 'active',
          position: 0,
          content: null,
          isRoot: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'page-1',
          workspaceId: 'workspace-1',
          parentId: 'root',
          title: 'Projects',
          pageType: 'database',
          status: 'active',
          position: 0,
          content: null,
          isRoot: false,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'page-2',
          workspaceId: 'workspace-1',
          parentId: 'page-1',
          title: 'Roadmap',
          pageType: 'standard',
          status: 'active',
          position: 0,
          content: null,
          isRoot: false,
          createdAt: now,
          updatedAt: now,
        },
      ],
    } as never)

    const { getWorkspaceForUser } = await import('@/lib/workspace')
    const workspace = await getWorkspaceForUser('user-1')

    expect(workspace.rootPage?.title).toBe('Home')
    expect(workspace.pages).toHaveLength(1)
    expect(workspace.pages[0].title).toBe('Projects')
    expect(workspace.pages[0].children[0].title).toBe('Roadmap')
  })

  it('bootstraps a workspace and root page for a new user', async () => {
    const now = new Date('2026-04-22T07:00:00Z')
    prismaMock.workspace.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'workspace-1',
        userId: 'user-1',
        name: 'My Workspace',
        createdAt: now,
        updatedAt: now,
        pages: [
          {
            id: 'root',
            workspaceId: 'workspace-1',
            parentId: null,
            title: 'Home',
            pageType: 'standard',
            status: 'active',
            position: 0,
            content: { text: '' },
            isRoot: true,
            createdAt: now,
            updatedAt: now,
          },
        ],
      } as never)
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => unknown) => {
      return callback(prismaMock)
    })
    prismaMock.workspace.create.mockResolvedValue({
      id: 'workspace-1',
      userId: 'user-1',
      name: 'My Workspace',
      createdAt: now,
      updatedAt: now,
    } as never)
    prismaMock.page.create.mockResolvedValue({
      id: 'root',
      workspaceId: 'workspace-1',
      parentId: null,
      title: 'Home',
      pageType: 'standard',
      status: 'active',
      position: 0,
      content: { text: '' },
      isRoot: true,
      createdAt: now,
      updatedAt: now,
    } as never)

    const { ensureWorkspaceForUser } = await import('@/lib/workspace')
    const workspace = await ensureWorkspaceForUser('user-1')

    expect(prismaMock.workspace.create).toHaveBeenCalled()
    expect(prismaMock.page.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workspaceId: 'workspace-1',
          title: 'Home',
          isRoot: true,
          content: { text: '' },
        }),
      })
    )
    expect(workspace.rootPage?.title).toBe('Home')
    expect(workspace.pages).toHaveLength(0)
  })
})

describe('workspace page content helpers', () => {
  it('creates starter database content for database pages', async () => {
    const { buildWorkspacePageContent } = await import('@/lib/workspace')

    const content = buildWorkspacePageContent('database', 'Track projects')

    expect(content.text).toBe('Track projects')
    expect(content.database?.fields.map((field) => field.name)).toEqual(['Name', 'Status'])
    expect(content.database?.rows).toEqual([])
  })

  it('preserves database fields when updating text content', async () => {
    const { buildWorkspacePageContent } = await import('@/lib/workspace')

    const content = buildWorkspacePageContent('database', 'Updated copy', {
      text: 'Old copy',
      database: {
        fields: [{ id: 'priority', name: 'Priority', type: 'select' }],
        rows: [],
      },
    })

    expect(content.text).toBe('Updated copy')
    expect(content.database?.fields).toHaveLength(1)
    expect(content.database?.fields[0].name).toBe('Priority')
  })
})
