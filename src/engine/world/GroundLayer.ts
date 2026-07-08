import { Graphics } from 'pixi.js'
import { worldToIso } from '@/engine/iso/isoMath'

const TILE = 100
const COLOR_LIGHT = 0x4b8f47
const COLOR_DARK = 0x42883f

export function createGroundLayer(width: number, height: number): Graphics {
  const ground = new Graphics()
  for (let worldX = 0; worldX < width; worldX += TILE) {
    for (let worldY = 0; worldY < height; worldY += TILE) {
      const p0 = worldToIso(worldX, worldY)
      const p1 = worldToIso(worldX + TILE, worldY)
      const p2 = worldToIso(worldX + TILE, worldY + TILE)
      const p3 = worldToIso(worldX, worldY + TILE)
      const light = ((worldX / TILE + worldY / TILE) & 1) === 1
      ground
        .poly([p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y])
        .fill(light ? COLOR_LIGHT : COLOR_DARK)
        .stroke({ width: 1, color: 0x000000, alpha: 0.05 })
    }
  }
  return ground
}
