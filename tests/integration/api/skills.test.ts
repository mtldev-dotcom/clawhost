import { describe, it, expect, vi } from 'vitest'
import { prismaMock } from '../../setup/prisma-mock'
import { setAuthenticatedUser, setUnauthenticated } from '../../setup/auth-mock'
import { createUser, createInstance, createActiveInstance, createSkill } from '../../setup/test-fixtures'

// Mock injectSkill
vi.mock('@/lib/dokploy', () => ({
  injectSkill: vi.fn().mockResolvedValue(undefined),
}))

describe('/api/skills', () => {
  describe('GET', () => {
    it('returns all active skills', async () => {
      const skills = [
        createSkill({ id: 'skill-1', name: 'Gmail', slug: 'gmail' }),
        createSkill({ id: 'skill-2', name: 'Calendar', slug: 'calendar' }),
      ]
      prismaMock.skill.findMany.mockResolvedValue(skills)

      const { GET } = await import('@/app/api/skills/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
      expect(data[0].name).toBe('Gmail')
    })

    it('returns empty array when no skills', async () => {
      prismaMock.skill.findMany.mockResolvedValue([])

      const { GET } = await import('@/app/api/skills/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })
  })

  describe('POST', () => {
    it('returns 401 for unauthenticated request', async () => {
      setUnauthenticated()

      const { POST } = await import('@/app/api/skills/route')
      const request = new Request('http://localhost/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillSlug: 'gmail', enable: true }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('returns 404 for user without instance', async () => {
      setAuthenticatedUser({ id: 'user-1' })
      prismaMock.user.findUnique.mockResolvedValue(createUser({ id: 'user-1' }))

      const { POST } = await import('@/app/api/skills/route')
      const request = new Request('http://localhost/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillSlug: 'gmail', enable: true }),
      })

      const response = await POST(request)
      expect(response.status).toBe(404)
    })

    it('returns 400 for non-active instance', async () => {
      setAuthenticatedUser({ id: 'user-1' })
      const user = createUser({ id: 'user-1' })
      const instance = createInstance({ userId: 'user-1', status: 'pending' })
      prismaMock.user.findUnique.mockResolvedValue({ ...user, instance } as never)

      const { POST } = await import('@/app/api/skills/route')
      const request = new Request('http://localhost/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillSlug: 'gmail', enable: true }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('active')
    })

    it('enables skill for active instance', async () => {
      setAuthenticatedUser({ id: 'user-1' })
      const user = createUser({ id: 'user-1' })
      const instance = createActiveInstance({ userId: 'user-1', enabledSkills: [] })
      const skill = createSkill()

      prismaMock.user.findUnique.mockResolvedValue({ ...user, instance } as never)
      prismaMock.skill.findUnique.mockResolvedValue(skill)
      prismaMock.instance.update.mockResolvedValue({
        ...instance,
        enabledSkills: ['gmail'],
      })

      const { POST } = await import('@/app/api/skills/route')
      const request = new Request('http://localhost/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillSlug: 'gmail', enable: true }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.enabledSkills).toContain('gmail')
    })

    it('disables skill', async () => {
      setAuthenticatedUser({ id: 'user-1' })
      const user = createUser({ id: 'user-1' })
      const instance = createActiveInstance({
        userId: 'user-1',
        enabledSkills: ['gmail', 'calendar'],
      })
      const skill = createSkill()

      prismaMock.user.findUnique.mockResolvedValue({ ...user, instance } as never)
      prismaMock.skill.findUnique.mockResolvedValue(skill)
      prismaMock.instance.update.mockResolvedValue({
        ...instance,
        enabledSkills: ['calendar'],
      })

      const { POST } = await import('@/app/api/skills/route')
      const request = new Request('http://localhost/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillSlug: 'gmail', enable: false }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.enabledSkills).not.toContain('gmail')
      expect(data.enabledSkills).toContain('calendar')
    })
  })
})
