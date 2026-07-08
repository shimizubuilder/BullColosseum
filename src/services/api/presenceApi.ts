import { apiPost } from '@/services/http/httpClient'
import { ENDPOINTS } from '@/services/http/endpoints'
import type { NetworkResult } from '@/services/http/NetworkResult'
import type { PresencePayload, PresenceResponseDto } from '@/services/dto/presence.dto'

export function heartbeat(payload: PresencePayload): Promise<NetworkResult<PresenceResponseDto>> {
  return apiPost(ENDPOINTS.presence, payload)
}
