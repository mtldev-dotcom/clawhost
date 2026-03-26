import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { provisionInstance } from '@/lib/dokploy'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { instance: true },
  })
  if (!user?.instance) return NextResponse.json({ error: 'No instance' }, { status: 404 })

  await provisionInstance(user, user.instance)
  return NextResponse.json({ status: 'provisioning' })
}
