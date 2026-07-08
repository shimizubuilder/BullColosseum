import { Container, Graphics, Text } from 'pixi.js'
import { AVATARS, type AvatarId } from '@/domain/config/avatars'
import { hexToNumber, shade } from './color'

export class AvatarSprite {
  readonly container = new Container()
  private readonly figure = new Container()
  private readonly body = new Graphics()
  private readonly nameplate: Text
  private avatarId: string
  private facing = 1

  constructor(avatarId: string, name: string, nameColor = 0xffffff) {
    this.avatarId = avatarId
    this.figure.addChild(this.body)
    this.container.addChild(this.figure)
    this.nameplate = new Text({
      text: name,
      style: { fontFamily: 'Segoe UI, sans-serif', fontSize: 12, fontWeight: '800', fill: nameColor, stroke: { color: 0x000000, width: 3 } },
    })
    this.nameplate.anchor.set(0.5, 1)
    this.nameplate.position.set(0, -52)
    this.container.addChild(this.nameplate)
    this.redraw(0)
  }

  setIdentity(avatarId: string, name: string): void {
    this.avatarId = avatarId
    this.nameplate.text = name
    this.redraw(0)
  }

  setFacing(facing: number): void {
    this.facing = facing >= 0 ? 1 : -1
    this.figure.scale.x = this.facing
  }

  update(phase: number): void {
    this.redraw(phase)
  }

  private redraw(phase: number): void {
    const avatar = AVATARS[this.avatarId as AvatarId] ?? AVATARS.ansem
    const outfit = hexToNumber(avatar.outfit)
    const skin = hexToNumber(avatar.skin)
    const cap = hexToNumber(avatar.cap)
    const pants = shade(avatar.outfit, -40)
    const swing = Math.sin(phase) * 4

    const graphics = this.body
    graphics.clear()
    graphics.ellipse(0, 0, 15, 6).fill({ color: 0x000000, alpha: 0.28 })
    graphics.rect(-6, -13 + Math.max(0, swing), 5, 13).fill(pants)
    graphics.rect(1, -13 + Math.max(0, -swing), 5, 13).fill(pants)
    graphics.roundRect(-11, -34, 22, 24, 6).fill(outfit)
    graphics.circle(0, -40, 8).fill(skin)
    graphics.roundRect(-9, -47, 18, 8, 3).fill(cap)
  }
}
