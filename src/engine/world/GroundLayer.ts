import { Graphics } from 'pixi.js'
import { worldToIso } from '@/engine/iso/isoMath'
import type { GroundStyle } from '@/domain/maps/mapTypes'

const TILE = 100
const PALETTE: Record<GroundStyle, [number, number]> = {
  grass: [0x4b8f47, 0x42883f],
  farm: [0x7a8f43, 0x6b823a],
}

export function createGroundLayer(width: number, height: number, style: GroundStyle = 'grass'): Graphics {
  const [light, dark] = PALETTE[style]
  const ground = new Graphics()
  for (let worldX = 0; worldX < width; worldX += TILE) {
    for (let worldY = 0; worldY < height; worldY += TILE) {
      const p0 = worldToIso(worldX, worldY)
      const p1 = worldToIso(worldX + TILE, worldY)
      const p2 = worldToIso(worldX + TILE, worldY + TILE)
      const p3 = worldToIso(worldX, worldY + TILE)
      const isLight = ((worldX / TILE + worldY / TILE) & 1) === 1
      ground
        .poly([p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y])
        .fill(isLight ? light : dark)
        .stroke({ width: 1, color: 0x000000, alpha: 0.05 })
    }
  }
  return ground
}
