import { Container, Graphics, Sprite } from 'pixi.js'
import type { ElementId } from '@/domain/config/elements'
import type { AssetRegistry } from '@/engine/assets/AssetRegistry'
import { shade } from '@/engine/world/color'

const TEXTURE_HEIGHT = 132

export class BullSprite {
  readonly container = new Container()
  private readonly shadow = new Graphics()
  private readonly body = new Graphics()
  private sprite: Sprite | null = null
  private color = '#ffffff'

  constructor(
    private readonly assets: AssetRegistry | undefined,
    element: ElementId,
    color: string,
    facing: number,
  ) {
    this.container.addChild(this.shadow)
    this.container.addChild(this.body)
    this.container.scale.x = facing >= 0 ? 1 : -1
    this.setElement(element, color)
  }

  setElement(element: ElementId, color: string): void {
    this.color = color
    const loaded = this.assets?.sprite(`bull.${element}`) ?? null
    if (loaded) {
      if (!this.sprite) {
        this.sprite = new Sprite()
        this.sprite.anchor.set(0.5, 1)
        this.container.addChild(this.sprite)
      }
      this.sprite.texture = loaded.texture
      this.sprite.scale.set(TEXTURE_HEIGHT / loaded.texture.height)
      this.sprite.visible = true
      this.body.visible = false
      this.shadow.clear()
      this.shadow.ellipse(0, 0, 52, 12).fill({ color: 0x000000, alpha: 0.25 })
    } else {
      if (this.sprite) {
        this.sprite.visible = false
      }
      this.body.visible = true
      this.draw(0)
    }
  }

  setFacing(facing: number): void {
    this.container.scale.x = facing >= 0 ? 1 : -1
  }

  update(legPhase: number): void {
    if (this.sprite && this.sprite.visible) {
      return
    }
    this.draw(legPhase)
  }

  private draw(legPhase: number): void {
    const fill = parseInt(this.color.replace('#', ''), 16)
    const dark = shade(this.color, -40)
    const swing = Math.sin(legPhase) * 6

    const g = this.body
    g.clear()
    this.shadow.clear()
    this.shadow.ellipse(0, 0, 46, 10).fill({ color: 0x000000, alpha: 0.25 })
    g.rect(-30, -26 + Math.max(0, swing), 8, 26).fill(dark)
    g.rect(-14, -26 + Math.max(0, -swing), 8, 26).fill(dark)
    g.rect(12, -26 + Math.max(0, swing), 8, 26).fill(dark)
    g.rect(26, -26 + Math.max(0, -swing), 8, 26).fill(dark)
    g.ellipse(-4, -44, 46, 28).fill(fill)
    g.circle(40, -52, 18).fill(dark)
    g.moveTo(50, -62).lineTo(66, -74).lineTo(54, -58).fill(0xf2e7cf)
    g.circle(46, -56, 3).fill(0xffffff)
  }
}
