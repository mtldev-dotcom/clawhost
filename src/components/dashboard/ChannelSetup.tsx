'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MessageCircle, Send, Phone, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Channel } from '@/types'

interface ChannelSetupProps {
  currentChannel?: string | null
  currentToken?: string | null
  onUpdate: (channel: Channel, token: string) => Promise<void>
}

const channels: { value: Channel; label: string; icon: typeof MessageCircle; description: string }[] = [
  {
    value: 'telegram',
    label: 'Telegram',
    icon: Send,
    description: 'Connect via Telegram Bot API',
  },
  {
    value: 'discord',
    label: 'Discord',
    icon: MessageCircle,
    description: 'Connect via Discord Bot Token',
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: Phone,
    description: 'Connect via WhatsApp Business API',
  },
]

export function ChannelSetup({ currentChannel, currentToken, onUpdate }: ChannelSetupProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(
    (currentChannel as Channel) || null
  )
  const [token, setToken] = useState(currentToken || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedChannel || !token) return
    setSaving(true)
    try {
      await onUpdate(selectedChannel, token)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Configuration</CardTitle>
        <CardDescription>
          Choose which messaging platform to connect your agent to
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {channels.map((channel) => {
            const Icon = channel.icon
            const isSelected = selectedChannel === channel.value
            return (
              <button
                key={channel.value}
                type="button"
                onClick={() => setSelectedChannel(channel.value)}
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
                <span className="font-medium">{channel.label}</span>
                <span className="text-xs text-muted-foreground">
                  {channel.description}
                </span>
              </button>
            )
          })}
        </div>

        {selectedChannel && (
          <div className="space-y-2">
            <Label htmlFor="channel-token">
              {selectedChannel === 'telegram' && 'Bot Token (from @BotFather)'}
              {selectedChannel === 'discord' && 'Bot Token (from Discord Developer Portal)'}
              {selectedChannel === 'whatsapp' && 'API Key (from WhatsApp Business)'}
            </Label>
            <Input
              id="channel-token"
              type="password"
              placeholder="Paste your token here..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={!selectedChannel || !token || saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Channel Configuration'}
        </Button>
      </CardContent>
    </Card>
  )
}
