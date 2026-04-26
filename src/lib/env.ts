import { z } from 'zod'

const envSchema = z.object({
  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database
  DATABASE_URL: z.string().min(1),

  // Auth
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),

  // Encryption (for API keys at rest)
  ENCRYPTION_KEY: z.string().min(1),

  // Platform LLM
  OPENROUTER_API_KEY: z.string().min(1),
  PLATFORM_DEFAULT_MODEL: z.string().default('openrouter/nvidia/nemotron-3-super-120b-a12b:free'),
  PLATFORM_MONTHLY_CREDITS: z.coerce.number().int().positive().default(1000),

  // Telegram
  TELEGRAM_SHARED_BOT_USERNAME: z.string().min(1).optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  STRIPE_PRICE_ID: z.string().startsWith('price_'),

  // Dokploy (optional for local dev)
  DOKPLOY_URL: z.string().url().optional(),
  DOKPLOY_API_KEY: z.string().min(1).optional(),
})

export type Env = z.infer<typeof envSchema>

function getEnv(): Env {
  // Skip strict validation during build and tests
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return process.env as unknown as Env
  }
  return envSchema.parse(process.env)
}

export const env = getEnv()
