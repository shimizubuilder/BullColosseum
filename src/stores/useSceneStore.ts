import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SceneId = 'boot' | 'login' | 'world' | 'farm' | 'duel'

export type OverlayId =
  | 'stable'
  | 'shop'
  | 'vault'
  | 'leaderboard'
  | 'profile'
  | 'quests'
  | 'guide'
  | 'tournament'
  | 'kandang'
  | 'king'
  | 'colosseum'

export const useSceneStore = defineStore('scene', () => {
  const current = ref<SceneId>('boot')
  const previous = ref<SceneId>('boot')
  const overlay = ref<OverlayId | null>(null)
  const isTransitioning = ref(false)

  function goto(scene: SceneId): void {
    if (scene !== current.value) {
      previous.value = current.value
    }
    current.value = scene
    overlay.value = null
  }

  function openOverlay(id: OverlayId): void {
    overlay.value = id
  }

  function closeOverlay(): void {
    overlay.value = null
  }

  return { current, previous, overlay, isTransitioning, goto, openOverlay, closeOverlay }
})
