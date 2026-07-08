import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LeaderboardEntryDto } from '@/services/dto/leaderboard.dto'
import type { Player } from '@/domain/models/player'
import { fetchLeaderboard } from '@/services/repositories/LeaderboardRepository'
import { usePlayerStore } from './usePlayerStore'
import { useSessionStore } from './useSessionStore'

function selfEntry(player: Player | null, tier: number): LeaderboardEntryDto {
  return {
    username: player?.account.username ?? 'You',
    avatar: player?.account.avatar ?? 'ansem',
    rating: player?.record.rating ?? 0,
    wins: player?.record.wins ?? 0,
    losses: player?.record.losses ?? 0,
    tier,
  }
}

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const entries = ref<LeaderboardEntryDto[]>([])
  const source = ref<'server' | 'offline'>('offline')
  const loading = ref(false)

  async function load(): Promise<void> {
    const player = usePlayerStore()
    const session = useSessionStore()
    loading.value = true
    const result = await fetchLeaderboard(selfEntry(player.player, player.tier), session.online)
    entries.value = result.entries
    source.value = result.source
    loading.value = false
  }

  return { entries, source, loading, load }
})
