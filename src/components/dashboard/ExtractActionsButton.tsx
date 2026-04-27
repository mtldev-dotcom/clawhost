'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

export function ExtractActionsButton({ pageId }: { pageId: string }) {
  const [pending, setPending] = useState(false)
  const [count, setCount] = useState<number | null>(null)

  async function run() {
    setPending(true)
    try {
      const res = await fetch('/api/ai/extract-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      })
      const data = await res.json()
      setCount(typeof data.extracted === 'number' ? data.extracted : 0)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mb-2 flex items-center gap-2">
      <button
        onClick={run}
        disabled={pending}
        className="text-xs rounded-md border px-2 py-1 hover:border-emerald-500 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
        ) : (
          <Sparkles className="inline h-3 w-3 mr-1" />
        )}
        Extract action items
      </button>
      {count !== null && (
        <span className="text-xs text-muted-foreground">Extracted {count}.</span>
      )}
    </div>
  )
}
