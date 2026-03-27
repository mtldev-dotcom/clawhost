'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Channel = 'telegram' | 'discord' | 'whatsapp'
type AiProvider = 'openai' | 'anthropic' | 'openrouter'

const channels: { id: Channel; name: string; icon: string }[] = [
  { id: 'telegram', name: 'Telegram', icon: '🤖' },
  { id: 'discord', name: 'Discord', icon: '💬' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '📱' },
]

const providers: { id: AiProvider; name: string }[] = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'openrouter', name: 'OpenRouter' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [channel, setChannel] = useState<Channel | null>(null)
  const [channelToken, setChannelToken] = useState('')
  const [aiProvider, setAiProvider] = useState<AiProvider | null>(null)
  const [aiApiKey, setAiApiKey] = useState('')

  async function handleSubmit() {
    if (!channel || !channelToken || !aiProvider || !aiApiKey) return

    setLoading(true)
    try {
      // Update channel config
      await fetch('/api/instance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, channelToken, aiProvider, aiApiKey }),
      })

      // Trigger provision
      await fetch('/api/provision', { method: 'POST' })

      router.push('/dashboard/settings')
    } catch (error) {
      console.error('Onboarding failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Step 1: Choose your channel'}
            {step === 2 && 'Step 2: Configure AI provider'}
            {step === 3 && 'Step 3: Review & deploy'}
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
                How do you want to interact with your AI agent?
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
                    <span className="font-medium">{c.name}</span>
                  </button>
                ))}
              </div>
              {channel && (
                <div className="mt-4">
                  <Label htmlFor="channelToken">
                    {channel === 'telegram' && 'Bot Token (from @BotFather)'}
                    {channel === 'discord' && 'Bot Token'}
                    {channel === 'whatsapp' && 'Webhook Secret'}
                  </Label>
                  <Input
                    id="channelToken"
                    type="password"
                    value={channelToken}
                    onChange={(e) => setChannelToken(e.target.value)}
                    placeholder="Paste your token here"
                    className="mt-1"
                  />
                </div>
              )}
              <Button
                onClick={() => setStep(2)}
                disabled={!channel || !channelToken}
                className="w-full mt-4"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Choose your AI provider and enter your API key.
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
                    <span className="font-medium">{p.name}</span>
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
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!aiProvider || !aiApiKey}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Review your configuration and deploy your agent.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Channel</span>
                  <span className="font-medium capitalize">{channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">AI Provider</span>
                  <span className="font-medium capitalize">{aiProvider}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Deploying...' : 'Deploy Agent'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
