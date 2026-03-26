export type Channel = 'telegram' | 'discord' | 'whatsapp'
export type AiProvider = 'openai' | 'anthropic' | 'openrouter'

export type InstanceStatus = 'pending' | 'provisioning' | 'active' | 'failed' | 'cancelled'

export interface ProvisionPayload {
  channel: Channel
  channelToken: string
  aiProvider: AiProvider
  aiApiKey: string
}
