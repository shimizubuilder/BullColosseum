import type { BuildingDef, MapDefinition } from '@/domain/maps/mapTypes'
import { worldToIso, type Point } from '@/engine/iso/isoMath'

export interface ScreenBox {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface WorldPromptInfo {
  text: string
  target: string
}

export function buildingDoor(building: BuildingDef): Point {
  return { x: building.x, y: building.y + building.depth * 0.5 + 10 }
}

export function buildingScreenBox(building: BuildingDef, cameraX: number, cameraY: number): ScreenBox {
  const halfWidth = building.width / 2
  const halfDepth = building.depth / 2
  const corners = [
    [building.x - halfWidth, building.y - halfDepth],
    [building.x + halfWidth, building.y - halfDepth],
    [building.x + halfWidth, building.y + halfDepth],
    [building.x - halfWidth, building.y + halfDepth],
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
    minY = Math.min(minY, baseY - building.height)
    maxY = Math.max(maxY, baseY)
  }
  return { minX, maxX, minY, maxY }
}

export function pickBuildingAtScreen(
  buildings: BuildingDef[],
  screenX: number,
  screenY: number,
  cameraX: number,
  cameraY: number,
): BuildingDef | null {
  for (const building of buildings) {
    const box = buildingScreenBox(building, cameraX, cameraY)
    if (screenX >= box.minX && screenX <= box.maxX && screenY >= box.minY && screenY <= box.maxY) {
      return building
    }
  }
  return null
}

export function promptAt(map: MapDefinition, playerX: number, playerY: number): WorldPromptInfo | null {
  for (const building of map.buildings) {
    const door = buildingDoor(building)
    if (Math.hypot(playerX - door.x, playerY - door.y) < 70) {
      return { text: `Enter ${building.label}`, target: building.key }
    }
  }
  for (const portal of map.portals) {
    if (Math.hypot(playerX - portal.x, playerY - portal.y) < 86) {
      return { text: `Enter Portal → ${portal.label}`, target: `portal:${portal.target}` }
    }
  }
  return null
}
