import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    const creditsGrantedLast24h = await prisma.user.aggregate({
      _sum: { creditsBalance: true },
      where: { updatedAt: { gte: new Date(Date.now() - 86400_000) } },
    })
    return NextResponse.json({
      status: 'ok',
      db: 'ok',
      creditsGrantedLast24h: creditsGrantedLast24h._sum.creditsBalance ?? 0,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ status: 'error', db: 'unreachable' }, { status: 503 })
  }
}
