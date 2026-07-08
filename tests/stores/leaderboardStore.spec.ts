import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLeaderboardStore } from '@/stores/useLeaderboardStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { createLocalPlayer } from '@/services/offline/OfflineOracle'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useLeaderboardStore', () => {
  it('loads offline rankings with the current player injected and ranked', async () => {
    const player = usePlayerStore()
    const session = useSessionStore()
    session.setOnline(false)
    player.setPlayer(
      createLocalPlayer({ username: 'Ansem', avatar: 'red', bullName: 'Toro', element: 'fire' }, 'local-x'),
    )

    const leaderboard = useLeaderboardStore()
    await leaderboard.load()

    expect(leaderboard.source).toBe('offline')
    expect(leaderboard.entries).toHaveLength(7)
    expect(leaderboard.entries[0].rank).toBe(1)
    const self = leaderboard.entries.find((entry) => entry.username === 'Ansem')
    expect(self?.rank).toBe(7)
  })
})
