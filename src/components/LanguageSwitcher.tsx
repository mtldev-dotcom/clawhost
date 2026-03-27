'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import { localeNames, type Locale } from '@/i18n/config'

interface LanguageSwitcherProps {
  currentLocale: Locale
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const switchLocale = async (locale: Locale) => {
    // Set cookie
    document.cookie = `locale=${locale};path=/;max-age=31536000`

    // Save to user profile if logged in
    try {
      await fetch('/api/user/locale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      })
    } catch {
      // Ignore errors for non-logged-in users
    }

    startTransition(() => {
      router.refresh()
    })
  }

  const nextLocale: Locale = currentLocale === 'en' ? 'fr' : 'en'

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => switchLocale(nextLocale)}
      disabled={isPending}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs">{localeNames[nextLocale]}</span>
    </Button>
  )
}
