import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrCreateConnection, sendRequest } from '../ws-client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const instance = await prisma.instance.findUnique({
      where: { userId: session.user.id },
      select: {
        status: true,
        containerHost: true,
        gatewayToken: true,
        gatewayPort: true,
      },
    })

    if (!instance) {
      return NextResponse.json({ error: 'No instance found' }, { status: 404 })
    }

    if (instance.status !== 'active') {
      return NextResponse.json(
        { error: 'Instance not active', status: instance.status },
        { status: 503 }
      )
    }

    if (!instance.containerHost || !instance.gatewayToken) {
      return NextResponse.json(
        { error: 'Gateway not configured' },
        { status: 503 }
      )
    }

    // Build gateway URL
    const gatewayUrl = `ws://${instance.containerHost}:${instance.gatewayPort}`

    // Get or create WebSocket connection
    const connection = await getOrCreateConnection(
      session.user.id,
      gatewayUrl,
      instance.gatewayToken
    )

    // Request chat history
    const response = await sendRequest(connection, 'chat.history', {})

    return NextResponse.json({
      history: response.payload?.messages || [],
    })
  } catch (error) {
    console.error('Chat history error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch chat history',
      },
      { status: 500 }
    )
  }
}