import { apiGet } from '@/services/http/httpClient'
import { ENDPOINTS } from '@/services/http/endpoints'
import type { NetworkResult } from '@/services/http/NetworkResult'
import type { LeaderboardResponseDto } from '@/services/dto/leaderboard.dto'

export function fetchLeaderboard(): Promise<NetworkResult<LeaderboardResponseDto>> {
  return apiGet(ENDPOINTS.leaderboard)
}

export async function ping(): Promise<boolean> {
  const result = await apiGet<{ ok: boolean }>(ENDPOINTS.leaderboard)
  return result.status === 'ok' && Boolean(result.data.ok)
}
