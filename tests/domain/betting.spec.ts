import { describe, expect, it } from 'vitest'
import { betPayout, isBetWon, nextStakeIndex, stakeAt } from '@/domain/combat/betting'
import { BETTING } from '@/domain/config/balance'

describe('stake selection', () => {
  it('reads and cycles through the configured stakes', () => {
    expect(stakeAt(0)).toBe(BETTING.stakes[0])
    expect(stakeAt(BETTING.stakes.length)).toBe(BETTING.stakes[0])
    expect(nextStakeIndex(BETTING.stakes.length - 1)).toBe(0)
  })
})

describe('betPayout', () => {
  it('multiplies the stake by the payout factor and rounds', () => {
    expect(betPayout(50)).toBe(Math.round(50 * BETTING.payoutMultiplier))
    expect(betPayout(100)).toBe(190)
  })
})

describe('isBetWon', () => {
  it('wins only when the chosen side matches the match winner', () => {
    expect(isBetWon('a', 'a')).toBe(true)
    expect(isBetWon('a', 'b')).toBe(false)
    expect(isBetWon('b', 'b')).toBe(true)
  })
})
