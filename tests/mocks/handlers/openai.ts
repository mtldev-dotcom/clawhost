import { http, HttpResponse } from 'msw'

export const openaiHandlers = [
  // List models - used for API key validation
  http.get('https://api.openai.com/v1/models', ({ request }) => {
    const auth = request.headers.get('Authorization')

    // Valid key pattern
    if (auth?.includes('sk-proj-') || auth?.includes('sk-test-valid')) {
      return HttpResponse.json({
        object: 'list',
        data: [
          { id: 'gpt-4o', object: 'model', owned_by: 'openai' },
          { id: 'gpt-4-turbo', object: 'model', owned_by: 'openai' },
        ],
      })
    }

    // Invalid key
    return HttpResponse.json(
      { error: { message: 'Invalid API key', type: 'invalid_request_error' } },
      { status: 401 }
    )
  }),

  // Chat completions
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: 'Test response' },
          finish_reason: 'stop',
        },
      ],
    })
  }),
]
