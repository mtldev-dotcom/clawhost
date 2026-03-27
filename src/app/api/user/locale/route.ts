import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { locales } from '@/i18n/config'

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { locale } = await req.json()

    if (!locales.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
    }

    // Update user locale
    await prisma.user.update({
      where: { id: session.user.id },
      data: { locale },
    })

    // Also update instance agentLocale if exists
    await prisma.instance.updateMany({
      where: { userId: session.user.id },
      data: { agentLocale: locale },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update locale:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
