import { apiGet, apiPost } from '@/services/http/httpClient'
import { ENDPOINTS } from '@/services/http/endpoints'
import type { NetworkResult } from '@/services/http/NetworkResult'
import type { ChallengePayload, ChallengeResponseDto, KingResponseDto } from '@/services/dto/king.dto'

export function fetchKing(): Promise<NetworkResult<KingResponseDto>> {
  return apiGet(ENDPOINTS.king)
}

export function challengeKing(payload: ChallengePayload): Promise<NetworkResult<ChallengeResponseDto>> {
  return apiPost(ENDPOINTS.king, payload)
}
