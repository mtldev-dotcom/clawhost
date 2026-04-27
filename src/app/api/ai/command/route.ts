import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { env } from '@/lib/env'
import { checkAuthRateLimit, createRateLimitResponse } from '@/lib/rate-limit'
import { getWorkspaceForUser } from '@/lib/workspace'
import { retrieveWorkspaceContext } from '@/lib/workspace-context'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimitCheck = checkAuthRateLimit(`ai:${session.user.id}`)
    if (!rateLimitCheck.allowed) {
      return createRateLimitResponse(rateLimitCheck.resetAt)
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Credit gate
    if (user.creditsBalance <= 0) {
      return NextResponse.json({ error: 'No credits remaining. Please renew your subscription.' }, { status: 402 })
    }

    const body = await req.json()
    const command = typeof body.command === 'string' ? body.command.trim() : ''
    const targetPageId = typeof body.targetPageId === 'string' ? body.targetPageId : null
    const scopeToPageId = typeof body.scopeToPageId === 'string' ? body.scopeToPageId : null

    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 })
    }

    const workspace = await getWorkspaceForUser(session.user.id)

    let contextBlock: string
    let context: { pageId: string; pageTitle: string }[] = []

    if (scopeToPageId) {
      const page = await prisma.page.findFirst({
        where: { id: scopeToPageId, workspaceId: workspace.id, status: 'active' },
        select: { id: true, title: true, pageType: true, content: true },
      })
      if (page) {
        const text = (page.content as { text?: string } | null)?.text ?? ''
        contextBlock = `[Page: ${page.title} (${page.pageType})]\n${text}`
        context = [{ pageId: page.id, pageTitle: page.title }]
      } else {
        contextBlock = 'Page not found.'
      }
    } else {
      const retrieved = await retrieveWorkspaceContext(workspace.id, command, 5)
      contextBlock = retrieved.length > 0
        ? retrieved.map(c => `[Page: ${c.pageTitle} (${c.pageType})]\n${c.snippet}`).join('\n\n---\n\n')
        : 'No relevant workspace pages found.'
      context = retrieved.map(c => ({ pageId: c.pageId, pageTitle: c.pageTitle }))
    }

    const instance = await prisma.instance.findUnique({
      where: { userId: session.user.id },
      select: { activeModel: true },
    })
    const rawModel = instance?.activeModel ?? env.PLATFORM_DEFAULT_MODEL
    const model = rawModel.startsWith('openrouter/') ? rawModel.slice('openrouter/'.length) : rawModel

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.NEXT_PUBLIC_APP_URL,
        'X-Title': 'Foyer',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `You are the AI partner inside Foyer — a second brain and workspace for a solo professional. You have access to the user's workspace pages below. When answering, reference specific pages when relevant. Be concise, direct, and useful — like a thoughtful chief-of-staff. Output plain text or markdown only.\n\nWORKSPACE CONTEXT:\n${contextBlock}`,
          },
          { role: 'user', content: command },
        ],
        max_tokens: 1000,
      }),
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      console.error('OpenRouter error:', errText)
      return NextResponse.json({ error: 'AI service error' }, { status: 502 })
    }

    const aiData = await aiResponse.json()
    const answer = aiData.choices?.[0]?.message?.content ?? ''

    // Decrement credits by 1 per command call
    await prisma.user.update({
      where: { id: session.user.id },
      data: { creditsBalance: { decrement: 1 } },
    })

    return NextResponse.json({
      answer,
      contextUsed: context,
      targetPageId,
    })
  } catch (error) {
    console.error('AI command error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
