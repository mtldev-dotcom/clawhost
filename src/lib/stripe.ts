import Stripe from 'stripe'
import { env } from './env'

let _stripe: Stripe | undefined

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    })
  }
  return _stripe
}

// For backwards compatibility - lazily initialize stripe client
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    const client = getStripe()
    return (client as unknown as Record<string, unknown>)[prop as string]
  },
})
