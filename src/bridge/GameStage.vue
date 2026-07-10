<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { Engine } from '@/engine/Engine'
import type { SceneId as EngineSceneId } from '@/engine/scene/SceneId'
import { useSceneStore, type OverlayId, type SceneId as UiSceneId } from '@/stores/useSceneStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useWorldStore } from '@/stores/useWorldStore'
import { usePresenceStore } from '@/stores/usePresenceStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { useFarmStore } from '@/stores/useFarmStore'
import { useDuelStore, type DuelIntent } from '@/stores/useDuelStore'
import { useControlsStore } from '@/stores/useControlsStore'
import { useKingStore } from '@/stores/useKingStore'
import { useSpectateStore } from '@/stores/useSpectateStore'
import { useLeaderboardStore } from '@/stores/useLeaderboardStore'
import { useQuestStore } from '@/stores/useQuestStore'
import * as presenceApi from '@/services/api/presenceApi'
import type { PlotOwnership } from '@/engine/world/PlotSprite'
import type { DuelFighter, DuelSetup } from '@/engine/duel/DuelDirector'
import { createOpponent, createSpectateFighter, type SpectateEntry } from '@/domain/combat/matchmaking'
import { rollMatchReward } from '@/domain/combat/matchReward'
import { kingChallengerSkill, kingChallengerStats, type KingBull } from '@/domain/combat/king'
import { KING, SPECTATE } from '@/domain/config/balance'
import { statsOf } from '@/domain/stats'

const root = useTemplateRef<HTMLDivElement>('root')
const scene = useSceneStore()
const player = usePlayerStore()
const world = useWorldStore()
const presence = usePresenceStore()
const session = useSessionStore()
const farm = useFarmStore()
const duel = useDuelStore()
const controls = useControlsStore()
const king = useKingStore()
const spectate = useSpectateStore()
const leaderboard = useLeaderboardStore()
const quest = useQuestStore()

const HEARTBEAT_INTERVAL_MS = 1300
const RECONNECT_EVERY = 5

const bootFailed = ref(false)

let engine: Engine | null = null
let disposed = false
let reconnectSkips = 0
let stops: (() => void)[] = []
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let heartbeatInFlight = false
let pendingDuel: { kind: DuelIntent; opponentName: string; foeTier: number; myTier: number } | null = null

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

function reload(): void {
  window.location.reload()
}

function identity(): { name: string; avatar: string } {
  return { name: player.player?.account.username ?? 'Player', avatar: player.player?.account.avatar ?? 'ansem' }
}

function farmOwnerships(): PlotOwnership[] {
  return Object.entries(farm.farmsByPlot).map(([index, info]) => ({
    index: Number(index),
    mine: info.mine,
    label: info.username,
    bulls: info.bulls,
  }))
}

function meFighter(): DuelFighter {
  const account = player.player
  return {
    name: account?.account.username ?? 'You',
    element: account?.activeBull.element ?? 'fire',
    stats: player.stats ?? (account ? statsOf(account.activeBull) : statsOf({ element: 'fire', level: 1 })),
    skill: 0.75,
  }
}

function startRankedDuel(): void {
  const account = player.player
  if (!account || !engine) {
    return
  }
  const opponent = createOpponent(account.activeBull.level, account.record.wins, Math.random)
  const foe: DuelFighter = {
    name: opponent.name,
    element: opponent.element,
    stats: statsOf({ element: opponent.element, level: opponent.level, gear: [], traits: opponent.traits, mythic: opponent.mythic }),
    skill: opponent.skill,
  }
  engine.setDuelSetup({ me: meFighter(), foe, spectate: false })
  pendingDuel = { kind: 'ranked', opponentName: opponent.name, foeTier: opponent.tier, myTier: player.tier }
  duel.begin('ranked')
  scene.goto('duel')
}

function startKingDuel(): void {
  const account = player.player
  if (!account || !engine) {
    return
  }
  const state = king.state
  const tier = state?.tier ?? KING.defaultChallengeTier
  const bull: KingBull = state?.bull ?? {
    element: 'shadow',
    level: KING.defaultChallengeLevel,
    traits: [],
    mythic: false,
  }
  const foe: DuelFighter = {
    name: state?.username ?? 'King',
    element: bull.element,
    stats: kingChallengerStats(bull, tier),
    skill: kingChallengerSkill(tier),
  }
  engine.setDuelSetup({ me: meFighter(), foe, spectate: false })
  pendingDuel = { kind: 'king', opponentName: foe.name, foeTier: tier, myTier: player.tier }
  duel.begin('king')
  scene.goto('duel')
}

function spectateFighter(entry: SpectateEntry): DuelFighter {
  const fighter = createSpectateFighter(entry, Math.random)
  return { name: fighter.name, element: fighter.element, stats: fighter.stats, skill: fighter.skill }
}

function spectateSetup(): DuelSetup | null {
  const pair = spectate.pair
  if (!pair) {
    return null
  }
  return { me: spectateFighter(pair[0]), foe: spectateFighter(pair[1]), spectate: true }
}

async function startSpectate(): Promise<void> {
  if (!engine) {
    return
  }
  if (leaderboard.entries.length === 0) {
    await leaderboard.load()
  }
  const entries: SpectateEntry[] = leaderboard.entries.map((entry) => ({
    username: entry.username,
    rating: entry.rating,
    tier: entry.tier,
  }))
  spectate.begin(entries)
  const setup = spectateSetup()
  if (!setup || !engine) {
    spectate.exit()
    return
  }
  quest.progress('spectate', 1)
  engine.setDuelSetup(setup)
  duel.begin('spectate')
  scene.goto('duel')
}

function handleSpectateEnd(won: boolean): void {
  spectate.settle(won ? 'a' : 'b')
  window.setTimeout(() => {
    if (disposed || !engine || duel.context !== 'spectate' || !spectate.active) {
      return
    }
    spectate.nextMatch()
    const setup = spectateSetup()
    if (setup) {
      engine.restartDuel(setup)
    }
  }, SPECTATE.nextMatchDelayMs)
}

function runIntent(kind: DuelIntent): void {
  if (kind === 'ranked') {
    startRankedDuel()
  } else if (kind === 'king') {
    startKingDuel()
  } else if (kind === 'spectate') {
    void startSpectate()
  }
}

async function resolveRankedDuel(won: boolean, foeTier: number, myTier: number, opponentName: string): Promise<void> {
  const reward = rollMatchReward(won, foeTier, myTier, Math.random)
  const ratingDelta = await player.resolveMatch(won, reward, opponentName)
  if (won) {
    quest.progress('win', 1)
  }
  duel.finish({ won, opponentName, reward, ratingDelta })
}

async function resolveKingDuel(won: boolean, tier: number): Promise<void> {
  const account = player.player
  if (won && account) {
    const bull: KingBull = {
      element: account.activeBull.element,
      level: account.activeBull.level,
      traits: account.activeBull.traits,
      mythic: account.activeBull.mythic,
    }
    if (!player.isServerAccount) {
      player.grantReward(KING.becomeKingGoldReward, 0)
    }
    await king.becomeKing({
      useServer: player.isServerAccount,
      token: account.account.token,
      tier,
      bull,
      username: account.account.username,
      avatar: account.account.avatar,
    })
    void player.save()
  }
  scene.goto('world')
  scene.openOverlay('king')
}

async function resolveDuel(won: boolean): Promise<void> {
  if (duel.context === 'spectate') {
    handleSpectateEnd(won)
    return
  }
  const current = pendingDuel
  pendingDuel = null
  if (!current) {
    scene.goto('world')
    return
  }
  if (current.kind === 'king') {
    await resolveKingDuel(won, current.myTier)
    return
  }
  await resolveRankedDuel(won, current.foeTier, current.myTier, current.opponentName)
  scene.goto('world')
}

function handleEnter(target: string): void {
  if ((OVERLAY_BUILDINGS as string[]).includes(target)) {
    scene.openOverlay(target as OverlayId)
    return
  }
  if (target === 'colosseum') {
    scene.openOverlay('colosseum')
    return
  }
  if (target.startsWith('plot:')) {
    farm.selectPlot(Number(target.slice(5)))
    scene.openOverlay('pen')
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
    reconnectSkips += 1
    if (reconnectSkips < RECONNECT_EVERY) {
      return
    }
    reconnectSkips = 0
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
      if (!session.online) {
        session.setOnline(true)
      }
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

  await Promise.race([
    document.fonts.load('700 16px Cinzel'),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ])

  let created: Engine
  try {
    created = await Engine.create()
  } catch (error) {
    console.error('[GameStage] failed to initialize engine', error)
    bootFailed.value = true
    return
  }
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
      () => duel.intent,
      (value) => {
        if (value) {
          duel.consumeIntent()
          runIntent(value)
        }
      },
    ),
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
        if (id === 'world') {
          void king.refresh(identity().name)
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
    watch(
      () => [controls.moveX, controls.moveY] as const,
      ([x, y]) => engine?.setMoveAxis(x, y),
    ),
    watch(
      () => controls.interactSeq,
      () => engine?.interact(),
    ),
  ]

  try {
    await engine.start(toEngineScene(scene.current) ?? 'boot')
  } catch (error) {
    console.error('[GameStage] failed to start initial scene', error)
    bootFailed.value = true
    return
  }
  if (scene.current === 'world' || scene.current === 'farm') {
    startHeartbeat()
    void king.refresh(identity().name)
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
  <div v-if="bootFailed" class="game-error">
    <p>The arena failed to load.</p>
    <button type="button" @click="reload">Reload</button>
  </div>
</template>

<style scoped>
.game-stage {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.game-error {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  color: var(--color-text);
  background: var(--color-bg);
}

.game-error button {
  padding: 0.6rem 1.4rem;
  border: 1px solid var(--color-accent);
  border-radius: 10px;
  background: rgba(229, 72, 77, 0.14);
  color: var(--color-text);
  font-weight: 700;
  cursor: pointer;
}
</style>
