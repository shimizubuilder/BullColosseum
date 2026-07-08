import { Container, Graphics, Sprite } from 'pixi.js'
import type { PortalDef } from '@/domain/maps/mapTypes'
import type { AssetRegistry } from '@/engine/assets/AssetRegistry'
import type { SpriteKey } from '@/engine/assets/assetManifest'
import { worldToIso } from '@/engine/iso/isoMath'
import { createLabelPlate } from './labelPlate'

export function createPortalSprite(portal: PortalDef, assets?: AssetRegistry): Container {
  const container = new Container()
  const loaded = assets?.sprite(`portal.${portal.target}` as SpriteKey) ?? null

  if (loaded) {
    const sprite = new Sprite(loaded.texture)
    sprite.anchor.set(loaded.asset.anchorX, loaded.asset.anchorY)
    if (loaded.asset.screenWidth) {
      sprite.scale.set(loaded.asset.screenWidth / loaded.texture.width)
    }
    sprite.position.set(0, 10)
    container.addChild(sprite)
  } else {
    const graphics = new Graphics()
    graphics.circle(0, -20, 50).fill({ color: 0x3fc9ff, alpha: 0.22 })
    graphics.circle(0, -20, 30).fill({ color: 0xd6f4ff, alpha: 0.35 })
    graphics.ellipse(0, -20, 26, 40).stroke({ width: 4, color: 0xa35bff, alpha: 0.8 })
    container.addChild(graphics)
  }

  const label = createLabelPlate(portal.label)
  label.position.set(0, 18)
  container.addChild(label)

  const iso = worldToIso(portal.x, portal.y)
  container.position.set(iso.x, iso.y)
  container.zIndex = portal.x + portal.y
  return container
}
