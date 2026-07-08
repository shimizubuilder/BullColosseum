import { apiGet } from '@/services/http/httpClient'
import { ENDPOINTS } from '@/services/http/endpoints'
import type { NetworkResult } from '@/services/http/NetworkResult'
import type { FarmListResponseDto } from '@/services/dto/farm.dto'

export function listFarms(): Promise<NetworkResult<FarmListResponseDto>> {
  return apiGet(ENDPOINTS.farm)
}
