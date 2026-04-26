'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Sparkles, Brain, Zap, LogOut, Files, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { CommandPalette } from '@/components/dashboard/CommandPalette'
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

// Deprecated routes /chat and /dashboard/skills hidden in M5-10. See docs/DECISIONS.md.
const navItems = [
  { href: '/dashboard/workspace', labelKey: 'workspace' as const, icon: Files },
  { href: '/dashboard/settings', labelKey: 'settings' as const, icon: Settings },
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
  const [mobileOpen, setMobileOpen] = useState(false)

  const getProviderIcon = (model: string | null | undefined) => {
    if (!model) return null
    if (model.includes('anthropic')) return Brain
    if (model.includes('openrouter')) return Zap
    return Sparkles
  }

  const ProviderIcon = getProviderIcon(activeModel)

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            Foyer
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
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
                  <Icon className="h-5 w-5" />
                  {translations.nav[item.labelKey]}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: utilities */}
        <div className="flex items-center gap-3">
          {activeModel && instanceStatus === 'active' && (
            <div className="hidden md:flex items-center gap-2">
              {ProviderIcon && <ProviderIcon className="h-4 w-4 text-muted-foreground" />}
              <Badge variant="secondary" className="max-w-[120px] truncate font-mono text-xs">
                {modelShortName(activeModel)}
              </Badge>
            </div>
          )}
          {instanceStatus && instanceStatus !== 'active' && (
            <Badge
              variant={instanceStatus === 'provisioning' ? 'secondary' : 'destructive'}
              className="hidden md:flex text-xs"
            >
              {instanceStatus}
            </Badge>
          )}

          <div className="hidden md:flex items-center gap-3">
            <CommandPalette />
            <LanguageSwitcher currentLocale={locale} />
            <button
              onClick={() => { window.location.href = '/api/auth/signout?callbackUrl=%2F' }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              {translations.common.signOut}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="flex flex-col px-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors min-h-[44px]',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {translations.nav[item.labelKey]}
                </Link>
              )
            })}

            <div className="border-t mt-2 pt-2 flex flex-col gap-1">
              <div className="flex items-center justify-between px-3 py-2">
                <LanguageSwitcher currentLocale={locale} />
                <CommandPalette />
              </div>
              <button
                onClick={() => { window.location.href = '/api/auth/signout?callbackUrl=%2F' }}
                className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors min-h-[44px] w-full text-left"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {translations.common.signOut}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
