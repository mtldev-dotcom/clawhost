'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Check, X } from 'lucide-react'

type AiProvider = 'openai' | 'anthropic' | 'openrouter'

const providerModels: Record<AiProvider, { id: string; name: string }[]> = {
  openai: [
    { id: 'openai/gpt-4o', name: 'GPT-4o' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { id: 'anthropic/claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
    { id: 'anthropic/claude-opus-4-6', name: 'Claude Opus 4.6' },
    { id: 'anthropic/claude-haiku-4-5', name: 'Claude Haiku 4.5' },
  ],
  openrouter: [
    { id: 'openrouter/anthropic/claude-sonnet-4-6', name: 'Claude Sonnet (OpenRouter)' },
    { id: 'openrouter/openai/gpt-4o', name: 'GPT-4o (OpenRouter)' },
  ],
}

export default function OnboardingPage() {
  const router = useRouter()
  const t = useTranslations('onboarding')
  const tc = useTranslations('common')
  const tp = useTranslations('providers')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null)

  // Form state
  const [aiProvider, setAiProvider] = useState<AiProvider | null>(null)
  const [aiApiKey, setAiApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  const providers: { id: AiProvider }[] = [
    { id: 'openai' },
    { id: 'anthropic' },
    { id: 'openrouter' },
  ]

  const totalSteps = 3

  async function testApiKey() {
    if (!aiProvider || !aiApiKey) return
    setTesting(true)
    setError(null)
    setApiKeyValid(null)

    try {
      const res = await fetch('/api/onboarding/test-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: aiProvider, apiKey: aiApiKey }),
      })
      const data = await res.json()

      if (data.valid) {
        setApiKeyValid(true)
        setStep(2)
      } else {
        setApiKeyValid(false)
        setError(data.error || 'Invalid API key')
      }
    } catch {
      setApiKeyValid(false)
      setError('Failed to test API key')
    } finally {
      setTesting(false)
    }
  }

  async function deployAgent() {
    if (!selectedModel || !aiProvider || !aiApiKey) return
    setLoading(true)
    setError(null)

    try {
      // Save instance config
      const instanceRes = await fetch('/api/instance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiProvider,
          aiApiKey,
          activeModel: selectedModel,
        }),
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

      setStep(3)
      // Redirect to workspace after short delay
      setTimeout(() => router.push('/dashboard/workspace'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Configure AI Provider'}
            {step === 2 && 'Select Model'}
            {step === 3 && 'Success!'}
          </CardTitle>
          <div className="flex gap-2 mt-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
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
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Step 1: Provider + API Key */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Select your AI provider and enter your API key
              </p>
              <div className="grid gap-3">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setAiProvider(p.id)
                      setApiKeyValid(null)
                      setAiApiKey('')
                    }}
                    className={`p-4 border rounded-lg text-left hover:border-gray-400 transition ${
                      aiProvider === p.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="font-medium">{tp(`${p.id}.label`)}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {tp(`${p.id}.description`)}
                    </span>
                  </button>
                ))}
              </div>
              {aiProvider && (
                <div className="space-y-2">
                  <Label htmlFor="aiApiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="aiApiKey"
                      type="password"
                      placeholder="sk-..."
                      value={aiApiKey}
                      onChange={(e) => {
                        setAiApiKey(e.target.value)
                        setApiKeyValid(null)
                      }}
                    />
                    {apiKeyValid === true && (
                      <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    )}
                    {apiKeyValid === false && (
                      <X className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              )}
              <Button
                onClick={testApiKey}
                disabled={!aiProvider || !aiApiKey || testing}
                className="w-full"
              >
                {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test & Continue
              </Button>
            </div>
          )}

          {/* Step 2: Model Selection & Deploy */}
          {step === 2 && aiProvider && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Choose which model your agent will use
              </p>
              <div className="grid gap-3">
                {providerModels[aiProvider].map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-4 border rounded-lg text-left hover:border-gray-400 transition ${
                      selectedModel === model.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="font-medium">{model.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  {tc('back')}
                </Button>
                <Button
                  onClick={deployAgent}
                  disabled={!selectedModel || loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Deploy Agent
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Your workspace is ready!</h2>
              <p className="text-gray-600">
                Redirecting to your workspace...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}