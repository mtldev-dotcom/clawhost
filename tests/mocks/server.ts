import { setupServer } from 'msw/node'
import { stripeHandlers } from './handlers/stripe'
import { openaiHandlers } from './handlers/openai'
import { anthropicHandlers } from './handlers/anthropic'

export const server = setupServer(
  ...stripeHandlers,
  ...openaiHandlers,
  ...anthropicHandlers
)
