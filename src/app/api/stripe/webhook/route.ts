import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { provisionInstance, deprovisionInstance } from '@/lib/dokploy'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { headers } from 'next/headers'
import { grantSubscriptionCredits, updateSubscriptionStatus } from '@/lib/billing'

function mapStripeStatus(status: Stripe.Subscription.Status): 'active' | 'past_due' | 'cancelled' | 'inactive' {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
    case 'unpaid':
      return 'past_due'
    case 'canceled':
    case 'incomplete_expired':
      return 'cancelled'
    default:
      return 'inactive'
  }
}

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

    await grantSubscriptionCredits(userId)

    const instance = await prisma.instance.upsert({
      where: { userId },
      create: {
        userId,
        status: 'provisioning',
        stripeSubId: session.subscription as string,
        stripePriceId: env.STRIPE_PRICE_ID,
        aiProvider: 'openrouter',
        activeModel: env.PLATFORM_DEFAULT_MODEL,
      },
      update: {
        status: 'provisioning',
        stripeSubId: session.subscription as string,
        stripePriceId: env.STRIPE_PRICE_ID,
        aiProvider: 'openrouter',
        activeModel: env.PLATFORM_DEFAULT_MODEL,
      },
    })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user) {
      provisionInstance(user, instance).catch(async (error) => {
        console.error('Provisioning failed from Stripe webhook:', error)
        await prisma.instance.update({
          where: { id: instance.id },
          data: { status: 'failed' },
        })
      })
    }
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    if (invoice.billing_reason === 'subscription_cycle' && typeof invoice.customer === 'string') {
      const user = await prisma.user.findUnique({ where: { stripeCustomerId: invoice.customer } })
      if (user) {
        await grantSubscriptionCredits(user.id)
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const instance = await prisma.instance.findFirst({ where: { stripeSubId: sub.id } })
    if (instance) {
      await updateSubscriptionStatus(instance.userId, mapStripeStatus(sub.status))
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const instance = await prisma.instance.findFirst({ where: { stripeSubId: sub.id } })
    if (instance) {
      await updateSubscriptionStatus(instance.userId, 'cancelled')
      await deprovisionInstance(instance)
    }
  }

  return NextResponse.json({ received: true })
}
