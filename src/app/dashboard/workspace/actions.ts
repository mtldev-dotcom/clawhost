'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  buildWorkspacePageContent,
  databaseFieldTypeOptions,
  getWorkspaceForUser,
  workspacePageTypeOptions,
} from '@/lib/workspace'
import type { DatabaseFieldDefinition } from '@/lib/workspace'
import { revalidatePath } from 'next/cache'

const validPageTypes = new Set(workspacePageTypeOptions.map((option) => option.value))
const validDatabaseFieldTypes = new Set(databaseFieldTypeOptions.map((option) => option.value))

function revalidateWorkspacePaths() {
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/workspace')
}

async function getOwnedWorkspacePage(userId: string, pageId: string, pageType?: 'database') {
  const workspace = await getWorkspaceForUser(userId)

  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      workspaceId: workspace.id,
      status: 'active',
      ...(pageType ? { pageType } : {}),
    },
  })

  if (!page) {
    throw new Error(pageType ? 'Database page not found' : 'Page not found')
  }

  return { workspace, page }
}

export async function createWorkspacePage(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const title = String(formData.get('title') || '').trim()
  const parentIdRaw = String(formData.get('parentId') || '').trim()
  const pageTypeRaw = String(formData.get('pageType') || 'standard').trim()
  const pageType = validPageTypes.has(pageTypeRaw) ? pageTypeRaw : 'standard'

  if (!title) {
    throw new Error('Title is required')
  }

  const workspace = await getWorkspaceForUser(session.user.id)
  const parentId = parentIdRaw || workspace.rootPage?.id || null

  if (!parentId) {
    throw new Error('Workspace root page not found')
  }

  const parentPage = await prisma.page.findFirst({
    where: {
      id: parentId,
      workspaceId: workspace.id,
      status: 'active',
    },
  })

  if (!parentPage) {
    throw new Error('Parent page not found')
  }

  const siblingsCount = await prisma.page.count({
    where: {
      workspaceId: workspace.id,
      parentId,
      status: 'active',
    },
  })

  await prisma.page.create({
    data: {
      workspaceId: workspace.id,
      parentId,
      title,
      pageType,
      position: siblingsCount,
      content: buildWorkspacePageContent(pageType, ''),
    },
  })

  revalidateWorkspacePaths()
}

export async function updateWorkspacePage(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const pageId = String(formData.get('pageId') || '').trim()
  const title = String(formData.get('title') || '').trim()
  const content = String(formData.get('content') || '')

  if (!pageId) {
    throw new Error('Page id is required')
  }

  if (!title) {
    throw new Error('Title is required')
  }

  const { page } = await getOwnedWorkspacePage(session.user.id, pageId)

  await prisma.page.update({
    where: { id: page.id },
    data: {
      title,
      content: buildWorkspacePageContent(page.pageType, content, page.content),
    },
  })

  revalidateWorkspacePaths()
}

export async function addDatabaseField(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const pageId = String(formData.get('pageId') || '').trim()
  const fieldName = String(formData.get('fieldName') || '').trim()
  const fieldTypeRaw = String(formData.get('fieldType') || 'text').trim()
  const fieldType = validDatabaseFieldTypes.has(fieldTypeRaw) ? fieldTypeRaw : 'text'

  if (!pageId) {
    throw new Error('Page id is required')
  }

  if (!fieldName) {
    throw new Error('Field name is required')
  }

  const { page } = await getOwnedWorkspacePage(session.user.id, pageId, 'database')
  const currentContent = buildWorkspacePageContent('database', '', page.content)
  const currentFields = currentContent.database?.fields ?? []
  const normalizedFieldName = fieldName.toLowerCase()

  if (currentFields.some((field) => field.name.toLowerCase() === normalizedFieldName)) {
    throw new Error('Field already exists')
  }

  const nextFields: DatabaseFieldDefinition[] = [
    ...currentFields,
    {
      id: globalThis.crypto.randomUUID(),
      name: fieldName,
      type: fieldType as DatabaseFieldDefinition['type'],
    },
  ]

  await prisma.page.update({
    where: { id: page.id },
    data: {
      content: {
        text: currentContent.text,
        database: {
          fields: nextFields,
          rows: currentContent.database?.rows ?? [],
        },
      },
    },
  })

  revalidateWorkspacePaths()
}

export async function addDatabaseRow(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const pageId = String(formData.get('pageId') || '').trim()
  if (!pageId) {
    throw new Error('Page id is required')
  }

  const { page } = await getOwnedWorkspacePage(session.user.id, pageId, 'database')
  const currentContent = buildWorkspacePageContent('database', '', page.content)
  const fields = currentContent.database?.fields ?? []

  if (fields.length === 0) {
    throw new Error('Add at least one field before creating rows')
  }

  const nextRow: Record<string, string | number | null> = {
    id: globalThis.crypto.randomUUID(),
  }

  for (const field of fields) {
    const rawValue = String(formData.get(`field_${field.id}`) || '').trim()

    if (!rawValue) {
      nextRow[field.id] = null
      continue
    }

    nextRow[field.id] = field.type === 'number' ? Number(rawValue) : rawValue
  }

  await prisma.page.update({
    where: { id: page.id },
    data: {
      content: {
        text: currentContent.text,
        database: {
          fields,
          rows: [...(currentContent.database?.rows ?? []), nextRow],
        },
      },
    },
  })

  revalidateWorkspacePaths()
}

export async function archiveWorkspacePage(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const pageId = String(formData.get('pageId') || '').trim()
  if (!pageId) {
    throw new Error('Page id is required')
  }

  const { page } = await getOwnedWorkspacePage(session.user.id, pageId)

  if (page.isRoot) {
    throw new Error('Root page cannot be archived')
  }

  await prisma.page.update({
    where: { id: page.id },
    data: {
      status: 'archived',
    },
  })

  revalidateWorkspacePaths()
}
