import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code } = await req.json()

  if (!code || !/^[A-Z0-9]+$/i.test(code)) {
    return NextResponse.json({ error: 'Invalid pairing code format' }, { status: 400 })
  }

  // Get user's instance
  const instance = await prisma.instance.findUnique({
    where: { userId: session.user.id },
  })

  if (!instance) {
    return NextResponse.json({ error: 'No instance found' }, { status: 404 })
  }

  if (!instance.dokployAppId) {
    return NextResponse.json({ error: 'Instance not deployed yet' }, { status: 400 })
  }

  try {
    // Get container name from Dokploy
    const dokployUrl = process.env.DOKPLOY_URL
    const dokployKey = process.env.DOKPLOY_API_KEY

    if (!dokployUrl || !dokployKey) {
      return NextResponse.json({ error: 'Dokploy not configured' }, { status: 500 })
    }

    const composeRes = await fetch(
      `${dokployUrl}/api/compose.one?composeId=${instance.dokployAppId}`,
      { headers: { 'x-api-key': dokployKey } }
    )

    if (!composeRes.ok) {
      return NextResponse.json({ error: 'Failed to get container info' }, { status: 500 })
    }

    const compose = await composeRes.json()
    const containerName = `${compose.appName}-openclaw-1`

    // Execute docker command directly (requires Docker socket mount)
    const dockerCmd = `docker exec ${containerName} node /app/openclaw.mjs pairing approve telegram ${code} 2>&1`

    const { stdout, stderr } = await execAsync(dockerCmd, { timeout: 30000 })
    const output = stdout || stderr

    console.log('Pairing output:', output)

    // Check for success
    if (output.includes('approved') || output.includes('Approved') || output.includes('success') || output.includes('Success')) {
      return NextResponse.json({ success: true })
    }

    // Check for known errors
    if (output.includes('No pending') || output.includes('not found') || output.includes('expired')) {
      return NextResponse.json({
        success: false,
        error: 'Pairing code expired or invalid. Send a new message to the bot.'
      })
    }

    // If no error keywords, assume success
    if (!output.includes('Error') && !output.includes('error') && !output.includes('failed')) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: output.trim() || 'Failed to approve pairing' })
  } catch (err) {
    console.error('Pairing approval failed:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'

    // Check if Docker socket is not available
    if (message.includes('ENOENT') || message.includes('permission denied') || message.includes('Cannot connect')) {
      return NextResponse.json({
        success: false,
        error: 'Docker access not configured. Contact support.'
      })
    }

    return NextResponse.json({ success: false, error: 'Failed to approve pairing. Try again.' })
  }
}
