import { Container, Graphics } from 'pixi.js'
import { shade } from '@/engine/world/color'

export class BullSprite {
  readonly container = new Container()
  private readonly body = new Graphics()

  constructor(
    private color: string,
    facing: number,
  ) {
    this.container.addChild(this.body)
    this.container.scale.x = facing >= 0 ? 1 : -1
    this.draw(0)
  }

  setFacing(facing: number): void {
    this.container.scale.x = facing >= 0 ? 1 : -1
  }

  setColor(color: string): void {
    this.color = color
    this.draw(0)
  }

  update(legPhase: number): void {
    this.draw(legPhase)
  }

  private draw(legPhase: number): void {
    const fill = parseInt(this.color.replace('#', ''), 16)
    const dark = shade(this.color, -40)
    const swing = Math.sin(legPhase) * 6

    const g = this.body
    g.clear()
    g.ellipse(0, 0, 46, 10).fill({ color: 0x000000, alpha: 0.25 })
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
