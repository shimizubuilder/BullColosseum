<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { Engine } from '@/engine/Engine'
import type { SceneId as EngineSceneId } from '@/engine/scene/SceneId'
import { useSceneStore, type OverlayId, type SceneId as UiSceneId } from '@/stores/useSceneStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useWorldStore } from '@/stores/useWorldStore'
import { usePresenceStore } from '@/stores/usePresenceStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { useFarmStore } from '@/stores/useFarmStore'
import { useDuelStore } from '@/stores/useDuelStore'
import * as presenceApi from '@/services/api/presenceApi'
import type { PlotOwnership } from '@/engine/world/PlotSprite'
import type { DuelFighter } from '@/engine/duel/DuelDirector'
import { createOpponent } from '@/domain/combat/matchmaking'
import { rollMatchReward } from '@/domain/combat/matchReward'
import { statsOf } from '@/domain/stats'

const root = useTemplateRef<HTMLDivElement>('root')
const scene = useSceneStore()
const player = usePlayerStore()
const world = useWorldStore()
const presence = usePresenceStore()
const session = useSessionStore()
const farm = useFarmStore()
const duel = useDuelStore()

const HEARTBEAT_INTERVAL_MS = 1300

let engine: Engine | null = null
let disposed = false
let stops: (() => void)[] = []
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let heartbeatInFlight = false
let pendingDuel: { opponentName: string; foeTier: number; myTier: number } | null = null

const SCENE_MAP: Partial<Record<UiSceneId, EngineSceneId>> = {
  boot: 'boot',
  login: 'login',
  world: 'overworld',
  farm: 'farm',
  duel: 'duel',
}

const OVERLAY_BUILDINGS: OverlayId[] = ['stable', 'shop', 'vault', 'leaderboard', 'quests']

function toEngineScene(id: UiSceneId): EngineSceneId | null {
  return SCENE_MAP[id] ?? null
}

function identity(): { name: string; avatar: string } {
  return { name: player.player?.account.username ?? 'Player', avatar: player.player?.account.avatar ?? 'ansem' }
}

function farmOwnerships(): PlotOwnership[] {
  return Object.entries(farm.farmsByPlot).map(([index, info]) => ({
    index: Number(index),
    mine: info.mine,
    label: info.mine ? `★ ${info.username}` : info.username,
    bulls: info.bulls,
  }))
}

function startDuel(): void {
  const account = player.player
  if (!account || !engine) {
    return
  }
  const opponent = createOpponent(account.activeBull.level, account.record.wins, Math.random)
  const me: DuelFighter = {
    name: account.account.username,
    element: account.activeBull.element,
    stats: player.stats ?? statsOf(account.activeBull),
    skill: 0.75,
  }
  const foe: DuelFighter = {
    name: opponent.name,
    element: opponent.element,
    stats: statsOf({ element: opponent.element, level: opponent.level, gear: [], traits: opponent.traits, mythic: opponent.mythic }),
    skill: opponent.skill,
  }
  engine.setDuelSetup({ me, foe, spectate: false })
  pendingDuel = { opponentName: opponent.name, foeTier: opponent.tier, myTier: player.tier }
  duel.begin('ranked')
  scene.goto('duel')
}

async function resolveDuel(won: boolean): Promise<void> {
  if (!pendingDuel) {
    scene.goto('world')
    return
  }
  const reward = rollMatchReward(won, pendingDuel.foeTier, pendingDuel.myTier, Math.random)
  const ratingDelta = await player.resolveMatch(won, reward, pendingDuel.opponentName)
  duel.finish({ won, opponentName: pendingDuel.opponentName, reward, ratingDelta })
  pendingDuel = null
  scene.goto('world')
}

function handleEnter(target: string): void {
  if ((OVERLAY_BUILDINGS as string[]).includes(target)) {
    scene.openOverlay(target as OverlayId)
    return
  }
  if (target === 'colosseum') {
    startDuel()
    return
  }
  if (target.startsWith('plot:')) {
    farm.selectPlot(Number(target.slice(5)))
    scene.openOverlay('kandang')
    return
  }
  if (target === 'portal:farm') {
    scene.goto('farm')
    return
  }
  if (target === 'portal:main') {
    scene.goto('world')
  }
}

async function heartbeat(): Promise<void> {
  if (heartbeatInFlight) {
    return
  }
  const activeEngine = engine
  if (!activeEngine) {
    return
  }
  const position = activeEngine.getPlayerPosition()
  const ambient = activeEngine.getAmbientCount()
  if (!position) {
    return
  }
  if (!session.online) {
    activeEngine.setRemoteActors([])
    presence.setRemotePlayers([])
    presence.setOnlineCount(1 + ambient)
    return
  }
  heartbeatInFlight = true
  try {
    const self = identity()
    const result = await presenceApi.heartbeat({
      username: self.name,
      avatar: self.avatar,
      x: Math.round(position.x),
      y: Math.round(position.y),
      map: position.map,
    })
    if (disposed || engine !== activeEngine) {
      return
    }
    if (result.status === 'ok' && result.data.ok) {
      const others = (result.data.players ?? []).filter((remote) => remote.username !== self.name)
      activeEngine.setRemoteActors(others)
      presence.setRemotePlayers(others)
      presence.setOnlineCount((result.data.online ?? 1) + ambient)
      if (result.data.time) {
        const offset = result.data.time * 1000 - Date.now()
        presence.setServerOffset(offset)
        activeEngine.setServerOffset(offset)
      }
      presence.markHeartbeat(Date.now())
    } else {
      session.setOnline(false)
      activeEngine.setRemoteActors([])
      presence.setRemotePlayers([])
      presence.setOnlineCount(1 + ambient)
    }
  } finally {
    heartbeatInFlight = false
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
    engine.bus.on('transition:end', ({ to }) => {
      scene.setTransitioning(false)
      if (to === 'farm') {
        engine?.setFarms(farmOwnerships())
      }
    }),
    engine.bus.on('world:prompt', ({ text }) => world.setPrompt(text)),
    engine.bus.on('world:enter', ({ target }) => handleEnter(target)),
    engine.bus.on('duel:end', ({ won }) => void resolveDuel(won)),
    watch(
      () => scene.current,
      (id) => {
        const target = toEngineScene(id)
        if (target) {
          engine?.changeScene(target)
        }
        if (id === 'world' || id === 'farm') {
          startHeartbeat()
        } else {
          stopHeartbeat()
        }
        if (id === 'farm') {
          void farm.load()
        }
      },
    ),
    watch(
      () => farm.farmsByPlot,
      () => engine?.setFarms(farmOwnerships()),
      { deep: true },
    ),
    watch(
      () => scene.overlay,
      (overlay) => engine?.setInputEnabled(overlay === null),
    ),
  ]

  engine.start(toEngineScene(scene.current) ?? 'boot')
  if (scene.current === 'world' || scene.current === 'farm') {
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
