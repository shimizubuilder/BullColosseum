import { Container, Graphics } from 'pixi.js'
import type { PlotDef } from '@/domain/maps/mapTypes'
import { ISO, worldToIso, type Point } from '@/engine/iso/isoMath'
import { createLabelPlate } from './labelPlate'

export interface PlotOwnership {
  index: number
  mine: boolean
  label: string
  bulls: number
}

export function createPlotSprite(plot: PlotDef, ownership: PlotOwnership | null): Container {
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

  const owned = ownership !== null
  const mine = ownership?.mine ?? false
  const fillColor = mine ? 0x5a4a2a : owned ? 0x4a3f2f : 0x3f3a30
  const strokeColor = mine ? 0xffcf4a : 0x7a6238

  const graphics = new Graphics()
  graphics.ellipse(0, 4, plot.width * 0.5 * ISO, plot.width * 0.25 * ISO).fill({ color: 0x000000, alpha: 0.18 })
  graphics
    .poly([c0.x, c0.y, c1.x, c1.y, c2.x, c2.y, c3.x, c3.y])
    .fill(fillColor)
    .stroke({ width: mine ? 3 : 2, color: strokeColor })
  for (let i = 0; i <= 5; i += 1) {
    const top = relative(plot.x - halfWidth + (i * plot.width) / 5, plot.y - halfDepth)
    graphics.rect(top.x - 2, top.y - 14, 4, 14).fill(0x8a6a3a)
    const left = relative(plot.x - halfWidth, plot.y - halfDepth + (i * plot.depth) / 5)
    graphics.rect(left.x - 2, left.y - 14, 4, 14).fill(0x8a6a3a)
  }
  if (owned) {
    const barn = relative(plot.x - plot.width * 0.22, plot.y - plot.depth * 0.18)
    graphics.roundRect(barn.x - 22, barn.y - 34, 44, 34, 5).fill(0x8a3f2f)
    graphics.rect(barn.x - 22, barn.y - 34, 44, 10).fill(0xc75a3f)
  }
  container.addChild(graphics)

  const labelText = owned ? (ownership?.label ?? '') : 'FOR SALE · 150 GOLD'
  const label = createLabelPlate(labelText)
  label.position.set(0, relative(plot.x, plot.y + halfDepth).y + 6)
  container.addChild(label)

  container.position.set(center.x, center.y)
  return container
}
