'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Brain, Sparkles, Zap, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AiProvider } from '@/types'

interface AiSetupProps {
  currentProvider?: string | null
  currentApiKey?: string | null
  onUpdate: (provider: AiProvider, apiKey: string) => Promise<void>
}

const providers: { value: AiProvider; label: string; icon: typeof Brain; description: string }[] = [
  {
    value: 'openai',
    label: 'OpenAI',
    icon: Sparkles,
    description: 'GPT-4, GPT-3.5 Turbo',
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    icon: Brain,
    description: 'Claude 3 Opus, Sonnet',
  },
  {
    value: 'openrouter',
    label: 'OpenRouter',
    icon: Zap,
    description: 'Access multiple providers',
  },
]

export function AiSetup({ currentProvider, currentApiKey, onUpdate }: AiSetupProps) {
  const [selectedProvider, setSelectedProvider] = useState<AiProvider | null>(
    (currentProvider as AiProvider) || null
  )
  const [apiKey, setApiKey] = useState(currentApiKey || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedProvider || !apiKey) return
    setSaving(true)
    try {
      await onUpdate(selectedProvider, apiKey)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Provider Configuration</CardTitle>
        <CardDescription>
          Choose which AI provider powers your agent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {providers.map((provider) => {
            const Icon = provider.icon
            const isSelected = selectedProvider === provider.value
            return (
              <button
                key={provider.value}
                type="button"
                onClick={() => setSelectedProvider(provider.value)}
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
                <Icon className="h-8 w-8" />
                <span className="font-medium">{provider.label}</span>
                <span className="text-xs text-muted-foreground">
                  {provider.description}
                </span>
              </button>
            )
          })}
        </div>

        {selectedProvider && (
          <div className="space-y-2">
            <Label htmlFor="ai-api-key">
              {selectedProvider === 'openai' && 'OpenAI API Key (sk-...)'}
              {selectedProvider === 'anthropic' && 'Anthropic API Key (sk-ant-...)'}
              {selectedProvider === 'openrouter' && 'OpenRouter API Key'}
            </Label>
            <Input
              id="ai-api-key"
              type="password"
              placeholder="Paste your API key here..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={!selectedProvider || !apiKey || saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save AI Configuration'}
        </Button>
      </CardContent>
    </Card>
  )
}
