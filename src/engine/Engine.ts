import type { Ticker } from 'pixi.js'
import { GameApp, type GameAppOptions } from './GameApp'
import { Clock } from './core/Clock'
import { Camera } from './core/Camera'
import { EngineBus } from './core/EngineBus'
import { AssetRegistry } from './assets/AssetRegistry'
import { SceneManager } from './scene/SceneManager'
import type { PlayerIdentity, SceneContext } from './scene/Scene'
import type { SceneId } from './scene/SceneId'

export class Engine {
  readonly bus = new EngineBus()
  private readonly clock = new Clock()
  private readonly camera = new Camera()
  private readonly assets = new AssetRegistry()
  private readonly identity: PlayerIdentity = { name: 'Player', avatar: 'ansem' }
  private readonly manager: SceneManager
  private tickerHandler: ((ticker: Ticker) => void) | null = null

  private constructor(private readonly gameApp: GameApp) {
    const context: SceneContext = {
      app: gameApp.pixi,
      bus: this.bus,
      camera: this.camera,
      assets: this.assets,
      playerIdentity: this.identity,
    }
    this.manager = new SceneManager(gameApp.pixi.stage, context, this.bus)
    gameApp.pixi.renderer.on('resize', this.handleResize)
  }

  static async create(options?: GameAppOptions): Promise<Engine> {
    const gameApp = await GameApp.create(options)
    return new Engine(gameApp)
  }

  mount(container: HTMLElement): void {
    this.gameApp.mount(container)
  }

  start(initial: SceneId): void {
    this.manager.setImmediate(initial)
    const handler = (ticker: Ticker): void => {
      const deltaMs = ticker.deltaMS
      this.manager.advance(deltaMs)
      this.clock.advance(deltaMs / 1000, {
        fixedUpdate: (fixedDt) => this.manager.fixedUpdate(fixedDt),
        render: (alpha) => this.manager.render(alpha),
      })
    }
    this.tickerHandler = handler
    this.gameApp.pixi.ticker.add(handler)
  }

  changeScene(id: SceneId): void {
    void this.manager.changeTo(id)
  }

  setInputEnabled(enabled: boolean): void {
    this.manager.setInputEnabled(enabled)
  }

  setPlayerIdentity(identity: PlayerIdentity): void {
    this.identity.name = identity.name
    this.identity.avatar = identity.avatar
    this.manager.setPlayerIdentity(this.identity)
  }

  get currentSceneId(): SceneId | null {
    return this.manager.currentId
  }

  destroy(): void {
    if (this.tickerHandler) {
      this.gameApp.pixi.ticker.remove(this.tickerHandler)
      this.tickerHandler = null
    }
    this.gameApp.pixi.renderer.off('resize', this.handleResize)
    this.manager.destroy()
    this.gameApp.destroy()
  }

  private handleResize = (): void => {
    const { width, height } = this.gameApp.pixi.screen
    this.manager.resize(width, height)
  }
}
