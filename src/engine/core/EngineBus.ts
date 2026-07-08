import type { SceneId } from '@/engine/scene/SceneId'

export interface EngineEventMap {
  'transition:start': { from: SceneId | null; to: SceneId }
  'transition:end': { to: SceneId }
  'world:prompt': { text: string | null }
  'world:enter': { target: string }
  'duel:end': { won: boolean }
}

type Handler<Payload> = (payload: Payload) => void

export class EngineBus {
  private readonly handlers = new Map<keyof EngineEventMap, Set<Handler<never>>>()

  on<K extends keyof EngineEventMap>(event: K, handler: Handler<EngineEventMap[K]>): () => void {
    let set = this.handlers.get(event)
    if (!set) {
      set = new Set<Handler<never>>()
      this.handlers.set(event, set)
    }
    set.add(handler)
    return () => {
      set.delete(handler)
    }
  }

  emit<K extends keyof EngineEventMap>(event: K, payload: EngineEventMap[K]): void {
    const set = this.handlers.get(event)
    if (!set) {
      return
    }
    for (const handler of set) {
      const typed = handler as Handler<EngineEventMap[K]>
      typed(payload)
    }
  }

  clear(): void {
    this.handlers.clear()
  }
}
