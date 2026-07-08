import { describe, expect, it } from 'vitest'
import { MAIN_MAP } from '@/domain/maps/mainMap'

describe('MAIN_MAP', () => {
  it('exposes the six world buildings', () => {
    const keys = MAIN_MAP.buildings.map((b) => b.key)
    expect(keys).toEqual(['colosseum', 'stable', 'shop', 'vault', 'leaderboard', 'quests'])
  })

  it('scatters the requested number of props deterministically', () => {
    expect(MAIN_MAP.props).toHaveLength(44)
    expect(MAIN_MAP.props[0]).toEqual(MAIN_MAP.props[0])
  })

  it('keeps every prop inside the map bounds', () => {
    for (const prop of MAIN_MAP.props) {
      expect(prop.x).toBeGreaterThanOrEqual(0)
      expect(prop.x).toBeLessThanOrEqual(MAIN_MAP.width)
      expect(prop.y).toBeGreaterThanOrEqual(0)
      expect(prop.y).toBeLessThanOrEqual(MAIN_MAP.height)
    }
  })

  it('keeps props clear of building footprints', () => {
    for (const prop of MAIN_MAP.props) {
      for (const building of MAIN_MAP.buildings) {
        const clear =
          Math.abs(prop.x - building.x) >= building.width / 2 + 70 ||
          Math.abs(prop.y - building.y) >= building.depth / 2 + 70
        expect(clear).toBe(true)
      }
    }
  })
})
