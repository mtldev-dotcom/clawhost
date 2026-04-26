export const platformModels = [
  {
    id: 'openrouter/nvidia/nemotron-3-super-120b-a12b:free',
    name: 'Nemotron Super 120B',
    description: 'NVIDIA free-tier flagship. Strong reasoning, no cost.',
  },
  {
    id: 'openrouter/moonshotai/kimi-k2.6',
    name: 'Kimi K2.6',
    description: 'Moonshot long-context model. Strong for document-heavy workspaces.',
  },
  {
    id: 'openrouter/deepseek/deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    description: 'Flagship DeepSeek model. Best quality for complex reasoning tasks.',
  },
  {
    id: 'openrouter/deepseek/deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    description: 'Fast and cheap. Good for repetitive agent tasks. ~$0.14/M tokens.',
  },
  {
    id: 'openrouter/minimax/minimax-m2.7',
    name: 'MiniMax M2.7',
    description: 'Efficient mid-range model. Good balance of speed and capability.',
  },
] as const

export const DEFAULT_PLATFORM_MODEL = 'openrouter/nvidia/nemotron-3-super-120b-a12b:free'

export function getDefaultPlatformModel() {
  return DEFAULT_PLATFORM_MODEL
}

export function isSupportedPlatformModel(model: string) {
  return platformModels.some((entry) => entry.id === model)
}
