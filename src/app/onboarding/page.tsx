'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Channel = 'telegram' | 'discord' | 'whatsapp'
type AiProvider = 'openai' | 'anthropic' | 'openrouter'

export default function OnboardingPage() {
  const router = useRouter()
  const t = useTranslations('onboarding')
  const tc = useTranslations('common')
  const tch = useTranslations('channels')
  const tp = useTranslations('providers')
  const ts = useTranslations('settings')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [channel, setChannel] = useState<Channel | null>(null)
  const [channelToken, setChannelToken] = useState('')
  const [aiProvider, setAiProvider] = useState<AiProvider | null>(null)
  const [aiApiKey, setAiApiKey] = useState('')

  const channels: { id: Channel; icon: string }[] = [
    { id: 'telegram', icon: '🤖' },
    { id: 'discord', icon: '💬' },
    { id: 'whatsapp', icon: '📱' },
  ]

  const providers: { id: AiProvider }[] = [
    { id: 'openai' },
    { id: 'anthropic' },
    { id: 'openrouter' },
  ]

  async function handleSubmit() {
    if (!channel || !channelToken || !aiProvider || !aiApiKey) return

    setLoading(true)
    setError(null)

    try {
      // Create/update instance config
      const instanceRes = await fetch('/api/instance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, channelToken, aiProvider, aiApiKey }),
      })

      if (!instanceRes.ok) {
        const data = await instanceRes.json()
        throw new Error(data.error || 'Failed to save configuration')
      }

      // Trigger provision
      const provisionRes = await fetch('/api/provision', { method: 'POST' })

      if (!provisionRes.ok) {
        const data = await provisionRes.json()
        throw new Error(data.error || 'Failed to start deployment')
      }

      router.push('/dashboard/settings')
    } catch (err) {
      console.error('Onboarding failed:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            {step === 1 && t('step1')}
            {step === 2 && t('step2')}
            {step === 3 && t('step3')}
          </CardTitle>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded ${
                  s <= step ? 'bg-black' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                {t('chooseChannel')}
              </p>
              <div className="grid gap-3">
                {channels.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setChannel(c.id)}
                    className={`p-4 border rounded-lg text-left flex items-center gap-3 hover:border-gray-400 transition ${
                      channel === c.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <span className="font-medium">{tch(`${c.id}.label`)}</span>
                  </button>
                ))}
              </div>
              {channel && (
                <div className="mt-4">
                  <Label htmlFor="channelToken">
                    {tch(`${channel}.placeholder`)}
                  </Label>
                  <Input
                    id="channelToken"
                    type="password"
                    value={channelToken}
                    onChange={(e) => setChannelToken(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
              <Button
                onClick={() => setStep(2)}
                disabled={!channel || !channelToken}
                className="w-full mt-4"
              >
                {tc('continue')}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                {t('chooseProvider')}
              </p>
              <div className="grid gap-3">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setAiProvider(p.id)}
                    className={`p-4 border rounded-lg text-left hover:border-gray-400 transition ${
                      aiProvider === p.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="font-medium">{tp(`${p.id}.label`)}</span>
                    <span className="text-sm text-gray-500 ml-2">{tp(`${p.id}.description`)}</span>
                  </button>
                ))}
              </div>
              {aiProvider && (
                <div className="mt-4">
                  <Label htmlFor="aiApiKey">API Key</Label>
                  <Input
                    id="aiApiKey"
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="mt-1"
                  />
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  {tc('back')}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!aiProvider || !aiApiKey}
                  className="flex-1"
                >
                  {tc('continue')}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                {t('review')}
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">{ts('channel')}</span>
                  <span className="font-medium">{channel && tch(`${channel}.label`)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{ts('aiProviders')}</span>
                  <span className="font-medium">{aiProvider && tp(`${aiProvider}.label`)}</span>
                </div>
              </div>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>
                  {tc('back')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? tc('deploying') : t('deployAgent')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
