import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

interface TelegramMessage {
  message_id: number
  from?: {
    id: number
    username?: string
    first_name?: string
  }
  chat: { id: number }
  text?: string
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
}

async function sendMessage(chatId: number, text: string) {
  if (!env.TELEGRAM_BOT_TOKEN) return
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

export async function POST(req: Request) {
  try {
    const update: TelegramUpdate = await req.json()
    const message = update.message
    if (!message?.text || !message.from) {
      return NextResponse.json({ ok: true })
    }

    const text = message.text.trim()
    const chatId = message.chat.id
    const from = message.from

    // Handle /start <token> deep-link
    const startMatch = text.match(/^\/start\s+(.+)$/)
    if (startMatch) {
      const token = startMatch[1].trim()
      const now = new Date()

      const linkToken = await prisma.telegramLinkToken.findUnique({
        where: { token },
        include: { user: true },
      })

      if (!linkToken) {
        await sendMessage(chatId, 'Invalid or expired link. Please generate a new connect link from ClawHost settings.')
        return NextResponse.json({ ok: true })
      }

      if (linkToken.expiresAt < now) {
        await sendMessage(chatId, 'This link has expired. Please generate a new connect link from ClawHost settings.')
        return NextResponse.json({ ok: true })
      }

      if (linkToken.consumedAt) {
        await sendMessage(chatId, 'This link has already been used.')
        return NextResponse.json({ ok: true })
      }

      const username = from.username ?? from.first_name ?? String(from.id)

      await prisma.$transaction([
        prisma.user.update({
          where: { id: linkToken.userId },
          data: {
            telegramUsername: username,
            telegramLinkedAt: now,
          },
        }),
        prisma.telegramLinkToken.update({
          where: { token },
          data: { consumedAt: now },
        }),
      ])

      await sendMessage(chatId, `✅ Telegram account linked to ClawHost. You're all set, ${username}!`)
      return NextResponse.json({ ok: true })
    }

    // Default response for unrecognized messages
    await sendMessage(chatId, 'Send /start <token> from the ClawHost settings page to link your account.')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    // Always return 200 to Telegram — otherwise it will retry
    return NextResponse.json({ ok: true })
  }
}
