import { Container, Graphics, Sprite } from 'pixi.js'
import type { PropDef } from '@/domain/maps/mapTypes'
import type { AssetRegistry } from '@/engine/assets/AssetRegistry'
import type { SpriteKey } from '@/engine/assets/assetManifest'
import { worldToIso } from '@/engine/iso/isoMath'

export function createPropSprite(prop: PropDef, assets?: AssetRegistry): Container {
  const iso = worldToIso(prop.x, prop.y)
  const loaded = assets?.sprite(`prop.${prop.kind}` as SpriteKey) ?? null

  if (loaded) {
    const container = new Container()
    const shadow = new Graphics()
    shadow.ellipse(0, 0, 16, 7).fill({ color: 0x000000, alpha: 0.2 })
    container.addChild(shadow)
    const sprite = new Sprite(loaded.texture)
    sprite.anchor.set(loaded.asset.anchorX, loaded.asset.anchorY)
    if (loaded.asset.screenWidth) {
      sprite.scale.set(loaded.asset.screenWidth / loaded.texture.width)
    }
    sprite.position.set(0, 4)
    container.addChild(sprite)
    container.position.set(iso.x, iso.y)
    return container
  }

  const graphics = new Graphics()
  graphics.ellipse(0, 0, 16, 7).fill({ color: 0x000000, alpha: 0.2 })

  if (prop.kind === 'tree') {
    graphics.rect(-4, -24, 8, 24).fill(0x5a3a1e)
    graphics.circle(0, -34, 20).fill(0x2f6d34)
    graphics.circle(-8, -40, 13).fill(0x3a824a)
    graphics.circle(9, -38, 12).fill(0x3a824a)
  } else if (prop.kind === 'rock') {
    graphics.circle(0, -8, 13).fill(0x8a8f96)
    graphics.circle(6, -4, 8).fill(0x6b7078)
  } else if (prop.kind === 'hay') {
    graphics.roundRect(-16, -22, 32, 22, 6).fill(0xd9b24a).stroke({ width: 2, color: 0xa9791b })
    graphics.moveTo(0, -22).lineTo(0, 0).stroke({ width: 2, color: 0xb8922f })
  } else {
    graphics.circle(-6, -8, 10).fill(0x2f6d34)
    graphics.circle(6, -8, 11).fill(0x2f6d34)
    graphics.circle(0, -14, 10).fill(0x3a824a)
  }

  graphics.position.set(iso.x, iso.y)
  return graphics
}
