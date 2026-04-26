import type { User, Instance, Skill } from '@prisma/client'

// Factory functions for test data
export const createUser = (overrides?: Partial<User>): User => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.lGLfJEJAqYAaKK', // 'password123'
  stripeCustomerId: null,
  locale: 'en',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

export const createInstance = (overrides?: Partial<Instance>): Instance => ({
  id: 'instance-1',
  userId: 'user-1',
  status: 'pending',
  appUrl: null,
  dokployProjectId: null,
  dokployAppId: null,
  aiProvider: null,
  activeModel: null,
  agentLocale: 'en',
  enabledSkills: [],
  stripeSubId: null,
  stripePriceId: null,
  gatewayToken: null,
  containerHost: null,
  gatewayPort: 18789,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

export const createActiveInstance = (overrides?: Partial<Instance>): Instance =>
  createInstance({
    status: 'active',
    aiProvider: 'openrouter',
    activeModel: 'openrouter/anthropic/claude-sonnet-4-6',
    appUrl: 'http://localhost:4000',
    ...overrides,
  })

export const createSkill = (overrides?: Partial<Skill>): Skill => ({
  id: 'skill-1',
  name: 'Gmail',
  slug: 'gmail',
  description: 'Read, send, and manage emails',
  category: 'productivity',
  iconUrl: null,
  mcpConfig: { type: 'mcp', server: 'gmail-mcp' },
  active: true,
  ...overrides,
})

// Test credentials from .env.local
export const TEST_CREDENTIALS = {
  openai: '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',
  telegram: '8325083161:AAHk9BnUL6OsP_HtciaFP4EmnH4IYVYJ630',
}

// Test user for E2E tests
export const TEST_USER = {
  email: 'e2e-test@clawhost.test',
  password: 'TestPassword123!',
  name: 'E2E Test User',
}
