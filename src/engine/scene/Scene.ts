import { Container } from 'pixi.js'
import type { Application } from 'pixi.js'
import type { SceneId } from './SceneId'
import type { EngineBus } from '@/engine/core/EngineBus'
import type { Camera } from '@/engine/core/Camera'
import type { AssetRegistry } from '@/engine/assets/AssetRegistry'
import type { RemoteActorData } from '@/engine/world/WorldActor'
import type { PlotOwnership } from '@/engine/world/PlotSprite'

export interface PlayerIdentity {
  name: string
  avatar: string
}

export interface PlayerPosition {
  x: number
  y: number
  map: string
}

export interface SceneContext {
  app: Application
  bus: EngineBus
  camera: Camera
  assets: AssetRegistry
  playerIdentity: PlayerIdentity
  serverOffset: number
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
  setRemoteActors?(actors: RemoteActorData[]): void
  setFarms?(ownerships: PlotOwnership[]): void
  getPlayerPosition?(): PlayerPosition
  getAmbientCount?(): number
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
