import { describe, expect, it } from 'vitest'
import { createLocalPlayer, newLocalToken, offlineLeaderboard } from '@/services/offline/OfflineOracle'
import { constantRng } from '../domain/support/rng'

describe('createLocalPlayer', () => {
  it('builds a fresh local player from the starting balance', () => {
    const player = createLocalPlayer(
      { username: 'Ansem', avatar: 'red', bullName: 'Toro', element: 'bolt' },
      'local-abc',
    )
    expect(player.account).toEqual({ username: 'Ansem', avatar: 'red', token: 'local-abc' })
    expect(player.currency).toEqual({ gold: 60, chargeToken: 0 })
    expect(player.record).toEqual({ wins: 0, losses: 0, rating: 1000 })
    expect(player.activeBull).toMatchObject({ name: 'Toro', element: 'bolt', level: 1, mythic: false })
    expect(player.farm).toEqual({ plotIndex: null, capacity: 2, lastClaimAt: 0 })
  })

  it('defaults an unknown element to fire', () => {
    const player = createLocalPlayer({ username: 'A', avatar: 'ansem', bullName: 'T', element: 'water' }, 'local-x')
    expect(player.activeBull.element).toBe('fire')
  })
})

describe('newLocalToken', () => {
  it('prefixes local tokens', () => {
    expect(newLocalToken(constantRng(0.5))).toMatch(/^local-/)
  })
})

describe('offlineLeaderboard', () => {
  it('injects self and ranks by rating descending', () => {
    const board = offlineLeaderboard({ username: 'Me', avatar: 'ansem', rating: 1500, wins: 5, losses: 2, tier: 2 })
    expect(board[0].rank).toBe(1)
    expect(board.findIndex((entry) => entry.username === 'Me')).toBe(3)
    expect(board.find((entry) => entry.username === 'Me')?.rank).toBe(4)
  })
})
