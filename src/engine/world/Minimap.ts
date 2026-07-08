import { Container, Graphics, Text } from 'pixi.js'
import type { MapDefinition } from '@/domain/maps/mapTypes'

export class Minimap {
  readonly container = new Container()
  private readonly marker = new Graphics()
  private readonly scale: number
  private readonly originX: number
  private readonly originY: number

  constructor(
    private readonly map: MapDefinition,
    readonly width = 170,
    readonly height = 120,
  ) {
    const padding = 6
    this.scale = Math.min((width - padding * 2) / map.width, (height - padding * 2) / map.height)
    this.originX = padding + (width - padding * 2 - map.width * this.scale) / 2
    this.originY = padding + (height - padding * 2 - map.height * this.scale) / 2

    const background = new Graphics()
      .roundRect(0, 0, width, height, 8)
      .fill({ color: 0x140e1e, alpha: 0.72 })
      .stroke({ width: 1, color: 0x2a2036 })
    this.container.addChild(background)

    const structures = new Graphics()
    for (const building of map.buildings) {
      const w = Math.max(2, building.width * this.scale)
      const h = Math.max(2, building.depth * this.scale)
      structures.rect(this.originX + building.x * this.scale - w / 2, this.originY + building.y * this.scale - h / 2, w, h).fill(0xc9a24a)
    }
    for (const portal of map.portals) {
      structures.circle(this.originX + portal.x * this.scale, this.originY + portal.y * this.scale, 3).fill(0x3fc9ff)
    }
    this.container.addChild(structures)
    this.container.addChild(this.marker)

    const label = new Text({ text: 'MAIN WORLD', style: { fontFamily: 'Segoe UI, sans-serif', fontSize: 9, fill: 0xe8e0f5 } })
    label.position.set(6, 3)
    this.container.addChild(label)
  }

  update(playerX: number, playerY: number): void {
    this.marker.clear()
    this.marker.circle(this.originX + playerX * this.scale, this.originY + playerY * this.scale, 3).fill(0xffffff)
  }
}
