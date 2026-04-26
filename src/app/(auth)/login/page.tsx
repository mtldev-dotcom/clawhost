'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('invalidCredentials'))
        setLoading(false)
        return
      }

      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
      router.push(callbackUrl)
    } catch {
      setError(t('somethingWrong'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('signIn')}</CardTitle>
          <CardDescription>
            {t('signInDescription')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('signingIn') : t('signIn')}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-primary hover:underline">
                {t('signUp')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
