'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, MessageSquare, Rocket, Sparkles } from 'lucide-react'
import { createTelegramConnectLink, deployInstance, savePlatformModel } from './actions'

type ModelOption = {
  id: string
  name: string
  description: string
}

interface SettingsClientProps {
  user: {
    email: string
    subscriptionStatus: 'inactive' | 'active' | 'past_due' | 'cancelled'
    creditsBalance: number
    lifetimeCreditsGranted: number
    telegramUsername: string | null
    telegramLinkedAt: string | null
  }
  instance: {
    status: 'pending' | 'provisioning' | 'active' | 'failed' | 'cancelled'
    appUrl: string | null
    activeModel: string
  }
  models: readonly ModelOption[]
}

export function SettingsClient({ user, instance, models }: SettingsClientProps) {
  const [selectedModel, setSelectedModel] = useState(instance.activeModel)
  const [savingModel, setSavingModel] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [connectingTelegram, setConnectingTelegram] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canDeploy = user.subscriptionStatus === 'active' && user.creditsBalance > 0

  async function handleSaveModel() {
    setSavingModel(true)
    setError(null)
    try {
      await savePlatformModel(selectedModel)
      setSuccess('Default model saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save model')
    } finally {
      setSavingModel(false)
    }
  }

  async function handleConnectTelegram() {
    setConnectingTelegram(true)
    setError(null)
    try {
      const { url } = await createTelegramConnectLink()
      window.open(url, '_blank', 'noopener,noreferrer')
      setSuccess('Telegram connect link created. Finish the flow in Telegram.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create Telegram link')
    } finally {
      setConnectingTelegram(false)
    }
  }

  async function handleDeploy() {
    setDeploying(true)
    setError(null)
    try {
      await deployInstance()
      setSuccess('Provisioning started.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed')
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      {success && <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">{success}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscription and credits</CardTitle>
            <CardDescription>
              Platform-managed OpenRouter access now runs through your ClawHost subscription.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={user.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                {user.subscriptionStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credits available</span>
              <span className="font-semibold">{user.creditsBalance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lifetime credits granted</span>
              <span className="font-semibold">{user.lifetimeCreditsGranted}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              For v1, users do not paste their own LLM key. ClawHost uses the platform OpenRouter key from env and gates usage with subscription credits.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Telegram</CardTitle>
            <CardDescription>
              Shared bot linking is the default path now. No per-user BotFather setup for v1.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Linked account</span>
              <span className="font-semibold">{user.telegramUsername ? `@${user.telegramUsername}` : 'Not linked yet'}</span>
            </div>
            <Button onClick={handleConnectTelegram} disabled={connectingTelegram} className="w-full">
              {connectingTelegram ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              Connect Telegram
            </Button>
            <p className="text-xs text-muted-foreground">
              This creates a short-lived deep link token and opens the shared bot in Telegram.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Default model</CardTitle>
          <CardDescription>
            Pick the default OpenRouter model for this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`w-full rounded-lg border p-4 text-left transition hover:border-gray-400 ${
                selectedModel === model.id ? 'border-black bg-gray-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                <Sparkles className="h-4 w-4" />
                {model.name}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{model.description}</div>
              <div className="mt-2 text-xs text-muted-foreground">{model.id}</div>
            </button>
          ))}
          <Button onClick={handleSaveModel} disabled={savingModel}>
            {savingModel && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save default model
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hosted runtime</CardTitle>
          <CardDescription>
            Deploy your ClawHost runtime with the saved default model.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Runtime status</span>
            <Badge variant={instance.status === 'active' ? 'default' : 'secondary'}>{instance.status}</Badge>
          </div>
          {instance.appUrl && (
            <div className="text-sm text-muted-foreground">
              Running at <code className="text-xs">{instance.appUrl}</code>
            </div>
          )}
          <Button onClick={handleDeploy} disabled={!canDeploy || deploying} className="w-full">
            {deploying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
            {instance.status === 'active' ? 'Redeploy runtime' : 'Deploy runtime'}
          </Button>
          {!canDeploy && (
            <p className="text-xs text-muted-foreground">
              You need an active subscription and available credits before deploy.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
