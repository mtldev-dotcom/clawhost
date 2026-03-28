import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { signOut } from '@/lib/auth'

// Force dynamic rendering for auth
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'NestAI - Your AI. Running 24/7.',
  description: 'Get a hosted AI agent instance in 60 seconds',
}

async function Nav() {
  const session = await auth()

  return (
    <nav className="border-b border-subtle bg-white dark:bg-ink dark:border-border">
      <div className="max-w-content mx-auto px-6 md:px-12">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="font-medium text-[18px] tracking-tight text-ink dark:text-chalk">
            NestAI
          </Link>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-ink/70 hover:text-ink dark:text-chalk/70 dark:hover:text-chalk transition-colors duration-150"
                >
                  Dashboard
                </Link>
                <form
                  action={async () => {
                    'use server'
                    await signOut({ redirectTo: '/' })
                  }}
                >
                  <button
                    type="submit"
                    className="text-ink/70 hover:text-ink dark:text-chalk/70 dark:hover:text-chalk transition-colors duration-150"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-ink/70 hover:text-ink dark:text-chalk/70 dark:hover:text-chalk transition-colors duration-150"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-ink text-white px-4 py-2 rounded-sm hover:opacity-85 transition-opacity duration-150 dark:bg-chalk dark:text-ink"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="font-sans bg-chalk text-ink dark:bg-ink dark:text-chalk antialiased">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
