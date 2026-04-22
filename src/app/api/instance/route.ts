import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { channel, channelToken, aiProvider, aiApiKey, activeModel } = await req.json()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { instance: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const provider = aiProvider || user.instance?.aiProvider || 'openrouter'
    const model = activeModel || user.instance?.activeModel || env.PLATFORM_DEFAULT_MODEL

    if (!user.instance) {
      const instance = await prisma.instance.create({
        data: {
          userId: user.id,
          channel,
          channelToken,
          aiProvider: provider,
          aiApiKey,
          activeModel: model,
          status: 'pending',
        },
      })
      return NextResponse.json({ instance })
    }

    const instance = await prisma.instance.update({
      where: { id: user.instance.id },
      data: {
        ...(channel !== undefined && { channel }),
        ...(channelToken !== undefined && { channelToken }),
        ...(provider && { aiProvider: provider }),
        ...(aiApiKey !== undefined && { aiApiKey }),
        ...(model && { activeModel: model }),
      },
    })

    return NextResponse.json({ instance })
  } catch (error) {
    console.error('Instance PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { instance: true },
    })

    if (!user?.instance) {
      return NextResponse.json({ instance: null })
    }

    return NextResponse.json({
      instance: {
        id: user.instance.id,
        status: user.instance.status,
        appUrl: user.instance.appUrl,
        channel: user.instance.channel,
        aiProvider: user.instance.aiProvider,
        activeModel: user.instance.activeModel,
        enabledSkills: user.instance.enabledSkills,
        createdAt: user.instance.createdAt,
        updatedAt: user.instance.updatedAt,
      },
    })
  } catch (error) {
    console.error('Instance API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
