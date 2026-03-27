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
  // Skip validation during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return process.env as unknown as Env
  }
  return envSchema.parse(process.env)
}

export const env = getEnv()
