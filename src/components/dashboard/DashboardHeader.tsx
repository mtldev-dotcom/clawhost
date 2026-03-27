'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Settings, Sparkles, Brain, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { Locale } from '@/i18n/config'

interface DashboardHeaderProps {
  activeModel?: string | null
  instanceStatus?: string
  locale: Locale
  translations: {
    nav: { chat: string; settings: string; skills: string }
    common: { signOut: string }
  }
}

const navItems = [
  { href: '/dashboard', labelKey: 'chat' as const, icon: MessageSquare },
  { href: '/dashboard/settings', labelKey: 'settings' as const, icon: Settings },
  { href: '/dashboard/skills', labelKey: 'skills' as const, icon: Sparkles },
]

export function DashboardHeader({ activeModel, instanceStatus, locale, translations }: DashboardHeaderProps) {
  const pathname = usePathname()

  const getProviderIcon = (model: string | null | undefined) => {
    if (!model) return null
    if (model.includes('anthropic')) return Brain
    if (model.includes('openrouter')) return Zap
    return Sparkles // OpenAI default
  }

  const ProviderIcon = getProviderIcon(activeModel)

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            ClawHost
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {translations.nav[item.labelKey]}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* Active model indicator */}
          {activeModel && instanceStatus === 'active' && (
            <div className="flex items-center gap-2">
              {ProviderIcon && <ProviderIcon className="h-4 w-4 text-muted-foreground" />}
              <Badge variant="secondary" className="font-mono text-xs">
                {activeModel.split('/').pop()}
              </Badge>
            </div>
          )}
          {instanceStatus && instanceStatus !== 'active' && (
            <Badge
              variant={instanceStatus === 'provisioning' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {instanceStatus}
            </Badge>
          )}
          <LanguageSwitcher currentLocale={locale} />
          <Link
            href="/api/auth/signout"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {translations.common.signOut}
          </Link>
        </div>
      </div>
    </header>
  )
}
