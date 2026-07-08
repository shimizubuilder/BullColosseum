import type { Container } from 'pixi.js'

export class Camera {
  x = 0
  y = 0
  zoom = 1

  centerOn(x: number, y: number): void {
    this.x = x
    this.y = y
  }

  applyTo(world: Container, screenWidth: number, screenHeight: number): void {
    const zoom = Math.max(1, Math.round(this.zoom))
    world.scale.set(zoom)
    world.position.set(
      Math.round(screenWidth / 2 - this.x * zoom),
      Math.round(screenHeight / 2 - this.y * zoom),
    )
  }
}
