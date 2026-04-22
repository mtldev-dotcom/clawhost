'use client'

import { Instance, InstanceStatus } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Copy, Check, RefreshCw, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { getOpenClawDashboardUrl } from '@/app/dashboard/actions'

interface InstanceCardProps {
  instance: Instance
}

const statusVariants: Record<InstanceStatus, 'default' | 'success' | 'warning' | 'destructive' | 'pending'> = {
  pending: 'pending',
  provisioning: 'warning',
  active: 'success',
  failed: 'destructive',
  cancelled: 'pending',
}

const statusLabels: Record<InstanceStatus, string> = {
  pending: 'Pending Setup',
  provisioning: 'Provisioning...',
  active: 'Active',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

export function InstanceCard({ instance }: InstanceCardProps) {
  const [copied, setCopied] = useState(false)
  const [openingDashboard, setOpeningDashboard] = useState(false)

  const copyUrl = async () => {
    if (!instance.appUrl) return
    await navigator.clipboard.writeText(instance.appUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openAgentDashboard = async () => {
    try {
      setOpeningDashboard(true)
      const dashboardData = await getOpenClawDashboardUrl()
      // dashboardData is like "http://localhost:4001/#token=xxx"
      // Extract port and token, use current window's hostname
      const url = new URL(dashboardData)
      const port = url.port
      const token = url.hash.replace('#token=', '')
      // Build URL using current browser's hostname (works for Tailscale/remote access)
      const agentUrl = `http://${window.location.hostname}:${port}/#token=${token}`
      window.open(agentUrl, '_blank')
    } catch (err) {
      console.error('Failed to open dashboard:', err)
    } finally {
      setOpeningDashboard(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Your Agent Instance</CardTitle>
          <Badge variant={statusVariants[instance.status]}>
            {statusLabels[instance.status]}
          </Badge>
        </div>
        <CardDescription>
          Created {new Date(instance.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {instance.status === 'provisioning' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Setting up your agent. This usually takes 1 to 2 minutes. If it stays here, refresh and check Settings.</span>
          </div>
        )}

        {instance.appUrl && instance.status === 'active' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent URL</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm">
                  {instance.appUrl}
                </code>
                <Button variant="outline" size="icon" onClick={copyUrl}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={instance.appUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            {/* TODO: Fix OpenClaw dashboard URL for remote/Tailscale access
            <Button
              variant="outline"
              onClick={openAgentDashboard}
              disabled={openingDashboard}
              className="w-full"
            >
              <Settings2 className="mr-2 h-4 w-4" />
              {openingDashboard ? 'Opening...' : 'Open Agent Dashboard'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Connect ChatGPT Plus/Pro subscription via OAuth in the Agent Dashboard
            </p>
            */}
          </div>
        )}

        {instance.status === 'failed' && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            Something went wrong while setting up your agent. Check Settings, then try redeploying. If it keeps failing, contact support.
          </div>
        )}

        {instance.status === 'pending' && (
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            Complete your configuration below and click &quot;Save & Deploy&quot; to get started.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Channel:</span>{' '}
            <span className="font-medium capitalize">{instance.channel || 'Not configured'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">AI Provider:</span>{' '}
            <span className="font-medium capitalize">{instance.aiProvider || 'Not configured'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
