import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { getLocale, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { Toaster } from '@/components/ui/sonner'

// Force dynamic rendering for auth
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Foyer — Your second brain. Your plan. Your AI partner.',
  description: 'Foyer is a workspace built for solo professionals. Capture notes, plan your week, and think alongside an AI that knows your work.',
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
