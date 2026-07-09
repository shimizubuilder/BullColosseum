import { Container, Graphics, Sprite } from 'pixi.js'
import { ISO, worldToIso } from '@/engine/iso/isoMath'
import type { AssetRegistry } from '@/engine/assets/AssetRegistry'
import type { SpriteKey } from '@/engine/assets/assetManifest'
import type { GroundStyle, MapDefinition, PathDef, RingDef } from '@/domain/maps/mapTypes'

const TILE = 100

const PALETTE: Record<GroundStyle, [number, number]> = {
  grass: [0x4b8f47, 0x42883f],
  farm: [0x7a8f43, 0x6b823a],
}
const ROAD_COLOR = 0xb08a5a
const PLAZA_COLOR = 0xcdb489

type Surface = 'base' | 'base_alt' | 'road' | 'plaza'

function pointNearSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number, radius: number): boolean {
  const dx = bx - ax
  const dy = by - ay
  const length = dx * dx + dy * dy
  let t = length === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / length
  t = Math.max(0, Math.min(1, t))
  const nearestX = ax + t * dx
  const nearestY = ay + t * dy
  const offsetX = px - nearestX
  const offsetY = py - nearestY
  return offsetX * offsetX + offsetY * offsetY <= radius * radius
}

function onPath(x: number, y: number, paths: PathDef[]): boolean {
  for (const path of paths) {
    const radius = path.width / 2
    for (let index = 0; index < path.points.length - 1; index += 1) {
      const a = path.points[index]
      const b = path.points[index + 1]
      if (pointNearSegment(x, y, a.x, a.y, b.x, b.y, radius)) {
        return true
      }
    }
  }
  return false
}

function onRing(x: number, y: number, ring: RingDef): boolean {
  const normalizedX = (x - ring.cx) / ring.rx
  const normalizedY = (y - ring.cy) / ring.ry
  const radius = Math.hypot(normalizedX, normalizedY)
  const tolerance = ring.band / 2 / ((ring.rx + ring.ry) / 2)
  return Math.abs(radius - 1) <= tolerance
}

function variantHash(x: number, y: number): number {
  let hash = (Math.round(x) * 73856093) ^ (Math.round(y) * 19349663)
  hash = (hash ^ (hash >>> 13)) >>> 0
  return hash / 4294967296
}

function surfaceAt(centerX: number, centerY: number, map: MapDefinition): Surface {
  if (map.ring && onRing(centerX, centerY, map.ring)) {
    return 'plaza'
  }
  if (map.paths && onPath(centerX, centerY, map.paths)) {
    return 'road'
  }
  if (map.ground === 'grass' && variantHash(centerX, centerY) < 0.18) {
    return 'base_alt'
  }
  return 'base'
}

function keyFor(surface: Surface, ground: GroundStyle): SpriteKey {
  if (surface === 'road') return 'tile.road'
  if (surface === 'plaza') return 'tile.plaza'
  if (surface === 'base_alt') return 'tile.grass_alt'
  return ground === 'farm' ? 'tile.farm_soil' : 'tile.grass'
}

function colorFor(surface: Surface, ground: GroundStyle, isLight: boolean): number {
  if (surface === 'road') return ROAD_COLOR
  if (surface === 'plaza') return PLAZA_COLOR
  const [light, dark] = PALETTE[ground]
  return isLight ? light : dark
}

export function createGroundLayer(map: MapDefinition, assets?: AssetRegistry): Container {
  const container = new Container()
  container.sortableChildren = true
  const fallback = new Graphics()
  fallback.zIndex = -1
  container.addChild(fallback)

  const displayWidth = 2 * TILE * ISO * 1.02
  const displayHeight = TILE * ISO * 1.02

  for (let worldX = 0; worldX < map.width; worldX += TILE) {
    for (let worldY = 0; worldY < map.height; worldY += TILE) {
      const centerX = worldX + TILE / 2
      const centerY = worldY + TILE / 2
      const surface = surfaceAt(centerX, centerY, map)
      const loaded = assets?.sprite(keyFor(surface, map.ground)) ?? null
      const isoCenter = worldToIso(centerX, centerY)

      if (loaded) {
        const sprite = new Sprite(loaded.texture)
        sprite.anchor.set(0.5, 0.5)
        sprite.scale.set(displayWidth / loaded.texture.width, displayHeight / loaded.texture.height)
        sprite.position.set(isoCenter.x, isoCenter.y)
        sprite.zIndex = worldX + worldY
        container.addChild(sprite)
      } else {
        const p0 = worldToIso(worldX, worldY)
        const p1 = worldToIso(worldX + TILE, worldY)
        const p2 = worldToIso(worldX + TILE, worldY + TILE)
        const p3 = worldToIso(worldX, worldY + TILE)
        const isLight = ((worldX / TILE + worldY / TILE) & 1) === 1
        fallback
          .poly([p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y])
          .fill(colorFor(surface, map.ground, isLight))
          .stroke({ width: 1, color: 0x000000, alpha: 0.05 })
      }
    }
  }

  return container
}
