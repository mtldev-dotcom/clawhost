import { describe, it, expect } from 'vitest'
import { prismaMock } from '../../setup/prisma-mock'
import { setAuthenticatedUser, setUnauthenticated } from '../../setup/auth-mock'
import { createUser, createInstance } from '../../setup/test-fixtures'

describe('/api/instance', () => {
  describe('GET', () => {
    it('returns 401 for unauthenticated request', async () => {
      setUnauthenticated()
      const { GET } = await import('@/app/api/instance/route')

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns null instance for user without instance', async () => {
      setAuthenticatedUser()
      prismaMock.user.findUnique.mockResolvedValue(createUser())
      const { GET } = await import('@/app/api/instance/route')

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.instance).toBeNull()
    })

    it('returns instance data for user with instance', async () => {
      setAuthenticatedUser()
      const user = createUser()
      const instance = createInstance({ userId: user.id, status: 'active' })
      prismaMock.user.findUnique.mockResolvedValue({ ...user, instance } as never)
      const { GET } = await import('@/app/api/instance/route')

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.instance.id).toBe(instance.id)
      expect(data.instance.status).toBe('active')
    })
  })

  describe('PATCH', () => {
    it('returns 401 for unauthenticated request', async () => {
      setUnauthenticated()
      const { PATCH } = await import('@/app/api/instance/route')

      const request = new Request('http://localhost/api/instance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiProvider: 'openrouter' }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('creates new instance if none exists', async () => {
      setAuthenticatedUser({ id: 'user-1' })
      const user = createUser({ id: 'user-1' })
      const newInstance = createInstance({ userId: 'user-1' })

      prismaMock.user.findUnique.mockResolvedValue({ ...user, instance: null })
      prismaMock.instance.create.mockResolvedValue(newInstance)

      const { PATCH } = await import('@/app/api/instance/route')

      const request = new Request('http://localhost/api/instance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiProvider: 'openrouter',
          activeModel: 'openrouter/anthropic/claude-sonnet-4-6',
        }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.instance).toBeDefined()
      expect(prismaMock.instance.create).toHaveBeenCalled()
    })

    it('updates existing instance', async () => {
      setAuthenticatedUser({ id: 'user-1' })
      const user = createUser({ id: 'user-1' })
      const instance = createInstance({ userId: 'user-1' })

      prismaMock.user.findUnique.mockResolvedValue({ ...user, instance } as never)
      prismaMock.instance.update.mockResolvedValue({
        ...instance,
        aiProvider: 'anthropic',
      })

      const { PATCH } = await import('@/app/api/instance/route')

      const request = new Request('http://localhost/api/instance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiProvider: 'anthropic' }),
      })

      const response = await PATCH(request)

      expect(response.status).toBe(200)
      expect(prismaMock.instance.update).toHaveBeenCalled()
    })
  })
})
