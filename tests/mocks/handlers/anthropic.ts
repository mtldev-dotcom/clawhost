import { http, HttpResponse } from 'msw'

export const anthropicHandlers = [
  // Messages API - used for API key validation
  http.post('https://api.anthropic.com/v1/messages', ({ request }) => {
    const apiKey = request.headers.get('x-api-key')

    // Valid key pattern
    if (apiKey?.startsWith('sk-ant-')) {
      return HttpResponse.json({
        id: 'msg_test',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Test response' }],
        model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn',
      })
    }

    // Invalid key
    return HttpResponse.json(
      { error: { type: 'authentication_error', message: 'Invalid API key' } },
      { status: 401 }
    )
  }),
]
