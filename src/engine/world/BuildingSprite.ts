import { Container, Graphics, Sprite, Text } from 'pixi.js'
import type { BuildingDef } from '@/domain/maps/mapTypes'
import type { AssetRegistry } from '@/engine/assets/AssetRegistry'
import type { SpriteKey } from '@/engine/assets/assetManifest'
import { ISO, worldToIso, type Point } from '@/engine/iso/isoMath'
import { hexToNumber, shade } from './color'
import { createLabelPlate } from './labelPlate'

export function createBuildingSprite(building: BuildingDef, assets?: AssetRegistry): Container {
  const container = new Container()
  const loaded = assets?.sprite(`building.${building.key}` as SpriteKey) ?? null

  if (loaded) {
    const sprite = new Sprite(loaded.texture)
    sprite.anchor.set(loaded.asset.anchorX, loaded.asset.anchorY)
    const targetWidth = (building.width + building.depth) * ISO
    const scale = targetWidth / loaded.texture.width
    sprite.scale.set(scale)
    sprite.position.set(0, ((building.width / 2 + building.depth / 2) * ISO) / 2)
    container.addChild(sprite)
  } else {
    container.addChild(buildPlaceholderBox(building))
    const icon = new Text({ text: building.icon, style: { fontSize: Math.round(building.height * 0.5), fill: 0xffffff } })
    icon.anchor.set(0.5)
    icon.position.set(0, -building.height - 6)
    container.addChild(icon)
  }

  const label = createLabelPlate(building.label)
  label.position.set(0, 16)
  container.addChild(label)

  return container
}

function buildPlaceholderBox(building: BuildingDef): Graphics {
  const center = worldToIso(building.x, building.y)
  const relative = (worldX: number, worldY: number): Point => {
    const point = worldToIso(worldX, worldY)
    return { x: point.x - center.x, y: point.y - center.y }
  }

  const halfWidth = building.width / 2
  const halfDepth = building.depth / 2
  const height = building.height
  const c0 = relative(building.x - halfWidth, building.y - halfDepth)
  const c1 = relative(building.x + halfWidth, building.y - halfDepth)
  const c2 = relative(building.x + halfWidth, building.y + halfDepth)
  const c3 = relative(building.x - halfWidth, building.y + halfDepth)
  const t0 = { x: c0.x, y: c0.y - height }
  const t1 = { x: c1.x, y: c1.y - height }
  const t2 = { x: c2.x, y: c2.y - height }
  const t3 = { x: c3.x, y: c3.y - height }

  const graphics = new Graphics()
  graphics.ellipse(0, 4, building.width * 0.5 * ISO, building.width * 0.25 * ISO).fill({ color: 0x000000, alpha: 0.22 })
  graphics
    .poly([c3.x, c3.y, c2.x, c2.y, t2.x, t2.y, t3.x, t3.y])
    .fill(shade(building.color, -34))
    .stroke({ width: 1.5, color: 0x000000, alpha: 0.28 })
  graphics
    .poly([c1.x, c1.y, c2.x, c2.y, t2.x, t2.y, t1.x, t1.y])
    .fill(shade(building.color, -14))
    .stroke({ width: 1.5, color: 0x000000, alpha: 0.28 })
  graphics
    .poly([t0.x, t0.y, t1.x, t1.y, t2.x, t2.y, t3.x, t3.y])
    .fill(hexToNumber(building.roof))
    .stroke({ width: 1, color: 0x000000, alpha: 0.3 })
  return graphics
}
