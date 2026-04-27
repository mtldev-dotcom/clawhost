'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

export function PageScopedAsk({ pageId }: { pageId: string }) {
  const [q, setQ] = useState('')
  const [a, setA] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function run() {
    if (!q.trim()) return
    setPending(true)
    setA(null)
    try {
      const res = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: q, scopeToPageId: pageId }),
      })
      const data = await res.json()
      setA(data.answer ?? data.error ?? '')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') run() }}
          placeholder="Ask about this page..."
          className="flex-1 rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 bg-background"
        />
        <button
          onClick={run}
          disabled={pending || !q.trim()}
          className="rounded-md border px-3 py-1.5 text-sm hover:border-emerald-500 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
        </button>
      </div>
      {a && <div className="mt-2 rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">{a}</div>}
    </div>
  )
}
