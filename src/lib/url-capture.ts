import { env } from '@/lib/env'

export interface CapturedUrl {
  title: string
  summary: string
  url: string
}

export async function captureUrl(url: string): Promise<CapturedUrl> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  let html = ''
  let title = url
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    if (!res.ok) throw new Error(`Fetch ${url} returned ${res.status}`)
    html = await res.text()
  } finally {
    clearTimeout(timeout)
  }

  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (match) title = match[1].trim().slice(0, 200)

  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3000)

  const aiResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': env.NEXT_PUBLIC_APP_URL,
      'X-Title': 'Foyer',
    },
    body: JSON.stringify({
      model: env.PLATFORM_DEFAULT_MODEL,
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: 'You write tight, useful 2-sentence summaries of web pages for a solo professional. No fluff.',
        },
        {
          role: 'user',
          content: `URL: ${url}\nTitle: ${title}\n\nContent:\n${stripped}`,
        },
      ],
    }),
  })

  let summary = ''
  if (aiResp.ok) {
    const data = await aiResp.json()
    summary = data.choices?.[0]?.message?.content?.trim() ?? ''
  }

  return { title, summary, url }
}
