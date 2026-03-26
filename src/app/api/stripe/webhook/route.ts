import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { provisionInstance, deprovisionInstance } from '@/lib/dokploy'
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
    const session = event.data.object as Stripe.Checkout.Session
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
