import { describe, expect, it } from 'vitest'
import {
  buildingToStructure,
  pickStructureAtScreen,
  promptStructureAt,
  structureDoor,
  structureScreenBox,
  structuresForMap,
} from '@/engine/world/worldInteractions'
import { MAIN_MAP } from '@/domain/maps/mainMap'

const stable = MAIN_MAP.buildings.find((building) => building.key === 'stable')
const structures = structuresForMap(MAIN_MAP)

describe('buildingToStructure', () => {
  it('places the door just south of the building footprint', () => {
    expect(stable).toBeDefined()
    if (!stable) {
      return
    }
    const door = structureDoor(buildingToStructure(stable))
    expect(door.x).toBe(stable.x)
    expect(door.y).toBe(stable.y + stable.depth / 2 + 10)
  })
})

describe('pickStructureAtScreen', () => {
  it('selects a building when the click lands inside its projected cube', () => {
    if (!stable) {
      return
    }
    const box = structureScreenBox(buildingToStructure(stable), 0, 0)
    const centerX = (box.minX + box.maxX) / 2
    const centerY = (box.minY + box.maxY) / 2
    expect(pickStructureAtScreen(structures, centerX, centerY, 0, 0, 0, 0)?.target).toBe('stable')
  })

  it('returns null when the click is far from every structure', () => {
    expect(pickStructureAtScreen(structures, 99999, 99999, 99999, 99999, 0, 0)).toBeNull()
  })
})

describe('promptStructureAt', () => {
  it('prompts to enter when the player stands on a door', () => {
    if (!stable) {
      return
    }
    const door = structureDoor(buildingToStructure(stable))
    expect(promptStructureAt(structures, door.x, door.y)?.target).toBe('stable')
  })

  it('stays silent on open ground', () => {
    expect(promptStructureAt(structures, MAIN_MAP.spawn.x, MAIN_MAP.spawn.y)).toBeNull()
  })
})
