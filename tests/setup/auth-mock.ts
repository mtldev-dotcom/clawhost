import { vi } from 'vitest'
import type { Session } from 'next-auth'

export interface MockSessionUser {
  id: string
  email: string
  name?: string | null
}

export const createMockSession = (user?: Partial<MockSessionUser>): Session => ({
  user: {
    id: user?.id ?? 'test-user-id',
    email: user?.email ?? 'test@example.com',
    name: user?.name ?? 'Test User',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
})

export const mockAuth = vi.fn()
export const mockSignIn = vi.fn()
export const mockSignOut = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
  signIn: mockSignIn,
  signOut: mockSignOut,
  handlers: { GET: vi.fn(), POST: vi.fn() },
}))

export const setAuthenticatedUser = (user?: Partial<MockSessionUser>) => {
  mockAuth.mockResolvedValue(createMockSession(user))
}

export const setUnauthenticated = () => {
  mockAuth.mockResolvedValue(null)
}
