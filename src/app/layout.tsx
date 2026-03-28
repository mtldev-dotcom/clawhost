import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { signOut } from '@/lib/auth'
import { getTranslations, getLocale, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { Locale } from '@/i18n/config'

// Force dynamic rendering for auth
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'NestAI - Your AI. Running 24/7.',
  description: 'Get a hosted AI agent instance in 60 seconds',
}

async function Nav() {
  const session = await auth()
  const t = await getTranslations('common')
  const locale = await getLocale() as Locale

  return (
    <nav className="border-b border-subtle bg-white dark:bg-ink dark:border-border">
      <div className="max-w-content mx-auto px-6 md:px-12">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="font-medium text-[18px] tracking-tight text-ink dark:text-chalk">
            NestAI
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} />
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-ink/70 hover:text-ink dark:text-chalk/70 dark:hover:text-chalk transition-colors duration-150"
                >
                  {t('dashboard')}
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
                    {t('signOut')}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-ink/70 hover:text-ink dark:text-chalk/70 dark:hover:text-chalk transition-colors duration-150"
                >
                  {t('signIn')}
                </Link>
                <Link
                  href="/register"
                  className="bg-ink text-white px-4 py-2 rounded-sm hover:opacity-85 transition-opacity duration-150 dark:bg-chalk dark:text-ink"
                >
                  {t('getStarted')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={GeistSans.variable}>
      <body className="font-sans bg-chalk text-ink dark:bg-ink dark:text-chalk antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Nav />
          <main>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
