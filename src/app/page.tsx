import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-chalk dark:bg-ink">
      {/* Hero */}
      <section className="py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-content mx-auto text-center">
          <h1 className="text-display md:text-[48px] text-ink dark:text-chalk mb-6">
            Your AI.
            <br />
            <span className="text-ink/50 dark:text-chalk/50">Running 24/7.</span>
          </h1>
          <p className="text-body text-ink/70 dark:text-chalk/70 mb-8 max-w-md mx-auto">
            Get your own hosted agent in 60 seconds. Connect Telegram, Discord,
            or WhatsApp. Add skills from the marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs sm:max-w-none mx-auto">
            <Link
              href="/register"
              className="btn-primary sm:w-auto sm:px-8"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="btn-secondary sm:w-auto sm:px-8"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-surface">
        <div className="max-w-content mx-auto px-6 md:px-12">
          <h2 className="text-heading text-center mb-12 text-ink dark:text-chalk">How it works</h2>
          <div className="grid gap-6">
            {[
              { step: '1', title: 'Subscribe', desc: 'Sign up for $9/month. Your agent is provisioned instantly.' },
              { step: '2', title: 'Configure', desc: 'Connect Telegram, Discord, or WhatsApp. Add your AI key.' },
              { step: '3', title: 'Extend', desc: 'Add skills from the marketplace. Gmail, Calendar, Notion, more.' },
            ].map((item) => (
              <div key={item.step} className="brand-card flex gap-4 items-start">
                <div className="text-label text-emerald bg-emerald-light dark:bg-emerald/20 w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-medium text-ink dark:text-chalk mb-1">{item.title}</h3>
                  <p className="text-body text-ink/60 dark:text-chalk/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-content mx-auto text-center">
          <h2 className="text-heading mb-8 text-ink dark:text-chalk">Simple pricing</h2>
          <div className="brand-card max-w-sm mx-auto">
            <div className="text-display text-ink dark:text-chalk mb-1">$9</div>
            <div className="text-label text-ink/50 dark:text-chalk/50 mb-6">/month</div>
            <ul className="text-left space-y-3 mb-8">
              {[
                'Custom subdomain',
                'Telegram, Discord, or WhatsApp',
                'Skills marketplace access',
                'Bring your own AI key',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-body text-ink dark:text-chalk">
                  <span className="text-emerald text-sm">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
