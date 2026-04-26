'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Settings, Sparkles, Brain, Zap, LogOut, Files } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { Locale } from '@/i18n/config'

interface DashboardHeaderProps {
  activeModel?: string | null
  instanceStatus?: string
  locale: Locale
  translations: {
    nav: { workspace: string; chat: string; settings: string; skills: string }
    common: { signOut: string }
  }
}

const navItems = [
  { href: '/dashboard/workspace', labelKey: 'workspace' as const, icon: Files },
  { href: '/chat', labelKey: 'chat' as const, icon: MessageSquare },
  { href: '/dashboard/settings', labelKey: 'settings' as const, icon: Settings },
  { href: '/dashboard/skills', labelKey: 'skills' as const, icon: Sparkles },
]

function modelShortName(model: string | null | undefined): string {
  if (!model) return ''
  const parts = model.split('/')
  const slug = parts[parts.length - 1] ?? ''
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

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
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            PageBase
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
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
              <Badge variant="secondary" className="max-w-[120px] truncate font-mono text-xs">
                {modelShortName(activeModel)}
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
          <button
            onClick={() => {
              window.location.href = '/api/auth/signout?callbackUrl=%2F'
            }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {translations.common.signOut}
          </button>
        </div>
      </div>
    </header>
  )
}
