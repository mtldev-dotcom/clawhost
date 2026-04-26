import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/crypto'
import { getOrCreateConnection, sendRequest, subscribeToEvents } from '@/app/api/chat/ws-client'

interface TelegramUpdate {
  message?: {
    from?: { id: number; username?: string }
    chat: { id: number }
    text?: string
  }
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

async function sendTyping(botToken: string, chatId: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  })
}

export async function POST(req: Request) {
  try {
    // Authenticate via secret_token = userId set during webhook registration
    const userId = req.headers.get('x-telegram-bot-api-secret-token')
    if (!userId) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    const update: TelegramUpdate = await req.json()
    const message = update.message
    if (!message?.text || !message.from) {
      return NextResponse.json({ ok: true })
    }

    const text = message.text.trim()
    const chatId = String(message.chat.id)

    // Load user + instance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { instance: true },
    })

    if (!user?.telegramBotToken || !user.telegramChatId) {
      return NextResponse.json({ ok: true })
    }

    const botToken = decrypt(user.telegramBotToken)

    // Guard: only respond to the registered chat ID
    if (chatId !== user.telegramChatId) {
      return NextResponse.json({ ok: true })
    }

    const instance = user.instance

    if (!instance || instance.status !== 'active') {
      await sendTelegramMessage(
        botToken,
        chatId,
        "Your OpenClaw instance isn't running yet. Go to Settings → Deploy runtime to start it."
      )
      return NextResponse.json({ ok: true })
    }

    if (!instance.containerHost || !instance.gatewayToken) {
      await sendTelegramMessage(botToken, chatId, 'Gateway not configured. Try redeploying from Settings.')
      return NextResponse.json({ ok: true })
    }

    await sendTyping(botToken, chatId)

    const gatewayPort = instance.gatewayPort ?? 18789
    const gatewayUrl = `ws://${instance.containerHost}:${gatewayPort}`

    // Connect to OpenClaw and send the message
    const connection = await getOrCreateConnection(userId, gatewayUrl, instance.gatewayToken)

    const responseText = await new Promise<string>((resolve, reject) => {
      let fullText = ''
      let done = false

      const unsubscribe = subscribeToEvents(connection, (msg) => {
        if (done) return

        if (msg.type === 'event' && msg.payload) {
          const payload = msg.payload as {
            event?: string
            delta?: { text?: string }
            status?: string
          }

          if (payload.event === 'agent' && payload.delta?.text) {
            fullText += payload.delta.text
          }

          if (payload.event === 'agent' && payload.status === 'done') {
            done = true
            unsubscribe()
            resolve(fullText.trim())
          }
        }
      })

      const timeout = setTimeout(() => {
        if (!done) {
          done = true
          unsubscribe()
          reject(new Error('Response timeout'))
        }
      }, 60_000)

      sendRequest(connection, 'chat.send', {
        text,
        idempotencyKey: `tg-${Date.now()}-${Math.random()}`,
      }).catch((err) => {
        clearTimeout(timeout)
        if (!done) {
          done = true
          unsubscribe()
          reject(err)
        }
      })

      // Clear timeout on resolve
      const origResolve = resolve
      resolve = (v) => { clearTimeout(timeout); origResolve(v) }
    })

    await sendTelegramMessage(botToken, chatId, responseText || '(no response)')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    // Always 200 — Telegram retries on non-200
    return NextResponse.json({ ok: true })
  }
}
