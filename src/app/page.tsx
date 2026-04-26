import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getLocale } from 'next-intl/server'
import { Brain, Calendar, Sparkles } from 'lucide-react'
import { PublicNav } from '@/components/PublicNav'
import type { Locale } from '@/i18n/config'

export default async function Home() {
  let session = null
  try {
    session = await auth()
  } catch (error) {
    console.warn('Invalid session detected, clearing...', error)
  }
  const locale = await getLocale() as Locale

  if (session?.user) {
    redirect('/dashboard')
  }

  const features = [
    {
      icon: Brain,
      title: 'Capture everything',
      desc: 'Notes, files, links, voice. Your workspace is your second brain.',
    },
    {
      icon: Calendar,
      title: 'Plan with structure',
      desc: 'Database pages, weekly reviews, action items. Built for solo workflows.',
    },
    {
      icon: Sparkles,
      title: 'Think with AI',
      desc: 'Cmd+K asks your workspace anything. Your AI partner knows your work.',
    },
  ]

  return (
    <>
      <PublicNav isLoggedIn={false} locale={locale} />
      <div className="min-h-[calc(100vh-64px)] bg-chalk dark:bg-ink">
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-ink dark:text-chalk" style={{ fontFamily: 'var(--font-syne)' }}>
            Your second brain. Your plan. Your AI partner.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Foyer is a workspace built for solo professionals. Capture notes,
            plan your week, and think alongside an AI that knows your work.
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link href="/register" className="rounded-md bg-emerald-500 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-600 transition">
              Get started
            </Link>
            <Link href="/login" className="rounded-md border px-6 py-3 text-sm font-medium hover:border-gray-400 transition">
              Sign in
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white dark:bg-surface">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid gap-6 md:grid-cols-3">
              {features.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-lg border p-6">
                    <div className="bg-emerald-500/10 w-10 h-10 rounded-md flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-emerald-500" />
                    </div>
                    <h3 className="font-medium text-ink dark:text-chalk mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/legal/terms" className="hover:text-foreground transition">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-foreground transition">Privacy</Link>
            <Link href="/status" className="hover:text-foreground transition">Status</Link>
            <Link href="/login" className="hover:text-foreground transition">Sign in</Link>
          </div>
        </footer>
      </div>
    </>
  )
}
