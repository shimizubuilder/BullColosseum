import { Container, Graphics, Text } from 'pixi.js'

export function createLabelPlate(text: string): Container {
  const container = new Container()
  const label = new Text({
    text,
    style: { fontFamily: 'Segoe UI, sans-serif', fontSize: 13, fontWeight: '800', fill: 0xffcf4a },
  })
  label.anchor.set(0.5)
  const width = label.width + 16
  const plate = new Graphics().roundRect(-width / 2, -11, width, 22, 7).fill({ color: 0x0c0914, alpha: 0.82 })
  container.addChild(plate)
  container.addChild(label)
  return container
}
