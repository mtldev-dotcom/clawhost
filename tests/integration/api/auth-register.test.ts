import { describe, it, expect, beforeEach } from 'vitest'
import { prismaMock } from '../../setup/prisma-mock'
import { createUser } from '../../setup/test-fixtures'

// Mock bcrypt
import { vi } from 'vitest'
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2a$12$hashedpassword'),
    compare: vi.fn().mockResolvedValue(true),
  },
}))

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.user.create.mockResolvedValue(createUser())
  })

  it('creates user with valid email and password', async () => {
    const { POST } = await import('@/app/api/auth/register/route')

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new@example.com',
        password: 'SecurePass123',
        name: 'New User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBeDefined()
  })

  it('rejects missing email', async () => {
    const { POST } = await import('@/app/api/auth/register/route')

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'SecurePass123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('required')
  })

  it('rejects missing password', async () => {
    const { POST } = await import('@/app/api/auth/register/route')

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('required')
  })

  it('rejects duplicate email', async () => {
    prismaMock.user.findUnique.mockResolvedValue(createUser())

    const { POST } = await import('@/app/api/auth/register/route')

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'SecurePass123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Registration failed')
  })

  it('rejects weak passwords with validation details', async () => {
    const { POST } = await import('@/app/api/auth/register/route')

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'weak@example.com',
        password: 'password123',
        name: 'Weak User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Password does not meet requirements')
    expect(data.details).toContain(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
  })
})
