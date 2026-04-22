import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { provisionInstance } from '@/lib/dokploy'
import { NextResponse } from 'next/server'
import { checkProvisionRateLimit, getClientIP, createRateLimitResponse } from '@/lib/rate-limit'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = getClientIP(new Request('')) // Use session-based limiting
    const rateLimitCheck = checkProvisionRateLimit(`provision:${session.user.id}`)
    
    if (!rateLimitCheck.allowed) {
      return createRateLimitResponse(rateLimitCheck.resetAt)
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { instance: true },
    })

    if (!user?.instance) {
      return NextResponse.json({ error: 'No instance found' }, { status: 404 })
    }

    // Prevent double-provisioning
    if (user.instance.status === 'provisioning') {
      return NextResponse.json({ error: 'Already provisioning' }, { status: 429 })
    }

    // Set status to provisioning
    await prisma.instance.update({
      where: { id: user.instance.id },
      data: { status: 'provisioning' },
    })

    // Provision the container (async, don't wait)
    const instanceId = user.instance.id
    provisionInstance(user, user.instance).catch((err) => {
      console.error('Provisioning failed:', err)
      prisma.instance.update({
        where: { id: instanceId },
        data: { status: 'failed' },
      }).catch(console.error)
    })

    return NextResponse.json({ status: 'provisioning' })
  } catch (error) {
    console.error('Provision error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Provisioning failed' },
      { status: 500 }
    )
  }
}
