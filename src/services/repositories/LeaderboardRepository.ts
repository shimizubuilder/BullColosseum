import type { LeaderboardEntryDto } from '@/services/dto/leaderboard.dto'
import * as leaderboardApi from '@/services/api/leaderboardApi'
import { offlineLeaderboard } from '@/services/offline/OfflineOracle'

export interface LeaderboardResult {
  entries: LeaderboardEntryDto[]
  source: 'server' | 'offline'
}

export async function fetchLeaderboard(self: LeaderboardEntryDto, online: boolean): Promise<LeaderboardResult> {
  if (online) {
    const result = await leaderboardApi.fetchLeaderboard()
    if (result.status === 'ok' && result.data.ok && Array.isArray(result.data.leaderboard)) {
      return { entries: result.data.leaderboard, source: 'server' }
    }
  }
  return { entries: offlineLeaderboard(self), source: 'offline' }
}
