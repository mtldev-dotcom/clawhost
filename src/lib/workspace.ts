import { Prisma, type Page, type Workspace } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type WorkspacePageNode = Pick<
  Page,
  'id' | 'title' | 'pageType' | 'status' | 'position' | 'parentId' | 'content' | 'isRoot' | 'createdAt' | 'updatedAt'
> & {
  children: WorkspacePageNode[]
}

export type WorkspaceWithTree = Workspace & {
  pages: WorkspacePageNode[]
  rootPage: WorkspacePageNode | null
}

export interface DatabaseFieldDefinition {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'date'
}

export interface WorkspacePageContent {
  text: string
  database?: {
    fields: DatabaseFieldDefinition[]
    rows: Record<string, string | number | null>[]
  }
}

export const workspacePageTypeOptions = [
  { value: 'standard', label: 'Standard page' },
  { value: 'database', label: 'Database' },
  { value: 'board', label: 'Board' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'capture', label: 'Capture' },
] as const

export const databaseFieldTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'date', label: 'Date' },
] as const

function isJsonObject(value: Prisma.JsonValue | null | undefined): value is Prisma.JsonObject {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function getWorkspacePageContent(page: Pick<Page, 'content' | 'pageType'>): WorkspacePageContent {
  const baseText = isJsonObject(page.content) && typeof page.content.text === 'string' ? page.content.text : ''

  const database =
    page.pageType === 'database' &&
    isJsonObject(page.content) &&
    isJsonObject(page.content.database) &&
    Array.isArray(page.content.database.fields)
      ? {
          fields: page.content.database.fields
            .filter((field): field is DatabaseFieldDefinition => {
              return (
                !!field &&
                typeof field === 'object' &&
                !Array.isArray(field) &&
                typeof field.id === 'string' &&
                typeof field.name === 'string' &&
                typeof field.type === 'string'
              )
            })
            .map((field) => ({
              id: field.id,
              name: field.name,
              type: ['text', 'number', 'select', 'date'].includes(field.type) ? field.type as DatabaseFieldDefinition['type'] : 'text',
            })),
          rows:
            Array.isArray(page.content.database.rows) && page.content.database.rows.every((row) => !!row && typeof row === 'object' && !Array.isArray(row))
              ? (page.content.database.rows as Record<string, string | number | null>[])
              : [],
        }
      : undefined

  return {
    text: baseText,
    ...(database ? { database } : {}),
  }
}

export function buildWorkspacePageContent(pageType: Page['pageType'], text: string, existingContent?: Prisma.JsonValue | null): WorkspacePageContent {
  const normalizedExisting = isJsonObject(existingContent) ? existingContent : undefined
  const existingDatabase =
    pageType === 'database' &&
    normalizedExisting &&
    isJsonObject(normalizedExisting.database) &&
    Array.isArray(normalizedExisting.database.fields)
      ? getWorkspacePageContent({ content: existingContent ?? null, pageType }).database
      : undefined

  return {
    text,
    ...(pageType === 'database'
      ? {
          database: existingDatabase ?? {
            fields: [
              { id: 'title', name: 'Name', type: 'text' },
              { id: 'status', name: 'Status', type: 'select' },
            ],
            rows: [],
          },
        }
      : {}),
  }
}

function buildPageTree(pages: Page[]): { pages: WorkspacePageNode[]; rootPage: WorkspacePageNode | null } {
  const nodeMap = new Map<string, WorkspacePageNode>()

  for (const page of pages) {
    nodeMap.set(page.id, {
      id: page.id,
      title: page.title,
      pageType: page.pageType,
      status: page.status,
      position: page.position,
      parentId: page.parentId,
      content: page.content,
      isRoot: page.isRoot,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      children: [],
    })
  }

  let rootPage: WorkspacePageNode | null = null
  const topLevel: WorkspacePageNode[] = []

  for (const page of pages) {
    const node = nodeMap.get(page.id)
    if (!node) continue

    if (page.isRoot) {
      rootPage = node
      continue
    }

    if (page.parentId) {
      const parent = nodeMap.get(page.parentId)
      if (parent) {
        parent.children.push(node)
        continue
      }
    }

    topLevel.push(node)
  }

  const sortTree = (nodes: WorkspacePageNode[]) => {
    nodes.sort((a, b) => a.position - b.position || a.createdAt.getTime() - b.createdAt.getTime())
    nodes.forEach((node) => sortTree(node.children))
  }

  sortTree(topLevel)
  if (rootPage) sortTree(rootPage.children)

  return { pages: rootPage?.children ?? topLevel, rootPage }
}

export async function ensureWorkspaceForUser(userId: string): Promise<WorkspaceWithTree> {
  const fetchWorkspace = async () =>
    prisma.workspace.findUnique({
      where: { userId },
      include: {
        pages: {
          where: { status: 'active' },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
      },
    })

  const existingWorkspace = await fetchWorkspace()

  if (existingWorkspace) {
    const tree = buildPageTree(existingWorkspace.pages)
    return {
      ...existingWorkspace,
      pages: tree.pages,
      rootPage: tree.rootPage,
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const createdWorkspace = await tx.workspace.create({
        data: {
          userId,
          name: 'My Workspace',
        },
      })

      await tx.page.create({
        data: {
          workspaceId: createdWorkspace.id,
          title: 'Home',
          pageType: 'standard',
          isRoot: true,
          content: buildWorkspacePageContent('standard', ''),
        },
      })
    })
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
      throw error
    }
  }

  const workspace = await fetchWorkspace()
  if (!workspace) {
    throw new Error('Workspace bootstrap failed')
  }

  const hasRoot = workspace.pages.some((page) => page.isRoot)
  if (!hasRoot) {
    await prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: 'Home',
        pageType: 'standard',
        isRoot: true,
        content: buildWorkspacePageContent('standard', ''),
      },
    })
    const refreshedWorkspace = await fetchWorkspace()
    if (!refreshedWorkspace) {
      throw new Error('Workspace bootstrap failed after root creation')
    }
    const refreshedTree = buildPageTree(refreshedWorkspace.pages)
    return {
      ...refreshedWorkspace,
      pages: refreshedTree.pages,
      rootPage: refreshedTree.rootPage,
    }
  }

  const tree = buildPageTree(workspace.pages)
  return {
    ...workspace,
    pages: tree.pages,
    rootPage: tree.rootPage,
  }
}

export async function getWorkspaceForUser(userId: string): Promise<WorkspaceWithTree> {
  return ensureWorkspaceForUser(userId)
}
