'use client'

import { useState } from 'react'
import { Instance } from '@prisma/client'
import { ChannelSetup } from '@/components/dashboard/ChannelSetup'
import { AiSetup } from '@/components/dashboard/AiSetup'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { updateChannelConfig, updateAiConfig, deployInstance } from './actions'
import { Rocket, Settings, Cpu } from 'lucide-react'
import type { Channel, AiProvider } from '@/types'

interface DashboardClientProps {
  instance: Instance
}

export function DashboardClient({ instance }: DashboardClientProps) {
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChannelUpdate = async (channel: Channel, token: string) => {
    try {
      setError(null)
      await updateChannelConfig(channel, token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update channel')
    }
  }

  const handleAiUpdate = async (provider: AiProvider, apiKey: string) => {
    try {
      setError(null)
      await updateAiConfig(provider, apiKey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update AI config')
    }
  }

  const handleDeploy = async () => {
    try {
      setDeploying(true)
      setError(null)
      await deployInstance()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed')
    } finally {
      setDeploying(false)
    }
  }

  const canDeploy = instance.channel && instance.channelToken && instance.aiProvider && instance.aiApiKey
  const isConfigured = instance.status !== 'pending'

  return (
    <div className="space-y-6">
      <Tabs defaultValue="channel">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="channel" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Channel
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            AI Provider
          </TabsTrigger>
        </TabsList>
        <TabsContent value="channel">
          <ChannelSetup
            currentChannel={instance.channel}
            currentToken={instance.channelToken}
            onUpdate={handleChannelUpdate}
          />
        </TabsContent>
        <TabsContent value="ai">
          <AiSetup
            currentProvider={instance.aiProvider}
            currentApiKey={instance.aiApiKey}
            onUpdate={handleAiUpdate}
          />
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isConfigured && (
        <Button
          onClick={handleDeploy}
          disabled={!canDeploy || deploying}
          className="w-full"
          size="lg"
        >
          <Rocket className="mr-2 h-5 w-5" />
          {deploying ? 'Deploying...' : 'Save & Deploy'}
        </Button>
      )}

      {isConfigured && instance.status === 'active' && (
        <Button
          onClick={handleDeploy}
          disabled={deploying}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <Rocket className="mr-2 h-5 w-5" />
          {deploying ? 'Redeploying...' : 'Redeploy with New Settings'}
        </Button>
      )}
    </div>
  )
}
