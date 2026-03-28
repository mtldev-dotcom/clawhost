import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function Home() {
  const session = await auth()
  const t = await getTranslations('landing')
  const tc = await getTranslations('common')

  if (session?.user) {
    redirect('/dashboard')
  }

  const steps = [
    { step: '1', titleKey: 'step1Title', descKey: 'step1Desc' },
    { step: '2', titleKey: 'step2Title', descKey: 'step2Desc' },
    { step: '3', titleKey: 'step3Title', descKey: 'step3Desc' },
  ] as const

  const features = ['feature1', 'feature2', 'feature3', 'feature4'] as const

  return (
    <div className="min-h-[calc(100vh-64px)] bg-chalk dark:bg-ink">
      {/* Hero */}
      <section className="py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-content mx-auto text-center">
          <h1 className="text-display md:text-[48px] text-ink dark:text-chalk mb-6">
            {t('heroTitle')}
            <br />
            <span className="text-ink/50 dark:text-chalk/50">{t('heroSubtitle')}</span>
          </h1>
          <p className="text-body text-ink/70 dark:text-chalk/70 mb-8 max-w-md mx-auto">
            {t('heroDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs sm:max-w-none mx-auto">
            <Link
              href="/register"
              className="btn-primary sm:w-auto sm:px-8"
            >
              {tc('getStarted')}
            </Link>
            <Link
              href="/login"
              className="btn-secondary sm:w-auto sm:px-8"
            >
              {tc('signIn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-surface">
        <div className="max-w-content mx-auto px-6 md:px-12">
          <h2 className="text-heading text-center mb-12 text-ink dark:text-chalk">{t('howItWorks')}</h2>
          <div className="grid gap-6">
            {steps.map((item) => (
              <div key={item.step} className="brand-card flex gap-4 items-start">
                <div className="text-label text-emerald bg-emerald-light dark:bg-emerald/20 w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-medium text-ink dark:text-chalk mb-1">{t(item.titleKey)}</h3>
                  <p className="text-body text-ink/60 dark:text-chalk/60">{t(item.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-content mx-auto text-center">
          <h2 className="text-heading mb-8 text-ink dark:text-chalk">{t('pricing')}</h2>
          <div className="brand-card max-w-sm mx-auto">
            <div className="text-display text-ink dark:text-chalk mb-1">$9</div>
            <div className="text-label text-ink/50 dark:text-chalk/50 mb-6">{t('perMonth')}</div>
            <ul className="text-left space-y-3 mb-8">
              {features.map((featureKey) => (
                <li key={featureKey} className="flex items-center gap-3 text-body text-ink dark:text-chalk">
                  <span className="text-emerald text-sm">✓</span>
                  {t(featureKey)}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary">
              {tc('getStarted')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
