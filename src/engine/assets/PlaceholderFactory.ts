import { Graphics } from 'pixi.js'

export class PlaceholderFactory {
  filledRect(width: number, height: number, color: number): Graphics {
    return new Graphics().rect(0, 0, width, height).fill(color)
  }
}
