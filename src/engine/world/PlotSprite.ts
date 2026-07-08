import { Container, Graphics, Text } from 'pixi.js'
import type { PlotDef } from '@/domain/maps/mapTypes'
import { ISO, worldToIso, type Point } from '@/engine/iso/isoMath'
import { createLabelPlate } from './labelPlate'

export function createPlotSprite(plot: PlotDef): Container {
  const container = new Container()
  const center = worldToIso(plot.x, plot.y)
  const relative = (worldX: number, worldY: number): Point => {
    const point = worldToIso(worldX, worldY)
    return { x: point.x - center.x, y: point.y - center.y }
  }
  const halfWidth = plot.width / 2
  const halfDepth = plot.depth / 2
  const c0 = relative(plot.x - halfWidth, plot.y - halfDepth)
  const c1 = relative(plot.x + halfWidth, plot.y - halfDepth)
  const c2 = relative(plot.x + halfWidth, plot.y + halfDepth)
  const c3 = relative(plot.x - halfWidth, plot.y + halfDepth)

  const graphics = new Graphics()
  graphics.ellipse(0, 4, plot.width * 0.5 * ISO, plot.width * 0.25 * ISO).fill({ color: 0x000000, alpha: 0.18 })
  graphics
    .poly([c0.x, c0.y, c1.x, c1.y, c2.x, c2.y, c3.x, c3.y])
    .fill(0x3f3a30)
    .stroke({ width: 2, color: 0x7a6238 })
  for (let i = 0; i <= 5; i += 1) {
    const top = relative(plot.x - halfWidth + (i * plot.width) / 5, plot.y - halfDepth)
    graphics.rect(top.x - 2, top.y - 14, 4, 14).fill(0x8a6a3a)
    const left = relative(plot.x - halfWidth, plot.y - halfDepth + (i * plot.depth) / 5)
    graphics.rect(left.x - 2, left.y - 14, 4, 14).fill(0x8a6a3a)
  }
  container.addChild(graphics)

  const cow = new Text({ text: '🐄', style: { fontSize: 26 } })
  cow.anchor.set(0.5)
  cow.position.set(0, -6)
  container.addChild(cow)

  const label = createLabelPlate('FOR SALE · 150 ◈')
  label.position.set(0, relative(plot.x, plot.y + halfDepth).y + 6)
  container.addChild(label)

  container.position.set(center.x, center.y)
  return container
}
