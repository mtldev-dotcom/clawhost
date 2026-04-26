import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { getLocale, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { Toaster } from '@/components/ui/sonner'

// Force dynamic rendering for auth
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ClawHost - Your AI. Running 24/7.',
  description: 'Get a hosted AI agent instance in 60 seconds',
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
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
