# AGENT: Stripe

## Your job
Set up Stripe checkout + subscription webhook that triggers provisioning.

## Install
```bash
npm install stripe @stripe/stripe-js
```

## Create `src/lib/stripe.ts`
```typescript
import Stripe from 'stripe'
import { env } from './env'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})
```

## Create `src/app/api/stripe/checkout/route.ts`
```typescript
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email!, metadata: { userId: user.id } })
    customerId = customer.id
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
    metadata: { userId: user.id },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
```

## Create `src/app/api/stripe/webhook/route.ts`
```typescript
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { provisionInstance } from '@/lib/dokploy'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession
    const userId = session.metadata?.userId
    if (!userId) return NextResponse.json({ error: 'No userId' }, { status: 400 })

    // Create pending instance record
    const instance = await prisma.instance.upsert({
      where: { userId },
      create: {
        userId,
        status: 'provisioning',
        stripeSubId: session.subscription as string,
        stripePriceId: env.STRIPE_PRICE_ID,
      },
      update: {
        status: 'provisioning',
        stripeSubId: session.subscription as string,
      },
    })

    // Provision async (don't await — respond to Stripe fast)
    const user = await prisma.user.findUnique({ where: { id: userId } })
    provisionInstance(user!, instance).catch(console.error)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const instance = await prisma.instance.findFirst({ where: { stripeSubId: sub.id } })
    if (instance) {
      await deprovisionInstance(instance)
    }
  }

  return NextResponse.json({ received: true })
}
```

## Note on local webhook testing
Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
The webhook secret for local dev is printed by Stripe CLI — put it in `.env.local` as `STRIPE_WEBHOOK_SECRET`.
