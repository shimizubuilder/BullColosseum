import { Container } from 'pixi.js'
import { BaseScene, type PlayerIdentity, type PlayerPosition, type SceneContext } from '@/engine/scene/Scene'
import { isoBounds, isoToWorld, worldToIso } from '@/engine/iso/isoMath'
import { MAIN_MAP } from '@/domain/maps/mainMap'
import type { BuildingDef, MapDefinition } from '@/domain/maps/mapTypes'
import { buildBlockedGrid, computePath, type BlockedGrid } from '@/engine/world/pathfinding'
import type { Point } from '@/engine/iso/isoMath'
import { createGroundLayer } from '@/engine/world/GroundLayer'
import { createBuildingSprite } from '@/engine/world/BuildingSprite'
import { createPropSprite } from '@/engine/world/PropSprite'
import { AvatarSprite } from '@/engine/world/AvatarSprite'
import { Minimap } from '@/engine/world/Minimap'
import { WorldInput } from '@/engine/input/WorldInput'
import { buildingDoor, pickBuildingAtScreen, promptAt } from '@/engine/world/worldInteractions'
import { WorldActor, type RemoteActorData } from '@/engine/world/WorldActor'
import { EnvironmentLayer } from '@/engine/world/EnvironmentLayer'

const PLAYER_SPEED = 260
const NPC_SPEED = 95
const REMOTE_SPEED = 320
const NPC_NAME_COLOR = 0xcfc3e6
const REMOTE_NAME_COLOR = 0x8affc0
const AMBIENT_NPCS: { name: string; avatar: string }[] = [
  { name: 'Toroshi', avatar: 'red' },
  { name: 'MoonGored', avatar: 'gold' },
  { name: 'HornDegen', avatar: 'bolt' },
  { name: 'CalfEnjoyer', avatar: 'shadow' },
  { name: 'SolBull', avatar: 'ansem' },
]

function wanderTarget(map: MapDefinition): Point {
  return { x: 200 + Math.random() * (map.width - 400), y: 200 + Math.random() * (map.height - 400) }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

interface PlayerState {
  x: number
  y: number
  facing: number
  phase: number
  path: Point[] | null
  pathIndex: number
}

interface EnterIntent {
  target: string
  doorX: number
  doorY: number
  radius: number
}

export class OverworldScene extends BaseScene {
  readonly id = 'overworld' as const

  private readonly map: MapDefinition = MAIN_MAP
  private readonly grid: BlockedGrid = buildBlockedGrid(MAIN_MAP)
  private readonly worldLayer = new Container()
  private readonly entityLayer = new Container()
  private readonly hudLayer = new Container()
  private readonly environment = new EnvironmentLayer()
  private readonly avatar: AvatarSprite
  private readonly avatarHolder = new Container()
  private readonly minimap: Minimap

  private readonly player: PlayerState
  private readonly npcs: WorldActor[] = []
  private readonly remotes = new Map<string, WorldActor>()
  private input: WorldInput | null = null
  private inputEnabled = true
  private cameraX = 0
  private cameraY = 0
  private prompt: string | null = null
  private promptTarget: string | null = null
  private pendingEnter: EnterIntent | null = null

  constructor(context: SceneContext) {
    super(context)
    this.player = { x: this.map.spawn.x, y: this.map.spawn.y, facing: 1, phase: 0, path: null, pathIndex: 0 }

    this.worldLayer.addChild(createGroundLayer(this.map.width, this.map.height))
    this.entityLayer.sortableChildren = true
    this.worldLayer.addChild(this.entityLayer)
    this.root.addChild(this.environment.background)
    this.root.addChild(this.worldLayer)
    this.root.addChild(this.environment.foreground)

    for (const building of this.map.buildings) {
      const sprite = createBuildingSprite(building)
      const iso = worldToIso(building.x, building.y)
      sprite.position.set(iso.x, iso.y)
      sprite.zIndex = building.x + building.y
      this.entityLayer.addChild(sprite)
    }
    for (const prop of this.map.props) {
      const sprite = createPropSprite(prop)
      sprite.zIndex = prop.x + prop.y
      this.entityLayer.addChild(sprite)
    }

    this.avatar = new AvatarSprite(context.playerIdentity.avatar, context.playerIdentity.name)
    this.avatarHolder.addChild(this.avatar.container)
    this.entityLayer.addChild(this.avatarHolder)

    for (const definition of AMBIENT_NPCS) {
      const spawn = wanderTarget(this.map)
      const npc = new WorldActor(definition.avatar, definition.name, spawn.x, spawn.y, NPC_NAME_COLOR)
      npc.setTarget(wanderTarget(this.map).x, wanderTarget(this.map).y)
      this.entityLayer.addChild(npc.container)
      this.npcs.push(npc)
    }

    this.minimap = new Minimap(this.map)
    this.hudLayer.addChild(this.minimap.container)
    this.root.addChild(this.hudLayer)
  }

  enter(): void {
    this.input = new WorldInput(this.context.app.canvas)
    this.input.attach()
  }

  exit(): void {
    this.input?.detach()
    this.input = null
  }

  destroy(): void {
    this.input?.detach()
    this.input = null
    super.destroy()
  }

  setInputEnabled(enabled: boolean): void {
    this.inputEnabled = enabled
    if (!enabled) {
      this.player.path = null
    }
  }

  setPlayerIdentity(identity: PlayerIdentity): void {
    this.avatar.setIdentity(identity.avatar, identity.name)
  }

  fixedUpdate(fixedDt: number): void {
    if (!this.input) {
      return
    }

    const pointer = this.input.consumePointer()
    if (pointer && this.inputEnabled) {
      this.handleClick(pointer.x, pointer.y)
    }
    if (this.input.consumeEnter() && this.promptTarget) {
      this.emitEnter(this.promptTarget)
    }

    this.updateAmbient(fixedDt)
    this.updateRemotes(fixedDt)

    if (!this.inputEnabled) {
      return
    }

    let dx = 0
    let dy = 0
    const axis = this.input.axis()
    if (axis.x || axis.y) {
      this.player.path = null
      this.pendingEnter = null
      const length = Math.hypot(axis.x, axis.y)
      dx = axis.x / length
      dy = axis.y / length
    } else if (this.player.path) {
      const waypoint = this.player.path[this.player.pathIndex]
      if (waypoint) {
        const mx = waypoint.x - this.player.x
        const my = waypoint.y - this.player.y
        const distance = Math.hypot(mx, my)
        if (distance < 8) {
          this.player.pathIndex += 1
          if (this.player.pathIndex >= this.player.path.length) {
            this.player.path = null
          }
        } else {
          dx = mx / distance
          dy = my / distance
        }
      } else {
        this.player.path = null
      }
    }

    this.player.x = clamp(this.player.x + dx * PLAYER_SPEED * fixedDt, 16, this.map.width - 16)
    this.player.y = clamp(this.player.y + dy * PLAYER_SPEED * fixedDt, 16, this.map.height - 16)
    if (dx || dy) {
      this.player.phase += fixedDt * 10
      const screenDx = dx - dy
      if (Math.abs(screenDx) > 0.15) {
        this.player.facing = screenDx > 0 ? 1 : -1
      }
    } else {
      this.player.phase = 0
    }

    this.resolveCollisions()
    this.updateProximity()
    this.checkPendingEnter()
  }

  render(): void {
    const width = this.context.app.screen.width
    const height = this.context.app.screen.height
    const iso = worldToIso(this.player.x, this.player.y)
    const bounds = isoBounds(this.map.width, this.map.height)
    this.cameraX = clamp(iso.x - width / 2, bounds.minX - 100, Math.max(bounds.minX - 100, bounds.maxX + 100 - width))
    this.cameraY = clamp(iso.y - height / 2, bounds.minY - 140, Math.max(bounds.minY - 140, bounds.maxY + 180 - height))
    this.worldLayer.position.set(Math.round(-this.cameraX), Math.round(-this.cameraY))

    this.avatarHolder.position.set(iso.x, iso.y)
    this.avatarHolder.zIndex = this.player.x + this.player.y
    this.avatar.setFacing(this.player.facing)
    this.avatar.update(this.player.phase)

    for (const npc of this.npcs) {
      npc.syncSprite()
    }
    for (const remote of this.remotes.values()) {
      remote.syncSprite()
    }

    this.minimap.container.position.set(width - this.minimap.width - 16, 16)
    this.minimap.update(this.player.x, this.player.y)

    this.environment.update(Date.now() + this.context.serverOffset, width, height)
  }

  private updateAmbient(fixedDt: number): void {
    for (const npc of this.npcs) {
      if (npc.waitTimer > 0) {
        npc.waitTimer -= fixedDt
        npc.idle()
        continue
      }
      npc.moveToward(fixedDt, NPC_SPEED)
      if (npc.reachedTarget()) {
        npc.waitTimer = 0.5 + Math.random() * 2
        const next = wanderTarget(this.map)
        npc.setTarget(next.x, next.y)
      }
    }
  }

  private updateRemotes(fixedDt: number): void {
    for (const remote of this.remotes.values()) {
      remote.moveToward(fixedDt, REMOTE_SPEED)
    }
  }

  setRemoteActors(actors: RemoteActorData[]): void {
    const seen = new Set<string>()
    for (const actor of actors) {
      seen.add(actor.username)
      const existing = this.remotes.get(actor.username)
      if (existing) {
        existing.setTarget(actor.x, actor.y)
        existing.setIdentity(actor.avatar, actor.username)
      } else {
        const created = new WorldActor(actor.avatar, actor.username, actor.x, actor.y, REMOTE_NAME_COLOR)
        this.entityLayer.addChild(created.container)
        this.remotes.set(actor.username, created)
      }
    }
    for (const [username, remote] of this.remotes) {
      if (!seen.has(username)) {
        remote.destroy()
        this.remotes.delete(username)
      }
    }
  }

  getPlayerPosition(): PlayerPosition {
    return { x: this.player.x, y: this.player.y, map: 'main' }
  }

  getAmbientCount(): number {
    return this.npcs.length
  }

  private handleClick(screenX: number, screenY: number): void {
    const world = isoToWorld(screenX + this.cameraX, screenY + this.cameraY)
    const building =
      pickBuildingAtScreen(this.map.buildings, screenX, screenY, this.cameraX, this.cameraY) ??
      this.buildingAt(world.x, world.y)
    if (building) {
      const door = buildingDoor(building)
      this.setPath(door.x, door.y)
      this.pendingEnter = { target: building.key, doorX: door.x, doorY: door.y, radius: 78 }
      return
    }
    const portal = this.portalAt(world.x, world.y)
    if (portal) {
      this.setPath(portal.x, portal.y)
      this.pendingEnter = { target: `portal:${portal.target}`, doorX: portal.x, doorY: portal.y, radius: 54 }
      return
    }
    this.pendingEnter = null
    this.setPath(clamp(world.x, 20, this.map.width - 20), clamp(world.y, 20, this.map.height - 20))
  }

  private setPath(targetX: number, targetY: number): void {
    this.player.path = computePath(this.map, this.grid, this.player.x, this.player.y, targetX, targetY)
    this.player.pathIndex = 0
  }

  private buildingAt(worldX: number, worldY: number): BuildingDef | null {
    for (const building of this.map.buildings) {
      if (
        worldX > building.x - building.width / 2 - 14 &&
        worldX < building.x + building.width / 2 + 14 &&
        worldY > building.y - building.depth / 2 - 14 &&
        worldY < building.y + building.depth / 2 + 34
      ) {
        return building
      }
    }
    return null
  }

  private portalAt(worldX: number, worldY: number): MapDefinition['portals'][number] | null {
    for (const portal of this.map.portals) {
      if (Math.hypot(worldX - portal.x, worldY - portal.y) < 60) {
        return portal
      }
    }
    return null
  }

  private resolveCollisions(): void {
    for (const building of this.map.buildings) {
      const centerY = building.y - building.depth * 0.05
      const halfWidth = building.width / 2 + 16
      const halfDepth = building.depth * 0.42 + 16
      const offsetX = this.player.x - building.x
      const offsetY = this.player.y - centerY
      if (Math.abs(offsetX) < halfWidth && Math.abs(offsetY) < halfDepth) {
        const pushX = halfWidth - Math.abs(offsetX)
        const pushY = halfDepth - Math.abs(offsetY)
        if (pushX < pushY) {
          this.player.x = building.x + (offsetX < 0 ? -halfWidth : halfWidth)
        } else {
          this.player.y = centerY + (offsetY < 0 ? -halfDepth : halfDepth)
        }
      }
    }
  }

  private updateProximity(): void {
    const info = promptAt(this.map, this.player.x, this.player.y)
    this.promptTarget = info?.target ?? null
    const prompt = info?.text ?? null
    if (prompt !== this.prompt) {
      this.prompt = prompt
      this.context.bus.emit('world:prompt', { text: prompt })
    }
  }

  private checkPendingEnter(): void {
    const intent = this.pendingEnter
    if (!intent) {
      return
    }
    if (Math.hypot(this.player.x - intent.doorX, this.player.y - intent.doorY) < intent.radius) {
      this.pendingEnter = null
      this.emitEnter(intent.target)
    }
  }

  private emitEnter(target: string): void {
    this.player.path = null
    this.pendingEnter = null
    this.context.bus.emit('world:enter', { target })
  }
}
