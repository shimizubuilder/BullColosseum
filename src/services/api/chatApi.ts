import { apiGet, apiPost } from '@/services/http/httpClient'
import { ENDPOINTS } from '@/services/http/endpoints'
import type { NetworkResult } from '@/services/http/NetworkResult'
import type { ChatPollResponseDto } from '@/services/dto/chat.dto'

export function poll(since: number): Promise<NetworkResult<ChatPollResponseDto>> {
  return since > 0 ? apiGet(ENDPOINTS.chat, { since }) : apiGet(ENDPOINTS.chat)
}

export function post(username: string, avatar: string, message: string): Promise<NetworkResult<{ ok: boolean }>> {
  return apiPost(ENDPOINTS.chat, { action: 'post', username, avatar, message })
}
