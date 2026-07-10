import { Container, Graphics, Text } from 'pixi.js'
import { DISPLAY_FONT, GOLD_FILL, PLATE_FILL } from '@/engine/ui/textStyles'

export function createLabelPlate(text: string): Container {
  const container = new Container()
  const label = new Text({
    text,
    style: { fontFamily: DISPLAY_FONT, fontSize: 12, fontWeight: '700', fill: GOLD_FILL },
  })
  label.anchor.set(0.5)
  const width = label.width + 18
  const plate = new Graphics().roundRect(-width / 2, -11, width, 22, 7).fill({ color: PLATE_FILL, alpha: 0.82 })
  container.addChild(plate)
  container.addChild(label)
  return container
}
