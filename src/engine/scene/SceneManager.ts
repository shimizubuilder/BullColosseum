import type { Container } from 'pixi.js'
import type { SceneId } from './SceneId'
import type { Scene, SceneContext } from './Scene'
import type { EngineBus } from '@/engine/core/EngineBus'
import { canTransition } from './transitionTable'
import { createScene, isSceneRegistered } from './sceneRegistry'
import type { PlayerIdentity, PlayerPosition } from './Scene'
import type { RemoteActorData } from '@/engine/world/WorldActor'
import type { PlotOwnership } from '@/engine/world/PlotSprite'
import type { DuelSetup } from '@/engine/duel/DuelDirector'

const COVER_MS = 300
const REVEAL_MS = 260

interface PendingTransition {
  to: SceneId
  next: Scene
  elapsed: number
  swapped: boolean
}

export class SceneManager {
  private active: Scene | null = null
  private activeId: SceneId | null = null
  private pending: PendingTransition | null = null

  constructor(
    private readonly stage: Container,
    private readonly context: SceneContext,
    private readonly bus: EngineBus,
  ) {}

  get currentId(): SceneId | null {
    return this.activeId
  }

  get isTransitioning(): boolean {
    return this.pending !== null
  }

  setImmediate(id: SceneId): void {
    const scene = createScene(id, this.context)
    this.replaceActive(scene, id)
  }

  async changeTo(id: SceneId): Promise<void> {
    if (this.pending || this.activeId === id) {
      return
    }
    if (!canTransition(this.activeId, id) || !isSceneRegistered(id)) {
      console.warn(`[SceneManager] blocked transition ${this.activeId ?? 'null'} -> ${id}`)
      return
    }
    const next = createScene(id, this.context)
    await next.preload?.()
    this.pending = { to: id, next, elapsed: 0, swapped: false }
    this.bus.emit('transition:start', { from: this.activeId, to: id })
  }

  advance(deltaMs: number): void {
    const pending = this.pending
    if (!pending) {
      return
    }
    pending.elapsed += deltaMs
    if (!pending.swapped && pending.elapsed >= COVER_MS) {
      this.replaceActive(pending.next, pending.to)
      pending.swapped = true
    }
    if (pending.elapsed >= COVER_MS + REVEAL_MS) {
      const to = pending.to
      this.pending = null
      this.bus.emit('transition:end', { to })
    }
  }

  fixedUpdate(fixedDt: number): void {
    this.active?.fixedUpdate?.(fixedDt)
  }

  render(alpha: number): void {
    this.active?.render?.(alpha)
  }

  resize(width: number, height: number): void {
    this.active?.resize?.(width, height)
    this.pending?.next.resize?.(width, height)
  }

  setInputEnabled(enabled: boolean): void {
    this.active?.setInputEnabled?.(enabled)
    this.pending?.next.setInputEnabled?.(enabled)
  }

  setPlayerIdentity(identity: PlayerIdentity): void {
    this.active?.setPlayerIdentity?.(identity)
    this.pending?.next.setPlayerIdentity?.(identity)
  }

  setRemoteActors(actors: RemoteActorData[]): void {
    this.active?.setRemoteActors?.(actors)
  }

  setFarms(ownerships: PlotOwnership[]): void {
    this.active?.setFarms?.(ownerships)
  }

  restartDuel(setup: DuelSetup): void {
    this.active?.restartDuel?.(setup)
  }

  getPlayerPosition(): PlayerPosition | null {
    return this.active?.getPlayerPosition?.() ?? null
  }

  getAmbientCount(): number {
    return this.active?.getAmbientCount?.() ?? 0
  }

  destroy(): void {
    if (this.active) {
      this.active.exit?.()
      this.stage.removeChild(this.active.root)
      this.active.destroy()
      this.active = null
    }
    if (this.pending) {
      this.pending.next.destroy()
      this.pending = null
    }
    this.activeId = null
  }

  private replaceActive(scene: Scene, id: SceneId): void {
    if (this.active) {
      this.active.exit?.()
      this.stage.removeChild(this.active.root)
      this.active.destroy()
    }
    this.stage.addChild(scene.root)
    scene.enter?.()
    this.active = scene
    this.activeId = id
  }
}
