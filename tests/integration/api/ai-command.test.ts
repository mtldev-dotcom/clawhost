import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the auth and prisma deps
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    instance: { findUnique: vi.fn() },
    page: { findMany: vi.fn(), findFirst: vi.fn() },
    workspace: { findUnique: vi.fn() },
  },
}))
vi.mock('@/lib/workspace', () => ({
  getWorkspaceForUser: vi.fn(),
}))
vi.mock('@/lib/workspace-context', () => ({
  retrieveWorkspaceContext: vi.fn().mockResolvedValue([]),
}))

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

describe('POST /api/ai/command credit gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 402 when user has 0 credits', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      creditsBalance: 0,
    } as never)

    const { POST } = await import('@/app/api/ai/command/route')
    const req = new Request('http://localhost/api/ai/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'summarize my notes' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(402)
    const body = await res.json()
    expect(body.error).toMatch(/credits/i)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { POST } = await import('@/app/api/ai/command/route')
    const req = new Request('http://localhost/api/ai/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'summarize my notes' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })
})
