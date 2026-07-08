import { describe, expect, it } from 'vitest'
import { isoBounds, isoToWorld, worldToIso } from '@/engine/iso/isoMath'

describe('iso projection', () => {
  it('round-trips world coordinates through the iso projection', () => {
    const iso = worldToIso(1500, 1950)
    const back = isoToWorld(iso.x, iso.y)
    expect(back.x).toBeCloseTo(1500, 6)
    expect(back.y).toBeCloseTo(1950, 6)
  })

  it('places the map origin at iso (0,0)', () => {
    expect(worldToIso(0, 0)).toEqual({ x: 0, y: 0 })
  })

  it('spans the full diamond in its bounds', () => {
    const bounds = isoBounds(3000, 2200)
    expect(bounds.minX).toBeLessThan(0)
    expect(bounds.maxX).toBeGreaterThan(0)
    expect(bounds.maxY).toBeGreaterThan(bounds.minY)
  })
})
