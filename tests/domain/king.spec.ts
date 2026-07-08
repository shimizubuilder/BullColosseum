import { describe, expect, it } from 'vitest'
import { kingBounty, kingChallengerSkill, kingChallengerStats, kingHoldSeconds } from '@/domain/combat/king'

describe('kingHoldSeconds', () => {
  it('never returns a negative hold', () => {
    expect(kingHoldSeconds(100, 50)).toBe(0)
    expect(kingHoldSeconds(0, 600)).toBe(600)
  })
})

describe('kingBounty', () => {
  it('accrues five gold per whole minute held', () => {
    expect(kingBounty(0, 599)).toBe(45)
    expect(kingBounty(0, 600)).toBe(50)
  })

  it('caps the bounty at a thousand gold', () => {
    expect(kingBounty(0, 10_000_000)).toBe(1000)
  })
})

describe('kingChallengerSkill', () => {
  it('scales with tier inside the configured band', () => {
    expect(kingChallengerSkill(0)).toBeCloseTo(0.6)
    expect(kingChallengerSkill(4)).toBeCloseTo(0.84)
    expect(kingChallengerSkill(100)).toBeLessThanOrEqual(0.95)
  })
})

describe('kingChallengerStats', () => {
  it('derives a statline and falls back to a tier level when the bull level is unknown', () => {
    const stats = kingChallengerStats({ element: 'shadow', level: 0, traits: ['alpha'], mythic: false }, 3)
    expect(stats.power).toBeGreaterThan(0)
    expect(stats.tier).toBeGreaterThanOrEqual(0)
  })
})
