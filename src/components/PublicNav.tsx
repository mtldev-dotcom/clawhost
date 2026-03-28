'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { Locale } from '@/i18n/config'

interface PublicNavProps {
  isLoggedIn: boolean
  locale: Locale
}

export function PublicNav({ isLoggedIn, locale }: PublicNavProps) {
  const t = useTranslations('common')

  return (
    <nav className="border-b border-subtle bg-white dark:bg-ink dark:border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="font-medium text-[18px] tracking-tight text-ink dark:text-chalk">
            NestAI
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-ink text-white px-4 py-2 rounded-sm hover:opacity-85 transition-opacity duration-150 dark:bg-chalk dark:text-ink"
              >
                {t('dashboard')}
              </Link>
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
