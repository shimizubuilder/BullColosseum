import { Graphics } from 'pixi.js'
import type { PropDef } from '@/domain/maps/mapTypes'
import { worldToIso } from '@/engine/iso/isoMath'

export function createPropSprite(prop: PropDef): Graphics {
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
  } else {
    graphics.circle(-6, -8, 10).fill(0x2f6d34)
    graphics.circle(6, -8, 11).fill(0x2f6d34)
    graphics.circle(0, -14, 10).fill(0x3a824a)
  }

  const iso = worldToIso(prop.x, prop.y)
  graphics.position.set(iso.x, iso.y)
  return graphics
}
