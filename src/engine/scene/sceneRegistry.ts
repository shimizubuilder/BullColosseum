import type { SceneId } from './SceneId'
import type { Scene, SceneContext } from './Scene'
import { BootScene } from './scenes/BootScene'
import { LoginScene } from './scenes/LoginScene'
import { IsoWorldScene, type AmbientNpc } from './scenes/IsoWorldScene'
import { DuelScene } from './scenes/DuelScene'
import { MAIN_MAP } from '@/domain/maps/mainMap'
import { FARM_MAP } from '@/domain/maps/farmMap'

type SceneFactory = (context: SceneContext) => Scene

const AMBIENT_NPCS: AmbientNpc[] = [
  { name: 'Toroshi', avatar: 'red' },
  { name: 'MoonGored', avatar: 'gold' },
  { name: 'HornDegen', avatar: 'bolt' },
  { name: 'CalfEnjoyer', avatar: 'shadow' },
  { name: 'SolBull', avatar: 'ansem' },
]

const REGISTRY: Partial<Record<SceneId, SceneFactory>> = {
  boot: (context) => new BootScene(context),
  login: (context) => new LoginScene(context),
  overworld: (context) =>
    new IsoWorldScene(context, {
      id: 'overworld',
      map: MAIN_MAP,
      mapKey: 'main',
      minimapTitle: 'MAIN WORLD',
      ambientNpcs: AMBIENT_NPCS,
    }),
  farm: (context) =>
    new IsoWorldScene(context, {
      id: 'farm',
      map: FARM_MAP,
      mapKey: 'farm',
      minimapTitle: 'FARM ISLAND',
      ambientNpcs: [],
    }),
  duel: (context) => new DuelScene(context),
}

export function isSceneRegistered(id: SceneId): boolean {
  return REGISTRY[id] !== undefined
}

export function createScene(id: SceneId, context: SceneContext): Scene {
  const factory = REGISTRY[id]
  if (!factory) {
    throw new Error(`No scene registered for "${id}"`)
  }
  return factory(context)
}
