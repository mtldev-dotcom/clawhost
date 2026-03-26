'use client'

import { Instance, InstanceStatus } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Copy, Check, RefreshCw } from 'lucide-react'
import { useState } from 'react'

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

  const copyUrl = async () => {
    if (!instance.appUrl) return
    await navigator.clipboard.writeText(instance.appUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            <span>Setting up your agent. This usually takes 1-2 minutes...</span>
          </div>
        )}

        {instance.appUrl && instance.status === 'active' && (
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
        )}

        {instance.status === 'failed' && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            Something went wrong while setting up your agent. Please contact support.
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
