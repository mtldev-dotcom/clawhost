import { prisma } from '@/lib/prisma'

export interface WorkspaceContextChunk {
  pageId: string
  pageTitle: string
  pageType: string
  snippet: string
}

export async function retrieveWorkspaceContext(
  workspaceId: string,
  query: string,
  limit = 5
): Promise<WorkspaceContextChunk[]> {
  if (!query.trim()) {
    const pages = await prisma.page.findMany({
      where: { workspaceId, status: 'active' },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: { id: true, title: true, pageType: true, content: true },
    })
    return pages.map(p => ({
      pageId: p.id,
      pageTitle: p.title,
      pageType: p.pageType,
      snippet: extractTextSnippet(p.content, 300),
    }))
  }

  const results = await prisma.$queryRaw<
    { id: string; title: string; pageType: string; content: unknown }[]
  >`
    SELECT id, title, "pageType", content
    FROM "Page"
    WHERE "workspaceId" = ${workspaceId}
      AND status = 'active'
      AND to_tsvector('english',
            coalesce(title, '') || ' ' || coalesce(content::text, ''))
          @@ plainto_tsquery('english', ${query})
    ORDER BY ts_rank(
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content::text, '')),
      plainto_tsquery('english', ${query})
    ) DESC
    LIMIT ${limit}
  `

  return results.map(r => ({
    pageId: r.id,
    pageTitle: r.title,
    pageType: r.pageType,
    snippet: extractTextSnippet(r.content, 300),
  }))
}

function extractTextSnippet(content: unknown, maxLength: number): string {
  if (!content || typeof content !== 'object') return ''
  const obj = content as Record<string, unknown>
  const text = typeof obj.text === 'string' ? obj.text : ''
  return text.slice(0, maxLength).trim()
}
