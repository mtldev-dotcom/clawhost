import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getPlatformSettings } from '@/lib/platform-settings'
import { NextResponse } from 'next/server'
import { checkAuthRateLimit, getClientIP, createRateLimitResponse } from '@/lib/rate-limit'

// Password validation rules
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 128
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/ // At least one lowercase, one uppercase, one digit

interface PasswordValidation {
  valid: boolean
  errors: string[]
}

function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []
  
  if (!password || password.length === 0) {
    errors.push('Password is required')
  } else {
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      errors.push(`Password must not exceed ${MAX_PASSWORD_LENGTH} characters`)
    }
    if (!PASSWORD_REGEX.test(password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export async function POST(req: Request) {
  // Rate limiting check
  const clientIP = getClientIP(req)
  const rateLimitCheck = checkAuthRateLimit(`register:${clientIP}`)
  
  if (!rateLimitCheck.allowed) {
    return createRateLimitResponse(rateLimitCheck.resetAt)
  }

  const settings = await getPlatformSettings()
  if (!settings.signupEnabled) {
    return NextResponse.json({ error: 'Registration is currently closed.' }, { status: 403 })
  }

  let body: { email?: string; password?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, password, name } = body

  // Validation
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  // Password validation
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return NextResponse.json(
      { error: 'Password does not meet requirements', details: passwordValidation.errors },
      { status: 400 }
    )
  }

  // Check if email exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    // Don't reveal if email exists - same response
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 })
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        emailVerified: !settings.requireEmailConfirm,
        creditsBalance: settings.defaultCredits,
        lifetimeCreditsGranted: settings.defaultCredits,
        subscriptionStatus: settings.defaultSubStatus,
      },
    })

    return NextResponse.json({ id: user.id }, { status: 201 })
  } catch (error) {
    console.error('Registration failed:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
