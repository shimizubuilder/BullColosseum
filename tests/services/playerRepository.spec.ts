import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerPlayer, reportMatch, savePlayer } from '@/services/repositories/PlayerRepository'
import { createLocalPlayer } from '@/services/offline/OfflineOracle'
import type { PlayerDto } from '@/services/dto/player.dto'
import { constantRng } from '../domain/support/rng'

function serverPlayerDto(overrides: Partial<PlayerDto>): PlayerDto {
  return {
    id: 1,
    username: 'A',
    avatar: 'ansem',
    gold: 60,
    chargetoken: 0,
    wins: 0,
    losses: 0,
    rating: 1000,
    wallet: null,
    wallet_status: 'none',
    username_changed: 0,
    farm_plot: null,
    farm_capacity: 2,
    stored_bulls: [],
    farm_claim: 0,
    token: 'server-tok',
    ...overrides,
  }
}

function mockFetch(body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(body) }))
}

const input = { username: 'A', avatar: 'ansem', bullName: 'T', element: 'fire' }

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('registerPlayer', () => {
  it('creates a local player when offline', async () => {
    const result = await registerPlayer(input, false, 'local-x')
    expect(result.source).toBe('offline')
    expect(result.player.account.token).toBe('local-x')
  })

  it('uses the server player when online', async () => {
    mockFetch({ ok: true, returning: false, player: serverPlayerDto({}), bull: null })
    const result = await registerPlayer(input, true, 'local-x')
    expect(result.source).toBe('server')
    expect(result.player.account.token).toBe('server-tok')
  })
})

describe('reportMatch — single authoritative path', () => {
  const localPlayer = createLocalPlayer(input, 'local-x')

  it('applies a local delta offline on a win', async () => {
    const outcome = await reportMatch({
      player: localPlayer,
      won: true,
      reward: { xp: 9, gold: 45, token: 1 },
      opponentName: 'Foe',
      online: false,
      rng: constantRng(0),
    })
    expect(outcome.source).toBe('offline')
    expect(outcome.ratingDelta).toBe(14)
    expect(outcome.record).toEqual({ wins: 1, losses: 0, rating: 1014 })
    expect(outcome.currency).toEqual({ gold: 105, chargeToken: 1 })
  })

  it('trusts the server-authoritative values online', async () => {
    const serverPlayer = createLocalPlayer(input, 'server-tok')
    mockFetch({ ok: true, player: serverPlayerDto({ gold: 200, chargetoken: 3, wins: 10, losses: 2, rating: 1250 }), rating_delta: 18 })
    const outcome = await reportMatch({
      player: serverPlayer,
      won: true,
      reward: { xp: 9, gold: 45, token: 1 },
      opponentName: 'Foe',
      online: true,
      rng: constantRng(0),
    })
    expect(outcome.source).toBe('server')
    expect(outcome.ratingDelta).toBe(18)
    expect(outcome.record.rating).toBe(1250)
    expect(outcome.currency.gold).toBe(200)
  })
})

describe('savePlayer', () => {
  it('stays offline for a local account even when online', async () => {
    expect(await savePlayer(createLocalPlayer(input, 'local-x'), true)).toBe('offline')
  })

  it('saves to the server for a server account online', async () => {
    mockFetch({ ok: true })
    expect(await savePlayer(createLocalPlayer(input, 'server-tok'), true)).toBe('server')
  })
})
