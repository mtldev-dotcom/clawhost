'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { quickCapture } from '@/app/dashboard/workspace/actions'

export function QuickCapture() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [pending, setPending] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.shiftKey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 50)
  }, [open])

  async function handleSubmit() {
    if (!text.trim() || pending) return
    setPending(true)
    const fd = new FormData()
    fd.set('text', text)
    try {
      await quickCapture(fd)
      setText('')
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-emerald-500 p-3 text-white shadow-lg hover:bg-emerald-600 transition"
        title="Quick capture (Cmd+Shift+K)"
      >
        <Plus className="h-5 w-5" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-6"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-background p-4 shadow-2xl border"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Quick capture</p>
              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <textarea
              ref={ref}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Dump anything. We'll triage in your Inbox."
              className="w-full min-h-[120px] rounded-md border p-3 text-sm resize-none focus:outline-none focus:border-emerald-500"
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={pending || !text.trim()}>
                {pending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Capture
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
