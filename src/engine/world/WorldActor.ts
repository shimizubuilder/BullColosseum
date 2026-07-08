import { AvatarSprite } from './AvatarSprite'
import { worldToIso } from '@/engine/iso/isoMath'

export interface RemoteActorData {
  username: string
  avatar: string
  x: number
  y: number
}

export class WorldActor {
  readonly sprite: AvatarSprite
  x: number
  y: number
  private targetX: number
  private targetY: number
  private facing = 1
  private phase = 0
  waitTimer = 0

  constructor(avatar: string, name: string, x: number, y: number, nameColor?: number) {
    this.sprite = new AvatarSprite(avatar, name, nameColor)
    this.x = x
    this.y = y
    this.targetX = x
    this.targetY = y
  }

  get container(): AvatarSprite['container'] {
    return this.sprite.container
  }

  setTarget(x: number, y: number): void {
    this.targetX = x
    this.targetY = y
  }

  reachedTarget(threshold = 6): boolean {
    return Math.hypot(this.targetX - this.x, this.targetY - this.y) < threshold
  }

  moveToward(fixedDt: number, speed: number): void {
    const dx = this.targetX - this.x
    const dy = this.targetY - this.y
    const distance = Math.hypot(dx, dy)
    if (distance > 1) {
      const step = Math.min(distance, speed * fixedDt)
      this.x += (dx / distance) * step
      this.y += (dy / distance) * step
      const screenDx = dx - dy
      if (Math.abs(screenDx) > 1) {
        this.facing = screenDx > 0 ? 1 : -1
      }
      this.phase += fixedDt * 10
    } else {
      this.phase = 0
    }
  }

  idle(): void {
    this.phase = 0
  }

  setIdentity(avatar: string, name: string): void {
    this.sprite.setIdentity(avatar, name)
  }

  syncSprite(): void {
    const iso = worldToIso(this.x, this.y)
    this.container.position.set(iso.x, iso.y)
    this.container.zIndex = this.x + this.y
    this.sprite.setFacing(this.facing)
    this.sprite.update(this.phase)
  }

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
