import { describe, expect, it } from 'vitest'
import {
  buildingDoor,
  buildingScreenBox,
  pickBuildingAtScreen,
  promptAt,
} from '@/engine/world/worldInteractions'
import { MAIN_MAP } from '@/domain/maps/mainMap'

const stable = MAIN_MAP.buildings.find((building) => building.key === 'stable')

describe('buildingDoor', () => {
  it('sits just south of the building footprint', () => {
    expect(stable).toBeDefined()
    if (!stable) {
      return
    }
    const door = buildingDoor(stable)
    expect(door.x).toBe(stable.x)
    expect(door.y).toBe(stable.y + stable.depth * 0.5 + 10)
  })
})

describe('pickBuildingAtScreen', () => {
  it('selects a building when the click lands inside its projected cube', () => {
    if (!stable) {
      return
    }
    const box = buildingScreenBox(stable, 0, 0)
    const centerX = (box.minX + box.maxX) / 2
    const centerY = (box.minY + box.maxY) / 2
    expect(pickBuildingAtScreen(MAIN_MAP.buildings, centerX, centerY, 0, 0)?.key).toBe('stable')
  })

  it('returns null when the click is far from every building', () => {
    expect(pickBuildingAtScreen(MAIN_MAP.buildings, 99999, 99999, 0, 0)).toBeNull()
  })
})

describe('promptAt', () => {
  it('prompts to enter when the player stands on a door', () => {
    if (!stable) {
      return
    }
    const door = buildingDoor(stable)
    expect(promptAt(MAIN_MAP, door.x, door.y)).toEqual({ text: 'Enter STABLE', target: 'stable' })
  })

  it('stays silent on open ground', () => {
    expect(promptAt(MAIN_MAP, MAIN_MAP.spawn.x, MAIN_MAP.spawn.y)).toBeNull()
  })
})
