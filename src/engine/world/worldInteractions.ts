import type { BuildingDef, MapDefinition, PlotDef, PortalDef } from '@/domain/maps/mapTypes'
import { worldToIso, type Point } from '@/engine/iso/isoMath'
import type { Footprint } from '@/engine/world/pathfinding'

export interface ScreenBox {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface WorldStructure {
  target: string
  label: string
  x: number
  y: number
  halfWidth: number
  halfDepth: number
  height: number
  solid: boolean
  doorX: number
  doorY: number
  clickRadius: number
  promptRadius: number
  enterRadius: number
}

export function buildingToStructure(building: BuildingDef): WorldStructure {
  return {
    target: building.key,
    label: `Enter ${building.label}`,
    x: building.x,
    y: building.y,
    halfWidth: building.width / 2,
    halfDepth: building.depth / 2,
    height: building.height,
    solid: true,
    doorX: building.x,
    doorY: building.y + building.depth / 2 + 10,
    clickRadius: 0,
    promptRadius: 70,
    enterRadius: 78,
  }
}

export function plotToStructure(plot: PlotDef, label: string): WorldStructure {
  return {
    target: `plot:${plot.index}`,
    label,
    x: plot.x,
    y: plot.y,
    halfWidth: plot.width / 2,
    halfDepth: plot.depth / 2,
    height: 0,
    solid: true,
    doorX: plot.x,
    doorY: plot.y + plot.depth / 2 + 10,
    clickRadius: 0,
    promptRadius: 70,
    enterRadius: 78,
  }
}

export function portalToStructure(portal: PortalDef): WorldStructure {
  return {
    target: `portal:${portal.target}`,
    label: `Enter Portal → ${portal.label}`,
    x: portal.x,
    y: portal.y,
    halfWidth: 0,
    halfDepth: 0,
    height: 0,
    solid: false,
    doorX: portal.x,
    doorY: portal.y,
    clickRadius: 60,
    promptRadius: 86,
    enterRadius: 54,
  }
}

export function structuresForMap(map: MapDefinition): WorldStructure[] {
  return [
    ...map.buildings.map(buildingToStructure),
    ...map.plots.map((plot) => plotToStructure(plot, `Pen plot #${plot.index + 1}`)),
    ...map.portals.map(portalToStructure),
  ]
}

export function solidFootprints(structures: WorldStructure[]): Footprint[] {
  return structures
    .filter((structure) => structure.solid && structure.halfWidth > 0)
    .map((structure) => ({
      x: structure.x,
      y: structure.y,
      halfWidth: structure.halfWidth,
      halfDepth: structure.halfDepth,
    }))
}

export function structureScreenBox(structure: WorldStructure, cameraX: number, cameraY: number): ScreenBox {
  const corners = [
    [structure.x - structure.halfWidth, structure.y - structure.halfDepth],
    [structure.x + structure.halfWidth, structure.y - structure.halfDepth],
    [structure.x + structure.halfWidth, structure.y + structure.halfDepth],
    [structure.x - structure.halfWidth, structure.y + structure.halfDepth],
  ]
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const [worldX, worldY] of corners) {
    const iso = worldToIso(worldX, worldY)
    const baseX = iso.x - cameraX
    const baseY = iso.y - cameraY
    minX = Math.min(minX, baseX)
    maxX = Math.max(maxX, baseX)
    minY = Math.min(minY, baseY - structure.height)
    maxY = Math.max(maxY, baseY)
  }
  return { minX, maxX, minY, maxY }
}

export function pickStructureAtScreen(
  structures: WorldStructure[],
  screenX: number,
  screenY: number,
  worldX: number,
  worldY: number,
  cameraX: number,
  cameraY: number,
): WorldStructure | null {
  for (const structure of structures) {
    if (structure.halfWidth > 0) {
      const box = structureScreenBox(structure, cameraX, cameraY)
      if (screenX >= box.minX && screenX <= box.maxX && screenY >= box.minY && screenY <= box.maxY) {
        return structure
      }
    } else if (Math.hypot(worldX - structure.x, worldY - structure.y) < structure.clickRadius) {
      return structure
    }
  }
  return null
}

export function promptStructureAt(structures: WorldStructure[], playerX: number, playerY: number): WorldStructure | null {
  for (const structure of structures) {
    if (Math.hypot(playerX - structure.doorX, playerY - structure.doorY) < structure.promptRadius) {
      return structure
    }
  }
  return null
}

export function structureDoor(structure: WorldStructure): Point {
  return { x: structure.doorX, y: structure.doorY }
}
