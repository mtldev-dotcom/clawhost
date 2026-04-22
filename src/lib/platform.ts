export const platformModels = [
  {
    id: 'openrouter/anthropic/claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    description: 'Best default balance for product work and agent tasks.',
  },
  {
    id: 'openrouter/openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Fast general-purpose model with strong multimodal support.',
  },
  {
    id: 'openrouter/google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Strong long-context reasoning for heavier tasks.',
  },
] as const

export const DEFAULT_PLATFORM_MODEL = 'openrouter/anthropic/claude-sonnet-4-6'

export function getDefaultPlatformModel() {
  return DEFAULT_PLATFORM_MODEL
}

export function isSupportedPlatformModel(model: string) {
  return platformModels.some((entry) => entry.id === model)
}
