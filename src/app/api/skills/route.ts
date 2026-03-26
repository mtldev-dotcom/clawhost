import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { injectSkill } from '@/lib/dokploy'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({ where: { active: true } })
    return NextResponse.json(skills)
  } catch (error) {
    console.error('Failed to fetch skills:', error)
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skillSlug, enable } = await req.json()

    if (!skillSlug || typeof enable !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: skillSlug and enable' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { instance: true },
    })

    if (!user?.instance) {
      return NextResponse.json({ error: 'No instance found' }, { status: 404 })
    }

    if (user.instance.status !== 'active') {
      return NextResponse.json(
        { error: 'Instance must be active to modify skills' },
        { status: 400 }
      )
    }

    const skill = await prisma.skill.findUnique({ where: { slug: skillSlug } })
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    const current = user.instance.enabledSkills
    const updated = enable
      ? [...new Set([...current, skillSlug])]
      : current.filter((s) => s !== skillSlug)

    await prisma.instance.update({
      where: { id: user.instance.id },
      data: { enabledSkills: updated },
    })

    if (enable) {
      try {
        await injectSkill(user.instance, skill.mcpConfig as object)
      } catch (error) {
        console.error('Failed to inject skill:', error)
        // Rollback the database update
        await prisma.instance.update({
          where: { id: user.instance.id },
          data: { enabledSkills: current },
        })
        return NextResponse.json(
          { error: 'Failed to inject skill into instance' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ enabledSkills: updated })
  } catch (error) {
    console.error('Skills API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
