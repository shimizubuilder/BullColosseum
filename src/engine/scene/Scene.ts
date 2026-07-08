import { Container } from 'pixi.js'
import type { Application } from 'pixi.js'
import type { SceneId } from './SceneId'
import type { EngineBus } from '@/engine/core/EngineBus'
import type { Camera } from '@/engine/core/Camera'
import type { AssetRegistry } from '@/engine/assets/AssetRegistry'

export interface PlayerIdentity {
  name: string
  avatar: string
}

export interface SceneContext {
  app: Application
  bus: EngineBus
  camera: Camera
  assets: AssetRegistry
  playerIdentity: PlayerIdentity
}

export interface Scene {
  readonly id: SceneId
  readonly root: Container
  preload?(): Promise<void>
  enter?(): void
  exit?(): void
  fixedUpdate?(fixedDt: number): void
  render?(alpha: number): void
  resize?(width: number, height: number): void
  setInputEnabled?(enabled: boolean): void
  setPlayerIdentity?(identity: PlayerIdentity): void
  destroy(): void
}

export abstract class BaseScene implements Scene {
  readonly root = new Container()
  abstract readonly id: SceneId

  protected constructor(protected readonly context: SceneContext) {}

  destroy(): void {
    this.root.destroy({ children: true })
  }
}
