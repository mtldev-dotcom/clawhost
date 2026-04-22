import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const MAX_INLINE_TEXT_BYTES = 100 * 1024
const DEFAULT_STORAGE_ROOT = path.join(process.cwd(), 'data', 'workspace')

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-')
}

export function getWorkspaceStorageRoot() {
  return process.env.WORKSPACE_STORAGE_ROOT || DEFAULT_STORAGE_ROOT
}

export async function storeWorkspaceFile({
  workspaceId,
  fileName,
  bytes,
}: {
  workspaceId: string
  fileName: string
  bytes: Uint8Array
}) {
  const extension = path.extname(fileName)
  const safeName = sanitizeFileName(path.basename(fileName, extension)) || 'file'
  const storageKey = `${crypto.randomUUID()}${extension}`
  const relativePath = path.join(workspaceId, storageKey)
  const absolutePath = path.join(getWorkspaceStorageRoot(), relativePath)

  await mkdir(path.dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, bytes)

  return {
    storageKey,
    absolutePath,
    relativePath,
    safeName: `${safeName}${extension}`,
  }
}

export function extractInlineTextContent(file: File, text: string) {
  const isTextLike =
    file.type.startsWith('text/') ||
    ['application/json', 'application/xml', 'text/csv'].includes(file.type)

  if (!isTextLike) {
    return null
  }

  return Buffer.byteLength(text, 'utf8') <= MAX_INLINE_TEXT_BYTES ? text : null
}
