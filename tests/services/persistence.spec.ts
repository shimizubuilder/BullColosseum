import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { browserStorage, loadSave, writeSave, type KeyValueStore } from '@/services/offline/LocalSaveStore'
import { createSaveCoordinator } from '@/services/offline/SaveCoordinator'
import type { PersistedState } from '@/services/offline/saveSchema'
import type { Player } from '@/domain/models/player'

function fakeStorage(seed: Record<string, string> = {}): KeyValueStore {
  const map = new Map(Object.entries(seed))
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  }
}

const player: Player = {
  account: { username: 'A', avatar: 'ansem', token: 'local-x' },
  wallet: { address: null, status: 'none' },
  usernameChanged: false,
  currency: { gold: 60, chargeToken: 0 },
  record: { wins: 0, losses: 0, rating: 1000 },
  activeBull: { name: 'T', element: 'fire', level: 1, xp: 0, gear: [], traits: [], mythic: false },
  storedBulls: [],
  farm: { plotIndex: null, capacity: 2, lastClaimAt: 0 },
}
const state: PersistedState = { player, tutorialDone: false }

describe('LocalSaveStore round-trip', () => {
  it('writes and reads back an identical state', () => {
    const storage = fakeStorage()
    writeSave(storage, state)
    expect(loadSave(storage)).toEqual(state)
  })

  it('returns null on a corrupt current save with no legacy blob', () => {
    const storage = fakeStorage({ chargearena_v3: JSON.stringify({ schemaVersion: 3, data: { bogus: true } }) })
    expect(loadSave(storage)).toBeNull()
  })
})

describe('legacy v2 migration', () => {
  const legacy = {
    username: 'Ansem',
    avatar: 'red',
    token: 'server-abc',
    gold: 240,
    tok: 5,
    wins: 12,
    losses: 4,
    rating: 1180,
    wallet: 'addr',
    walletStatus: 'linked',
    usernameChanged: 1,
    farm: { plot: 3, capacity: 4, lastClaim: 1_700_000_000 },
    stored: [{ name: 'Calf', elem: 'shadow', lv: 4, xp: 1 }],
    bull: { name: 'Toro', elem: 'bolt', lv: 6, xp: 2, gear: ['iron_horn'], traits: ['alpha'], mythic: 1 },
  }

  it('upgrades a chargearena_v2 blob and folds in the tutorial flag', () => {
    const storage = fakeStorage({
      chargearena_v2: JSON.stringify(legacy),
      chargearena_tut: '1',
    })
    const loaded = loadSave(storage)
    expect(loaded?.tutorialDone).toBe(true)
    expect(loaded?.player?.currency).toEqual({ gold: 240, chargeToken: 5 })
    expect(loaded?.player?.wallet).toEqual({ address: 'addr', status: 'linked' })
    expect(loaded?.player?.activeBull).toMatchObject({ element: 'bolt', level: 6, mythic: true })
    expect(loaded?.player?.storedBulls[0]).toMatchObject({ element: 'shadow', level: 4 })
    expect(loaded?.player?.farm).toEqual({ plotIndex: 3, capacity: 4, lastClaimAt: 1_700_000_000 })
  })

  it('persists the migrated state as v3 and stops reading legacy afterwards', () => {
    const storage = fakeStorage({ chargearena_v2: JSON.stringify(legacy), chargearena_tut: '0' })
    loadSave(storage)
    expect(storage.getItem('chargearena_v3')).toBeTruthy()
    expect(loadSave(storage)?.player?.account.username).toBe('Ansem')
  })
})

describe('browserStorage', () => {
  it('degrades gracefully without a localStorage global', () => {
    const storage = browserStorage()
    expect(storage.getItem('anything')).toBeNull()
    expect(() => storage.setItem('a', 'b')).not.toThrow()
  })
})

describe('SaveCoordinator', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('debounces multiple schedules into a single persist of the latest state', () => {
    const persist = vi.fn()
    const coordinator = createSaveCoordinator(persist, 400)
    coordinator.schedule(state)
    coordinator.schedule({ ...state, tutorialDone: true })
    expect(persist).not.toHaveBeenCalled()
    vi.advanceTimersByTime(400)
    expect(persist).toHaveBeenCalledTimes(1)
    expect(persist).toHaveBeenCalledWith({ ...state, tutorialDone: true })
  })

  it('flush persists the pending state immediately', () => {
    const persist = vi.fn()
    const coordinator = createSaveCoordinator(persist, 400)
    coordinator.schedule(state)
    coordinator.flush()
    expect(persist).toHaveBeenCalledWith(state)
  })
})
