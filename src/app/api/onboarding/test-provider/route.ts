import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { provider, apiKey } = await req.json()

  if (!provider || !apiKey) {
    return NextResponse.json({ error: 'Missing provider or apiKey' }, { status: 400 })
  }

  try {
    let valid = false
    let error = ''

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      valid = res.ok
      if (!valid) {
        const data = await res.json().catch(() => ({}))
        error = data.error?.message || 'Invalid OpenAI API key'
      }
    } else if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      })
      // 200 = success, 400 = auth worked but bad request, 401/403 = bad key
      valid = res.ok || res.status === 400
      if (!valid) {
        const data = await res.json().catch(() => ({}))
        error = data.error?.message || 'Invalid Anthropic API key'
      }
    } else if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      valid = res.ok
      if (!valid) {
        error = 'Invalid OpenRouter API key'
      }
    } else {
      return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
    }

    return NextResponse.json({ valid, error: valid ? undefined : error })
  } catch (err) {
    console.error('Provider test failed:', err)
    return NextResponse.json({ valid: false, error: 'Connection failed' })
  }
}
