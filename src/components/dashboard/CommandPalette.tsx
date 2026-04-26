'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface CommandPaletteProps {
  targetPageId?: string
  onResult?: (result: string) => void
}

export function CommandPalette({ targetPageId, onResult }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [contextUsed, setContextUsed] = useState<{ pageId: string; pageTitle: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setResult(null)
        setError(null)
        setCommand('')
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  async function handleRun() {
    if (!command.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    setContextUsed([])
    try {
      const res = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, targetPageId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      setResult(data.answer ?? '')
      setContextUsed(data.contextUsed ?? [])
      onResult?.(data.answer ?? '')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:border-gray-400 transition"
        title="Open AI command palette (Cmd+K)"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Ask AI</span>
        <kbd className="ml-2 hidden text-xs text-muted-foreground sm:inline">⌘K</kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <Card className="w-full max-w-2xl p-0 overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Sparkles className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            value={command}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleRun() }}
            placeholder="Ask about your workspace… (e.g. Summarize my client notes)"
            className="border-0 shadow-none focus-visible:ring-0 px-0 text-base"
          />
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap leading-relaxed">{result}</div>
              {contextUsed.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Sources: {contextUsed.map(c => c.pageTitle).join(', ')}
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setResult(null); setCommand('') }}>
                  New command
                </Button>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Quick commands</p>
              {[
                'Summarize this page',
                'What are my open action items?',
                'Draft a weekly update from my notes',
                'List all clients with pending follow-ups',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setCommand(suggestion)}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {!result && (
          <div className="border-t px-4 py-3 flex justify-end">
            <Button onClick={handleRun} disabled={loading || !command.trim()} size="sm">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
