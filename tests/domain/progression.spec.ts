import { describe, expect, it } from 'vitest'
import { applyXp, tierOf, xpForNext } from '@/domain/progression'

describe('tierOf', () => {
  it('maps levels to tier thresholds', () => {
    expect(tierOf(1)).toBe(0)
    expect(tierOf(2)).toBe(0)
    expect(tierOf(3)).toBe(1)
    expect(tierOf(6)).toBe(2)
    expect(tierOf(10)).toBe(3)
    expect(tierOf(15)).toBe(4)
    expect(tierOf(99)).toBe(4)
  })
})

describe('xpForNext', () => {
  it('grows linearly with level', () => {
    expect(xpForNext(1)).toBe(7)
    expect(xpForNext(5)).toBe(19)
  })
})

describe('applyXp', () => {
  it('levels once when xp exactly meets the threshold', () => {
    expect(applyXp(1, 0, 7)).toEqual({ level: 2, xp: 0, levelsGained: 1, tierBefore: 0, tierAfter: 0 })
  })

  it('carries remainder across multiple level ups and crosses a tier', () => {
    expect(applyXp(1, 0, 20)).toEqual({ level: 3, xp: 3, levelsGained: 2, tierBefore: 0, tierAfter: 1 })
  })

  it('stays put when xp is below the threshold', () => {
    expect(applyXp(4, 2, 3)).toEqual({ level: 4, xp: 5, levelsGained: 0, tierBefore: 1, tierAfter: 1 })
  })
})
