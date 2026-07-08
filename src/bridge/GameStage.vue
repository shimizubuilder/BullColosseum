<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { Engine } from '@/engine/Engine'
import type { SceneId as EngineSceneId } from '@/engine/scene/SceneId'
import { useSceneStore, type OverlayId, type SceneId as UiSceneId } from '@/stores/useSceneStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useWorldStore } from '@/stores/useWorldStore'
import { usePresenceStore } from '@/stores/usePresenceStore'
import { useSessionStore } from '@/stores/useSessionStore'
import * as presenceApi from '@/services/api/presenceApi'

const root = useTemplateRef<HTMLDivElement>('root')
const scene = useSceneStore()
const player = usePlayerStore()
const world = useWorldStore()
const presence = usePresenceStore()
const session = useSessionStore()

const HEARTBEAT_INTERVAL_MS = 1300

let engine: Engine | null = null
let disposed = false
let stops: (() => void)[] = []
let heartbeatTimer: ReturnType<typeof setInterval> | null = null

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

async function heartbeat(): Promise<void> {
  if (!engine) {
    return
  }
  const position = engine.getPlayerPosition()
  const ambient = engine.getAmbientCount()
  if (!position) {
    return
  }
  if (!session.online) {
    engine.setRemoteActors([])
    presence.setRemotePlayers([])
    presence.setOnlineCount(1 + ambient)
    return
  }
  const self = identity()
  const result = await presenceApi.heartbeat({
    username: self.name,
    avatar: self.avatar,
    x: Math.round(position.x),
    y: Math.round(position.y),
    map: position.map,
  })
  if (result.status === 'ok' && result.data.ok) {
    const others = (result.data.players ?? []).filter((remote) => remote.username !== self.name)
    engine.setRemoteActors(others)
    presence.setRemotePlayers(others)
    presence.setOnlineCount((result.data.online ?? 1) + ambient)
    if (result.data.time) {
      presence.setServerOffset(result.data.time * 1000 - Date.now())
    }
    presence.markHeartbeat(Date.now())
  } else {
    session.setOnline(false)
    engine.setRemoteActors([])
    presence.setRemotePlayers([])
    presence.setOnlineCount(1 + ambient)
  }
}

function startHeartbeat(): void {
  if (heartbeatTimer) {
    return
  }
  void heartbeat()
  heartbeatTimer = setInterval(() => void heartbeat(), HEARTBEAT_INTERVAL_MS)
}

function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
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
        if (id === 'world') {
          startHeartbeat()
        } else {
          stopHeartbeat()
        }
      },
    ),
    watch(
      () => scene.overlay,
      (overlay) => engine?.setInputEnabled(overlay === null),
    ),
  ]

  engine.start(toEngineScene(scene.current) ?? 'boot')
  if (scene.current === 'world') {
    startHeartbeat()
  }
})

onBeforeUnmount(() => {
  disposed = true
  stopHeartbeat()
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
