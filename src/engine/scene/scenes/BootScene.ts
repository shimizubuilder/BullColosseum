import type { Graphics } from 'pixi.js'
import { BaseScene, type SceneContext } from '@/engine/scene/Scene'

const BACKGROUND_COLOR = 0x0f1216

export class BootScene extends BaseScene {
  readonly id = 'boot' as const
  private readonly background: Graphics

  constructor(context: SceneContext) {
    super(context)
    this.background = context.assets.placeholder.filledRect(1, 1, BACKGROUND_COLOR)
    this.root.addChild(this.background)
    this.layout()
  }

  private layout(): void {
    const { width, height } = this.context.app.screen
    this.background.width = width
    this.background.height = height
  }

  resize(): void {
    this.layout()
  }
}
