'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, MessageSquare, Rocket, Sparkles, User } from 'lucide-react'
import { toast } from 'sonner'
import { saveTelegramBot, deployInstance, savePlatformModel, saveProfile, approveTelegramPairing } from './actions'

type ModelOption = {
  id: string
  name: string
  description: string
}

interface SettingsClientProps {
  user: {
    name: string
    email: string
    hasPassword: boolean
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
  const [botToken, setBotToken] = useState('')
  const [pairingCode, setPairingCode] = useState('')
  const [savingTelegram, setSavingTelegram] = useState(false)
  const [approvingPair, setApprovingPair] = useState(false)

  const [profileName, setProfileName] = useState(user.name)
  const [profileEmail, setProfileEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const canDeploy = user.subscriptionStatus === 'active' && user.creditsBalance > 0

  async function handleSaveProfile() {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setSavingProfile(true)
    try {
      await saveProfile({
        name: profileName,
        email: profileEmail,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      })
      toast.success('Profile updated.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSavingProfile(false)
    }
  }

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
      const result = await saveTelegramBot(botToken)
      toast.success(`Bot @${result.botUsername} linked. Now DM it from Telegram to get a pairing code.`)
      setBotToken('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save Telegram bot')
    } finally {
      setSavingTelegram(false)
    }
  }

  async function handleApprovePairing() {
    setApprovingPair(true)
    try {
      await approveTelegramPairing(pairingCode)
      toast.success('Pairing approved. Your bot will now respond to your messages.')
      setPairingCode('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve pairing')
    } finally {
      setApprovingPair(false)
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Profile</CardTitle>
          <CardDescription>Update your name, email, and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</label>
              <Input placeholder="Your name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
              <Input type="email" placeholder="you@example.com" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
            </div>
          </div>

          {user.hasPassword && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current password</label>
                <Input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">New password</label>
                <Input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirm new password</label>
                <Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
          )}

          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save profile
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscription and credits</CardTitle>
            <CardDescription>
              Your Foyer subscription includes AI credits for workspace commands.
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
              Foyer manages AI access for you — no API keys to paste. Your credits are deducted per command.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Telegram</CardTitle>
            <CardDescription>
              Link a Telegram bot so you can chat with your Foyer agent from anywhere.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {user.telegramUsername && user.telegramLinkedAt ? (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700">
                <MessageSquare className="mr-2 inline-block h-4 w-4" />
                Bot linked — <strong>@{user.telegramUsername}</strong>
              </div>
            ) : null}

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 1 — Save bot token</p>
              <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
                <li>Open Telegram, search for <strong>@BotFather</strong></li>
                <li>Send <code className="rounded bg-muted px-1">/newbot</code> and follow the prompts</li>
                <li>BotFather replies with a token — paste it here</li>
              </ol>
              <Input
                placeholder="1234567890:ABCdef..."
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="mt-2 font-mono text-xs"
              />
              <Button
                onClick={handleSaveTelegram}
                disabled={savingTelegram || !botToken.trim()}
                className="mt-2 w-full"
              >
                {savingTelegram ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="mr-2 h-4 w-4" />
                )}
                Save bot token
              </Button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 2 — Pair your account</p>
              <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
                <li>Open Telegram and find your bot (search for the username you just created)</li>
                <li>Send it any message — the bot will reply with a short pairing code</li>
                <li>Paste that code below and click Approve</li>
              </ol>
              <Input
                placeholder="e.g. AB12CD"
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value)}
                className="mt-2 font-mono text-xs"
              />
              <Button
                onClick={handleApprovePairing}
                disabled={approvingPair || !pairingCode.trim()}
                className="mt-2 w-full"
                variant="secondary"
              >
                {approvingPair ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Approve pairing
              </Button>
            </div>
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
            Deploy your Foyer runtime with the saved default model.
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
