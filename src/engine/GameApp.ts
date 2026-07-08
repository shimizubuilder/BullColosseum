import { Application, TextureSource } from 'pixi.js'

export interface GameAppOptions {
  backgroundColor?: number
  antialias?: boolean
}

export class GameApp {
  readonly pixi: Application

  private constructor(pixi: Application) {
    this.pixi = pixi
  }

  static async create(options: GameAppOptions = {}): Promise<GameApp> {
    TextureSource.defaultOptions.scaleMode = 'nearest'
    const pixi = new Application()
    await pixi.init({
      backgroundColor: options.backgroundColor ?? 0x0f1216,
      antialias: options.antialias ?? false,
      resizeTo: window,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    })
    return new GameApp(pixi)
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.pixi.canvas)
  }

  destroy(): void {
    this.pixi.destroy(true, { children: true, texture: true })
  }
}
