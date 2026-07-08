import type { SceneId } from './SceneId'

const ALLOWED: Record<SceneId, SceneId[]> = {
  boot: ['login', 'overworld'],
  login: ['overworld'],
  overworld: ['login', 'farm', 'duel'],
  farm: ['overworld', 'duel'],
  duel: ['overworld', 'farm'],
}

export function canTransition(from: SceneId | null, to: SceneId): boolean {
  if (from === to) {
    return false
  }
  if (from === null) {
    return true
  }
  return ALLOWED[from].includes(to)
}
