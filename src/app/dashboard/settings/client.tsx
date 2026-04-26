'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, MessageSquare, Rocket, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { saveTelegramBot, deployInstance, savePlatformModel } from './actions'

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
    telegramChatId: string | null
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
  const [botToken, setBotToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [savingTelegram, setSavingTelegram] = useState(false)

  const canDeploy = user.subscriptionStatus === 'active' && user.creditsBalance > 0

  async function handleSaveModel() {
    setSavingModel(true)
    try {
      await savePlatformModel(selectedModel)
      toast.success('Default model saved.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save model')
    } finally {
      setSavingModel(false)
    }
  }

  async function handleSaveTelegram() {
    setSavingTelegram(true)
    try {
      const result = await saveTelegramBot(botToken, chatId)
      toast.success(`Telegram connected — bot @${result.botUsername} is ready.`)
      setBotToken('')
      setChatId('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save Telegram bot')
    } finally {
      setSavingTelegram(false)
    }
  }

  async function handleDeploy() {
    setDeploying(true)
    try {
      await deployInstance()
      toast.success('Provisioning started.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Deployment failed')
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="space-y-6">
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
              Connect your own Telegram bot so ClawHost can send you notifications and updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {user.telegramUsername && user.telegramChatId ? (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700">
                <MessageSquare className="mr-2 inline-block h-4 w-4" />
                Connected — bot <strong>@{user.telegramUsername}</strong>, chat ID <strong>{user.telegramChatId}</strong>
              </div>
            ) : null}

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 1 — Create a bot</p>
              <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
                <li>Open Telegram and search for <strong>@BotFather</strong></li>
                <li>Send <code className="rounded bg-muted px-1">/newbot</code></li>
                <li>Follow the prompts — pick a display name and a username ending in <code className="rounded bg-muted px-1">_bot</code></li>
                <li>BotFather replies with your token — it looks like: <code className="rounded bg-muted px-1">1234567890:ABCdef...</code></li>
              </ol>
              <Input
                placeholder="Paste bot token here"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="mt-2 font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 2 — Get your Telegram ID</p>
              <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
                <li>In Telegram search for <strong>@userinfobot</strong></li>
                <li>Send it any message — it replies instantly with your numeric Telegram ID</li>
                <li>Copy the number (e.g. <code className="rounded bg-muted px-1">123456789</code>)</li>
              </ol>
              <Input
                placeholder="Paste your Telegram ID here"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="mt-2 font-mono text-xs"
              />
            </div>

            <Button
              onClick={handleSaveTelegram}
              disabled={savingTelegram || !botToken.trim() || !chatId.trim()}
              className="w-full"
            >
              {savingTelegram ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              Save and verify
            </Button>
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
