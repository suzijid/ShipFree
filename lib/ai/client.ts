import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/config/env'

let _client: Anthropic | null = null

export const getAnthropicClient = (): Anthropic => {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  }
  return _client
}
