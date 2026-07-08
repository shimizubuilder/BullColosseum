import { describe, expect, it } from 'vitest'
import { driftViewers, initialViewers, pickSpectatePair } from '@/domain/combat/spectate'
import { SPECTATE } from '@/domain/config/balance'
import { constantRng, sequenceRng } from './support/rng'

const POOL = [
  { username: 'A', rating: 1800 },
  { username: 'B', rating: 1700 },
  { username: 'C', rating: 1600 },
]

describe('pickSpectatePair', () => {
  it('returns null when the pool is too small', () => {
    expect(pickSpectatePair([{ username: 'Solo', rating: 1500 }], constantRng(0))).toBeNull()
  })

  it('always picks two distinct fighters even on a collision', () => {
    const pair = pickSpectatePair(POOL, constantRng(0))
    expect(pair).not.toBeNull()
    expect(pair?.[0].username).not.toBe(pair?.[1].username)
  })

  it('draws from the ranked order of the pool', () => {
    const pair = pickSpectatePair(POOL, sequenceRng([0, 0.9]))
    expect(pair?.[0].username).toBe('A')
    expect(pair?.[1].username).toBe('C')
  })
})

describe('viewer counts', () => {
  it('seeds within the configured band and never drops below the floor', () => {
    expect(initialViewers(constantRng(0))).toBe(SPECTATE.viewersBase)
    expect(driftViewers(SPECTATE.viewersMin, constantRng(0))).toBeGreaterThanOrEqual(SPECTATE.viewersMin)
  })
})
