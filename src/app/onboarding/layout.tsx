import { auth } from '@/lib/auth'
import { getLocale } from 'next-intl/server'
import { PublicNav } from '@/components/PublicNav'
import type { Locale } from '@/i18n/config'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const locale = await getLocale() as Locale

  return (
    <>
      <PublicNav isLoggedIn={!!session?.user} locale={locale} />
      {children}
    </>
  )
}
