import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getOrCreateConnection,
  sendRequest,
  subscribeToEvents,
} from '../ws-client'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
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
      return new Response(JSON.stringify({ error: 'No instance found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (instance.status !== 'active') {
      return new Response(
        JSON.stringify({
          error: 'Instance not active',
          status: instance.status,
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (!instance.containerHost || !instance.gatewayToken) {
      return new Response(
        JSON.stringify({ error: 'Gateway not configured' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
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

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ type: 'connected' })}\n\n`
          )
        )

        let unsubscribe: (() => void) | null = null
        let isComplete = false

        // Subscribe to streaming events
        unsubscribe = subscribeToEvents(connection, (msg) => {
          if (isComplete) return

          // Handle agent streaming events
          if (msg.type === 'event' && msg.payload) {
            const payload = msg.payload as {
              event?: string
              delta?: { text?: string }
              status?: string
            }

            // Stream text deltas
            if (payload.event === 'agent' && payload.delta?.text) {
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    type: 'delta',
                    text: payload.delta.text,
                  })}\n\n`
                )
              )
            }

            // Handle completion
            if (
              payload.event === 'agent' &&
              payload.status === 'done'
            ) {
              isComplete = true
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ type: 'done' })}\n\n`
                )
              )
              controller.close()
              if (unsubscribe) unsubscribe()
            }
          }
        })

        // Send the chat message
        const idempotencyKey = uuidv4()
        sendRequest(connection, 'chat.send', {
          text: message,
          idempotencyKey,
        }).catch((err) => {
          if (!isComplete) {
            isComplete = true
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({
                  type: 'error',
                  error: err.message,
                })}\n\n`
              )
            )
            controller.close()
            if (unsubscribe) unsubscribe()
          }
        })

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          if (!isComplete) {
            isComplete = true
            if (unsubscribe) unsubscribe()
            controller.close()
          }
        })
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat send error:', error)
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Failed to send message',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}