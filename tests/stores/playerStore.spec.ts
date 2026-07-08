import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { setupPersistence } from '@/stores/plugins/persistence'
import type { KeyValueStore } from '@/services/offline/LocalSaveStore'
import type { MatchOutcome } from '@/services/repositories/PlayerRepository'
import type { Player } from '@/domain/models/player'

function fakeStorage(seed: Record<string, string> = {}): KeyValueStore {
  const map = new Map(Object.entries(seed))
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  }
}

const registerInput = { username: 'Ansem', avatar: 'ansem', bullName: 'Toro', element: 'fire' }

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useSessionStore', () => {
  it('tracks connectivity and data source', () => {
    const session = useSessionStore()
    expect(session.online).toBe(false)
    session.setOnline(true)
    session.setDataSource('server')
    expect(session.online).toBe(true)
    expect(session.dataSource).toBe('server')
  })
})

describe('usePlayerStore', () => {
  it('registers a local player when offline', async () => {
    const player = usePlayerStore()
    await player.register(registerInput)
    expect(player.player?.account.username).toBe('Ansem')
    expect(player.player?.account.token.startsWith('local-')).toBe(true)
    expect(player.isServerAccount).toBe(false)
  })

  it('exposes derived stats, tier, and division', async () => {
    const player = usePlayerStore()
    await player.register(registerInput)
    expect(player.stats?.power).toBeGreaterThan(0)
    expect(player.tier).toBe(0)
    expect(player.division.name).toBe('Bronze')
  })

  it('applies a match outcome and grants xp through a single path', async () => {
    const player = usePlayerStore()
    await player.register(registerInput)
    const outcome: MatchOutcome = {
      record: { wins: 1, losses: 0, rating: 1014 },
      currency: { gold: 105, chargeToken: 1 },
      ratingDelta: 14,
      source: 'offline',
    }
    player.applyMatchResult(outcome, 9)
    expect(player.player?.record).toEqual({ wins: 1, losses: 0, rating: 1014 })
    expect(player.player?.currency).toEqual({ gold: 105, chargeToken: 1 })
    expect(player.player?.activeBull.level).toBe(2)
    expect(player.player?.activeBull.xp).toBe(2)
  })
})

describe('persistence hydration', () => {
  const savedPlayer: Player = {
    account: { username: 'Resumed', avatar: 'gold', token: 'server-xyz' },
    wallet: { address: null, status: 'none' },
    usernameChanged: false,
    currency: { gold: 300, chargeToken: 7 },
    record: { wins: 20, losses: 5, rating: 1420 },
    activeBull: { name: 'Bull', element: 'shadow', level: 8, xp: 3, gear: [], traits: [], mythic: false },
    storedBulls: [],
    farm: { plotIndex: 1, capacity: 3, lastClaimAt: 1_700_000_000 },
  }

  it('hydrates player and session from a saved v3 blob', () => {
    const storage = fakeStorage({
      chargearena_v3: JSON.stringify({ schemaVersion: 3, data: { player: savedPlayer, tutorialDone: true } }),
    })
    setupPersistence(storage)
    expect(usePlayerStore().player?.account.username).toBe('Resumed')
    expect(usePlayerStore().division.name).toBe('Platinum')
    expect(useSessionStore().tutorialDone).toBe(true)
  })
})
