import { describe, expect, it } from 'vitest'
import {
  betPayout,
  extendCost,
  farmEarnRate,
  farmRatePerHour,
  kingBounty,
  pendingEarnings,
  trainingCost,
  trainingXp,
  vaultConversion,
} from '@/domain/economy'

describe('training', () => {
  it('scales cost and xp with level', () => {
    expect(trainingCost(1)).toBe(28)
    expect(trainingXp(1)).toBe(7)
    expect(trainingCost(10)).toBe(100)
  })
})

describe('vaultConversion', () => {
  it('refuses conversions below the minimum gold', () => {
    expect(vaultConversion(100, 0.5)).toEqual({ spentGold: 0, mintedTokens: 0 })
  })

  it('burns five percent when converting', () => {
    expect(vaultConversion(1000, 0.5)).toEqual({ spentGold: 500, mintedTokens: 4 })
    expect(vaultConversion(212, 1)).toEqual({ spentGold: 212, mintedTokens: 2 })
  })
})

describe('farm earnings', () => {
  it('rates a resting bull by tier, mythic, and traits', () => {
    expect(farmEarnRate({ level: 1, traits: [], mythic: false })).toBe(5)
    expect(farmEarnRate({ level: 15, traits: ['alpha', 'rage'], mythic: true })).toBe(36)
  })

  it('sums the pen rate and caps pending earnings at eight hours', () => {
    const rate = farmRatePerHour([
      { level: 1, traits: [], mythic: false },
      { level: 1, traits: [], mythic: false },
    ])
    expect(rate).toBe(10)
    expect(pendingEarnings(36, 3600)).toBe(36)
    expect(pendingEarnings(36, 1_000_000)).toBe(288)
  })
})

describe('misc economy', () => {
  it('pays bets and extends pens', () => {
    expect(betPayout(100)).toBe(190)
    expect(betPayout(50)).toBe(95)
    expect(extendCost(2)).toBe(200)
  })

  it('accrues king bounty up to the cap', () => {
    expect(kingBounty(3600)).toBe(300)
    expect(kingBounty(1_000_000)).toBe(1000)
    expect(kingBounty(-50)).toBe(0)
  })
})
