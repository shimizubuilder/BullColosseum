import { describe, expect, it } from 'vitest'
import { statsOf, winWidth } from '@/domain/stats'

describe('statsOf', () => {
  it('applies base formula and element bonus for a level 1 fire bull', () => {
    expect(statsOf({ level: 1, element: 'fire' })).toEqual({
      power: 13,
      defense: 6,
      speed: 6,
      stamina: 7,
      tier: 0,
      mythic: false,
    })
  })

  it('routes each element bonus to its stat', () => {
    expect(statsOf({ level: 1, element: 'bolt' }).speed).toBe(12)
    expect(statsOf({ level: 1, element: 'shadow' }).defense).toBe(12)
  })

  it('adds gear and trait stats', () => {
    const base = statsOf({ level: 5, element: 'shadow' })
    const geared = statsOf({ level: 5, element: 'shadow', gear: ['chest_plate'], traits: ['ironhide'] })
    expect(geared.defense).toBe(base.defense + 5 + 7)
  })

  it('multiplies every stat before rounding for a mythic bull', () => {
    const normal = statsOf({ level: 8, element: 'fire' })
    const mythic = statsOf({ level: 8, element: 'fire', mythic: true })
    expect(normal.power).toBe(30)
    expect(mythic.power).toBe(40)
    expect(mythic.power).toBeGreaterThan(normal.power)
    expect(mythic.mythic).toBe(true)
  })

  it('never drops a stat below 1', () => {
    const stats = statsOf({ level: 1, element: 'fire', traits: ['rage'] })
    expect(stats.defense).toBeGreaterThanOrEqual(1)
  })
})

describe('winWidth', () => {
  it('scales with tier and speed inside its clamp', () => {
    expect(winWidth({ power: 1, defense: 1, speed: 6, stamina: 1, tier: 0, mythic: false })).toBe(8.5)
  })

  it('clamps to the configured maximum', () => {
    expect(winWidth({ power: 1, defense: 1, speed: 999, stamina: 1, tier: 4, mythic: false })).toBe(26)
  })
})
