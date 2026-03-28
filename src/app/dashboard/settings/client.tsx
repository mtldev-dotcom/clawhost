'use client'

import { useState } from 'react'
import { Instance, ProviderConfig } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  Sparkles,
  Zap,
  Check,
  X,
  Loader2,
  Plus,
  Trash2,
  MessageSquare,
  Settings,
  Rocket,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  saveProvider,
  deleteProvider,
  testProvider,
  setActiveProvider,
  updateChannelConfig,
  deployInstance,
  approvePairingCode,
} from './actions'
import type { AiProvider, Channel } from '@/types'

interface SettingsTranslations {
  settings: {
    title: string
    instanceStatus: string
    runningAt: string
    configureFirst: string
    aiProviders: string
    channel: string
    addProvider: string
    saveProvider: string
    testKey: string
    providerSaved: string
    providerDeleted: string
    keyValid: string
    keyInvalid: string
    switchedTo: string
    channelSaved: string
    deploymentStarted: string
  }
  providers: Record<string, { label: string; description: string }>
  channels: Record<string, { label: string; placeholder: string }>
  common: {
    save: string
    cancel: string
    delete: string
    deploy: string
    redeploy: string
    deploying: string
    active: string
    valid: string
    invalid: string
  }
}

interface SettingsClientProps {
  instance: Instance
  providers: ProviderConfig[]
  translations: SettingsTranslations
}

const providerModels: Record<AiProvider, string[]> = {
  openai: ['openai/gpt-4o', 'openai/gpt-4-turbo', 'openai/gpt-3.5-turbo'],
  anthropic: ['anthropic/claude-sonnet-4-6', 'anthropic/claude-opus-4-6', 'anthropic/claude-haiku-4-5'],
  openrouter: ['openrouter/anthropic/claude-sonnet-4-6', 'openrouter/openai/gpt-4o'],
}

const providerIcons: Record<AiProvider, typeof Brain> = {
  openai: Sparkles,
  anthropic: Brain,
  openrouter: Zap,
}

export function SettingsClient({ instance, providers: initialProviders, translations: t }: SettingsClientProps) {
  const [providers, setProviders] = useState(initialProviders)
  const [newProvider, setNewProvider] = useState<AiProvider | null>(null)
  const [newApiKey, setNewApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Channel state
  const [channel, setChannel] = useState<Channel | null>((instance.channel as Channel) || null)
  const [channelToken, setChannelToken] = useState(instance.channelToken || '')
  const [savingChannel, setSavingChannel] = useState(false)

  // Pairing state
  const [pairingCode, setPairingCode] = useState('')
  const [approvingPairing, setApprovingPairing] = useState(false)

  // Deploy state
  const [deploying, setDeploying] = useState(false)

  const handleSaveProvider = async () => {
    if (!newProvider || !newApiKey) return
    setSaving(true)
    setError(null)
    try {
      const result = await saveProvider(newProvider, newApiKey)
      setProviders((prev) => {
        const existing = prev.findIndex((p) => p.provider === newProvider)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = result
          return updated
        }
        return [...prev, result]
      })
      setNewProvider(null)
      setNewApiKey('')
      setSuccess(t.settings.providerSaved)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save provider')
    } finally {
      setSaving(false)
    }
  }

  const handleTestProvider = async (providerId: string) => {
    setTesting(providerId)
    setError(null)
    try {
      const result = await testProvider(providerId)
      setProviders((prev) =>
        prev.map((p) => (p.id === providerId ? { ...p, isValid: result.valid } : p))
      )
      if (result.valid) {
        setSuccess(t.settings.keyValid)
      } else {
        setError(t.settings.keyInvalid)
      }
      setTimeout(() => { setSuccess(null); setError(null) }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test provider')
    } finally {
      setTesting(null)
    }
  }

  const handleDeleteProvider = async (providerId: string) => {
    try {
      await deleteProvider(providerId)
      setProviders((prev) => prev.filter((p) => p.id !== providerId))
      setSuccess(t.settings.providerDeleted)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete provider')
    }
  }

  const handleSetActive = async (providerId: string, model: string) => {
    try {
      await setActiveProvider(providerId, model)
      setProviders((prev) =>
        prev.map((p) => ({ ...p, isActive: p.id === providerId }))
      )
      setSuccess(`${t.settings.switchedTo} ${model}`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set active provider')
    }
  }

  const handleSaveChannel = async () => {
    if (!channel || !channelToken) return
    setSavingChannel(true)
    setError(null)
    try {
      await updateChannelConfig(channel, channelToken)
      setSuccess(t.settings.channelSaved)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save channel')
    } finally {
      setSavingChannel(false)
    }
  }

  const handleDeploy = async () => {
    setDeploying(true)
    setError(null)
    try {
      await deployInstance()
      setSuccess(t.settings.deploymentStarted)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed')
    } finally {
      setDeploying(false)
    }
  }

  const handleApprovePairing = async () => {
    if (!pairingCode.trim()) return
    setApprovingPairing(true)
    setError(null)
    try {
      await approvePairingCode(pairingCode.trim())
      setSuccess('Pairing approved! You can now chat with the bot.')
      setPairingCode('')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve pairing')
    } finally {
      setApprovingPairing(false)
    }
  }

  const canDeploy = channel && channelToken && providers.length > 0

  return (
    <div className="space-y-6">
      {/* Status messages */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
          {success}
        </div>
      )}

      {/* Instance Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.settings.instanceStatus}</CardTitle>
            <Badge
              variant={
                instance.status === 'active'
                  ? 'default'
                  : instance.status === 'failed'
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {instance.status}
            </Badge>
          </div>
          {instance.appUrl && (
            <CardDescription>
              {t.settings.runningAt}: <code className="text-xs">{instance.appUrl}</code>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleDeploy}
            disabled={!canDeploy || deploying}
            className="w-full"
          >
            <Rocket className="mr-2 h-4 w-4" />
            {deploying ? t.common.deploying : instance.status === 'active' ? t.common.redeploy : t.common.deploy}
          </Button>
          {!canDeploy && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {t.settings.configureFirst}
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="providers">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t.settings.aiProviders}
          </TabsTrigger>
          <TabsTrigger value="channel" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t.settings.channel}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          {/* Saved Providers */}
          {providers.map((provider) => {
            const providerKey = provider.provider as AiProvider
            const Icon = providerIcons[providerKey] || Sparkles
            const models = providerModels[providerKey] || []
            const providerTrans = t.providers[providerKey]
            return (
              <Card key={provider.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base">{providerTrans?.label || provider.provider}</CardTitle>
                        <CardDescription className="text-xs">
                          {provider.apiKey.slice(0, 8)}...{provider.apiKey.slice(-4)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {provider.isValid === true && (
                        <Badge variant="default" className="bg-green-500">
                          <Check className="mr-1 h-3 w-3" /> {t.common.valid}
                        </Badge>
                      )}
                      {provider.isValid === false && (
                        <Badge variant="destructive">
                          <X className="mr-1 h-3 w-3" /> {t.common.invalid}
                        </Badge>
                      )}
                      {provider.isActive && (
                        <Badge variant="secondary">{t.common.active}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Model selection */}
                  <div className="flex flex-wrap gap-2">
                    {models.map((model) => (
                      <Button
                        key={model}
                        variant={instance.activeModel === model ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSetActive(provider.id, model)}
                      >
                        {model.split('/').pop()}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestProvider(provider.id)}
                      disabled={testing === provider.id}
                    >
                      {testing === provider.id ? (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      ) : null}
                      {t.settings.testKey}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProvider(provider.id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Add new provider */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t.settings.addProvider}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {(Object.keys(providerModels) as AiProvider[]).map((key) => {
                  const Icon = providerIcons[key]
                  const providerTrans = t.providers[key]
                  const isSelected = newProvider === key
                  const alreadyAdded = providers.some((p) => p.provider === key)
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => setNewProvider(key)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all',
                        alreadyAdded
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:border-primary/50',
                        isSelected ? 'border-primary bg-primary/5' : 'border-muted'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute right-2 top-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{providerTrans?.label || key}</span>
                      <span className="text-xs text-muted-foreground">{providerTrans?.description || ''}</span>
                    </button>
                  )
                })}
              </div>

              {newProvider && (
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder={`Enter your ${t.providers[newProvider]?.label || newProvider} API key`}
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProvider} disabled={!newApiKey || saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {t.settings.saveProvider}
                    </Button>
                    <Button variant="outline" onClick={() => { setNewProvider(null); setNewApiKey('') }}>
                      {t.common.cancel}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channel">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.channel}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {(['telegram', 'discord', 'whatsapp'] as Channel[]).map((key) => {
                  const channelTrans = t.channels[key]
                  const isSelected = channel === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setChannel(key)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50',
                        isSelected ? 'border-primary bg-primary/5' : 'border-muted'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute right-2 top-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <MessageSquare className="h-6 w-6" />
                      <span className="text-sm font-medium">{channelTrans?.label || key}</span>
                    </button>
                  )
                })}
              </div>

              {channel && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="channel-token">{t.channels[channel]?.label || channel} Token</Label>
                    <Input
                      id="channel-token"
                      type="password"
                      placeholder={t.channels[channel]?.placeholder || ''}
                      value={channelToken}
                      onChange={(e) => setChannelToken(e.target.value)}
                    />
                    <Button onClick={handleSaveChannel} disabled={!channelToken || savingChannel}>
                      {savingChannel ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {t.common.save}
                    </Button>
                  </div>

                  {/* Pairing Code Section */}
                  {instance.status === 'active' && channel === 'telegram' && (
                    <div className="space-y-2 border-t pt-4">
                      <Label htmlFor="pairing-code">Telegram Pairing Code</Label>
                      <p className="text-xs text-muted-foreground">
                        Message your bot on Telegram to get a pairing code, then enter it here to authorize.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          id="pairing-code"
                          placeholder="e.g. 93KKNB9G"
                          value={pairingCode}
                          onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                          className="font-mono"
                        />
                        <Button onClick={handleApprovePairing} disabled={!pairingCode.trim() || approvingPairing}>
                          {approvingPairing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Approve
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
