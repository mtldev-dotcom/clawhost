import { auth } from '@/lib/auth'
import { getLocale } from 'next-intl/server'
import { PublicNav } from '@/components/PublicNav'
import type { Locale } from '@/i18n/config'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null

  try {
    session = await auth()
  } catch (error) {
    console.warn('AuthLayout session read failed, treating as signed out:', error)
  }

  const locale = await getLocale() as Locale

  return (
    <>
      <PublicNav isLoggedIn={!!session?.user} locale={locale} />
      {children}
    </>
  )
}
