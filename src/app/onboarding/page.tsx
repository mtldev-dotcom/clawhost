'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Loader2, MessageSquare, Sparkles } from 'lucide-react'
import { platformModels } from '@/lib/platform'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>(platformModels[0].id)

  const totalSteps = 3

  async function configureWorkspace() {
    setLoading(true)
    setError(null)

    try {
      const instanceRes = await fetch('/api/instance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiProvider: 'openrouter',
          activeModel: selectedModel,
        }),
      })

      if (!instanceRes.ok) {
        const data = await instanceRes.json()
        throw new Error(data.error || 'Failed to save configuration')
      }

      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
    } finally {
      setLoading(false)
    }
  }

  function finish() {
    setStep(3)
    setTimeout(() => router.push('/dashboard/workspace'), 1200)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Choose your default model'}
            {step === 2 && 'Telegram is next'}
            {step === 3 && 'Workspace ready'}
          </CardTitle>
          <CardDescription>
            ClawHost now uses a platform-managed OpenRouter key for v1. Users pick a model, subscribe, and use credits instead of pasting provider keys during setup.
          </CardDescription>
          <div className="flex gap-2 mt-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded ${s <= step ? 'bg-black' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Sparkles className="h-4 w-4" />
                  Platform-managed AI access
                </div>
                <p className="mt-2">
                  For now, ClawHost uses your OpenRouter key from the app environment. Subscription credits control usage, and model choice stays per workspace.
                </p>
              </div>

              <div className="grid gap-3">
                {platformModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`rounded-lg border p-4 text-left transition hover:border-gray-400 ${
                      selectedModel === model.id ? 'border-black bg-gray-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{model.description}</div>
                    <div className="mt-2 text-xs text-muted-foreground">{model.id}</div>
                  </button>
                ))}
              </div>

              <Button onClick={configureWorkspace} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save model and continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center gap-2 font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Shared Telegram bot flow
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Telegram account linking now happens through a shared bot with deep-link tokens. The full connect flow continues in Settings after checkout and deploy.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={finish} className="flex-1">
                  Go to workspace
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Your workspace is ready</h2>
              <p className="text-gray-600">Redirecting to your workspace...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
