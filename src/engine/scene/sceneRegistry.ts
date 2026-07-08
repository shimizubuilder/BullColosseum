import type { SceneId } from './SceneId'
import type { Scene, SceneContext } from './Scene'
import { BootScene } from './scenes/BootScene'
import { LoginScene } from './scenes/LoginScene'
import { OverworldScene } from './scenes/OverworldScene'

type SceneFactory = (context: SceneContext) => Scene

const REGISTRY: Partial<Record<SceneId, SceneFactory>> = {
  boot: (context) => new BootScene(context),
  login: (context) => new LoginScene(context),
  overworld: (context) => new OverworldScene(context),
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
