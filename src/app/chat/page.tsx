'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const t = useTranslations('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Check if agent is ready
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/chat/history')
        if (res.ok) {
          setIsReady(true)
          const data = await res.json()
          if (data.history && data.history.length > 0) {
            // Convert history to messages format
            const historyMessages: Message[] = data.history.map(
              (h: { role: string; content: string; timestamp?: string }, i: number) => ({
                id: `hist-${i}`,
                role: h.role as 'user' | 'assistant',
                content: h.content,
                timestamp: h.timestamp ? new Date(h.timestamp) : new Date(),
              })
            )
            setMessages(historyMessages)
          }
        } else if (res.status === 503) {
          setIsReady(false)
          const data = await res.json()
          setError(
            data.error === 'Instance not active'
              ? t('provisioningMessage')
              : t('agentNotReady')
          )
        } else {
          setIsReady(false)
          setError(t('agentNotReady'))
        }
      } catch {
        setIsReady(false)
        setError(t('agentNotReady'))
      }
    }

    checkStatus()
  }, [t])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    // Create placeholder for assistant response
    const assistantMessageId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ])

    try {
      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
        signal: abortControllerRef.current.signal,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send message')
      }

      // Handle SSE streaming
      const reader = res.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      setIsLoading(false)
      setIsStreaming(true)

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'delta' && data.text) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: msg.content + data.text }
                      : msg
                  )
                )
              } else if (data.type === 'done') {
                setIsStreaming(false)
              } else if (data.type === 'error') {
                throw new Error(data.error)
              }
            } catch (err) {
              console.error('Failed to parse SSE data:', err)
            }
          }
        }
      }

      setIsStreaming(false)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to send message')
      setIsLoading(false)
      setIsStreaming(false)

      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))
    }
  }

  // Show welcome message on first load
  const showWelcome = isReady && messages.length === 0

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-background">
      {/* Error banner */}
      {error && (
        <div className="border-b bg-destructive/10 px-4 py-3">
          <div className="mx-auto flex max-w-4xl items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {showWelcome ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Bot className="h-12 w-12 text-primary" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold">{t('title')}</h1>
            <p className="mt-2 max-w-md text-muted-foreground">
              {t('welcomeMessage') || 'Your agent is ready. Say hello! 👋'}
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-4',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.content ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  ) : isStreaming ? (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-current"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-current"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  ) : null}
                </div>
                {message.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && !isStreaming && (
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {t('thinking')}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t bg-background p-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('placeholder')}
            disabled={isLoading || isStreaming || isReady === false}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || isStreaming || isReady === false}
          >
            {isLoading || isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}