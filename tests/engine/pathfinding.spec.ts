import { describe, expect, it } from 'vitest'
import { buildBlockedGrid, computePath, lineClear } from '@/engine/world/pathfinding'
import { solidFootprints, structuresForMap } from '@/engine/world/worldInteractions'
import { MAIN_MAP } from '@/domain/maps/mainMap'

const footprints = solidFootprints(structuresForMap(MAIN_MAP))
const grid = buildBlockedGrid(footprints, MAIN_MAP.width, MAIN_MAP.height)

describe('buildBlockedGrid', () => {
  it('marks building footprints as blocked', () => {
    const stable = MAIN_MAP.buildings.find((b) => b.key === 'stable')
    expect(stable).toBeDefined()
    if (!stable) {
      return
    }
    const gx = Math.floor(stable.x / grid.cell)
    const gy = Math.floor(stable.y / grid.cell)
    expect(grid.blocked[gy * grid.cols + gx]).toBe(1)
  })

  it('leaves open ground walkable', () => {
    const gx = Math.floor(MAIN_MAP.spawn.x / grid.cell)
    const gy = Math.floor(MAIN_MAP.spawn.y / grid.cell)
    expect(grid.blocked[gy * grid.cols + gx]).toBe(0)
  })
})

describe('lineClear', () => {
  it('reports a clear straight line across open ground', () => {
    expect(lineClear(grid, 1500, 1950, 1500, 1700)).toBe(true)
  })

  it('reports a blocked straight line through a building', () => {
    const stable = MAIN_MAP.buildings.find((b) => b.key === 'stable')!
    expect(lineClear(grid, stable.x - 300, stable.y, stable.x + 300, stable.y)).toBe(false)
  })
})

describe('computePath', () => {
  it('returns a direct target when the line is clear', () => {
    expect(computePath(grid, 1500, 1950, 1500, 1750)).toEqual([{ x: 1500, y: 1750 }])
  })

  it('routes around a building and ends at the requested target', () => {
    const stable = MAIN_MAP.buildings.find((b) => b.key === 'stable')!
    const path = computePath(grid, stable.x - 320, stable.y, stable.x + 320, stable.y)
    expect(path.length).toBeGreaterThan(1)
    expect(path[path.length - 1]).toEqual({ x: stable.x + 320, y: stable.y })
  })
})
