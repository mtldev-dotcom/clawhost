import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'
import { getWorkspaceForUser } from '@/lib/workspace'
import { checkAuthRateLimit, createRateLimitResponse } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = checkAuthRateLimit(`extract:${session.user.id}`)
    if (!rl.allowed) return createRateLimitResponse(rl.resetAt)

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.creditsBalance <= 0) return NextResponse.json({ error: 'No credits remaining.' }, { status: 402 })

    const body = await req.json()
    const pageId = String(body.pageId || '').trim()
    if (!pageId) return NextResponse.json({ error: 'pageId required' }, { status: 400 })

    const workspace = await getWorkspaceForUser(session.user.id)
    const page = await prisma.page.findFirst({ where: { id: pageId, workspaceId: workspace.id, status: 'active' } })
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

    const pageText = (page.content as { text?: string } | null)?.text ?? ''
    if (!pageText.trim()) return NextResponse.json({ extracted: 0 })

    const aiResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.NEXT_PUBLIC_APP_URL,
        'X-Title': 'Foyer',
      },
      body: JSON.stringify({
        model: env.PLATFORM_DEFAULT_MODEL,
        max_tokens: 600,
        messages: [
          { role: 'system', content: 'Extract concrete action items from the user text. Return only a JSON array of strings, no commentary. Example: ["Email Sara about Q3 plan","Renew domain"]. If none, return [].' },
          { role: 'user', content: pageText.slice(0, 4000) },
        ],
      }),
    })

    if (!aiResp.ok) return NextResponse.json({ error: 'AI service error' }, { status: 502 })

    const aiData = await aiResp.json()
    const raw = aiData.choices?.[0]?.message?.content ?? '[]'

    let items: string[] = []
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) items = parsed.filter(s => typeof s === 'string' && s.trim()).slice(0, 20)
    } catch {
      items = []
    }

    await prisma.user.update({ where: { id: session.user.id }, data: { creditsBalance: { decrement: 1 } } })

    if (items.length > 0) {
      await prisma.actionItem.createMany({
        data: items.map(t => ({ workspaceId: workspace.id, sourcePageId: page.id, text: t.trim() })),
      })
    }

    return NextResponse.json({ extracted: items.length })
  } catch (e) {
    console.error('extract-actions error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
