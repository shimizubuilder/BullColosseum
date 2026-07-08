<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { Engine } from '@/engine/Engine'
import type { SceneId as EngineSceneId } from '@/engine/scene/SceneId'
import { useSceneStore, type OverlayId, type SceneId as UiSceneId } from '@/stores/useSceneStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useWorldStore } from '@/stores/useWorldStore'

const root = useTemplateRef<HTMLDivElement>('root')
const scene = useSceneStore()
const player = usePlayerStore()
const world = useWorldStore()

let engine: Engine | null = null
let disposed = false
let stops: (() => void)[] = []

const SCENE_MAP: Partial<Record<UiSceneId, EngineSceneId>> = {
  boot: 'boot',
  login: 'login',
  world: 'overworld',
}

const OVERLAY_BUILDINGS: OverlayId[] = ['stable', 'shop', 'vault', 'leaderboard', 'quests']

function toEngineScene(id: UiSceneId): EngineSceneId | null {
  return SCENE_MAP[id] ?? null
}

function identity(): { name: string; avatar: string } {
  return { name: player.player?.account.username ?? 'Player', avatar: player.player?.account.avatar ?? 'ansem' }
}

function handleEnter(target: string): void {
  if ((OVERLAY_BUILDINGS as string[]).includes(target)) {
    scene.openOverlay(target as OverlayId)
  }
}

onMounted(async () => {
  const container = root.value
  if (!container) {
    return
  }

  const created = await Engine.create()
  if (disposed) {
    created.destroy()
    return
  }
  engine = created
  engine.mount(container)
  engine.setPlayerIdentity(identity())

  stops = [
    engine.bus.on('transition:start', ({ to }) => {
      scene.setTransitioning(true)
      if (to === 'overworld') {
        engine?.setPlayerIdentity(identity())
      }
    }),
    engine.bus.on('transition:end', () => scene.setTransitioning(false)),
    engine.bus.on('world:prompt', ({ text }) => world.setPrompt(text)),
    engine.bus.on('world:enter', ({ target }) => handleEnter(target)),
    watch(
      () => scene.current,
      (id) => {
        const target = toEngineScene(id)
        if (target) {
          engine?.changeScene(target)
        }
      },
    ),
    watch(
      () => scene.overlay,
      (overlay) => engine?.setInputEnabled(overlay === null),
    ),
  ]

  engine.start(toEngineScene(scene.current) ?? 'boot')
})

onBeforeUnmount(() => {
  disposed = true
  stops.forEach((stop) => stop())
  stops = []
  world.setPrompt(null)
  engine?.destroy()
  engine = null
})
</script>

<template>
  <div ref="root" class="game-stage" />
</template>

<style scoped>
.game-stage {
  position: fixed;
  inset: 0;
  z-index: 0;
}
</style>
