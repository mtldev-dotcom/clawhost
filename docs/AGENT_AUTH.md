# AGENT: Auth (NextAuth v5)

## Your job
Set up NextAuth v5 with credentials provider + session handling.

## Install
```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

## Create `src/lib/auth.ts`
```typescript
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user?.passwordHash) return null
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
```

## Create `src/app/api/auth/[...nextauth]/route.ts`
```typescript
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

## Create `src/app/(auth)/login/page.tsx`
Simple email/password form. On submit → `signIn('credentials', { email, password, redirectTo: '/dashboard' })`.
Use shadcn Card, Input, Button.

## Create `src/app/(auth)/register/page.tsx`
Email/password/name form. On submit → POST to `/api/auth/register`.

## Create `src/app/api/auth/register/route.ts`
```typescript
// Hash password with bcrypt, create User in DB, return 201
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password, name } = await req.json()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email taken' }, { status: 400 })
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({ data: { email, name, passwordHash } })
  return NextResponse.json({ id: user.id }, { status: 201 })
}
```

## Create `middleware.ts` at root
Protect `/dashboard` and `/onboarding` routes — redirect to `/login` if unauthenticated.
