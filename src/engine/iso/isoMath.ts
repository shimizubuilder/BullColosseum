export const TILE_WIDTH = 64
export const TILE_HEIGHT = 32
export const CELL_SIZE = 32

const PROJECTION_X = TILE_WIDTH / 2 / CELL_SIZE
const PROJECTION_Y = PROJECTION_X / 2

export interface Point {
  x: number
  y: number
}

export function worldToScreen(worldX: number, worldY: number): Point {
  return {
    x: (worldX - worldY) * PROJECTION_X,
    y: (worldX + worldY) * PROJECTION_Y,
  }
}

export function screenToWorld(screenX: number, screenY: number): Point {
  const projectedSum = screenY / PROJECTION_Y
  const projectedDifference = screenX / PROJECTION_X
  return {
    x: (projectedSum + projectedDifference) / 2,
    y: (projectedSum - projectedDifference) / 2,
  }
}

export function worldToTile(worldX: number, worldY: number): Point {
  return {
    x: Math.floor(worldX / CELL_SIZE),
    y: Math.floor(worldY / CELL_SIZE),
  }
}

export function tileToWorld(tileX: number, tileY: number): Point {
  return {
    x: tileX * CELL_SIZE + CELL_SIZE / 2,
    y: tileY * CELL_SIZE + CELL_SIZE / 2,
  }
}
