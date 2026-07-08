import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Player } from '@/domain/models/player'
import { statsOf } from '@/domain/stats'
import { divisionOf } from '@/domain/rating'
import { applyXp, tierOf, xpForNext } from '@/domain/progression'
import type { RegisterInput } from '@/services/api/playerApi'
import { newLocalToken } from '@/services/offline/OfflineOracle'
import {
  loadPlayer,
  registerPlayer,
  savePlayer,
  type MatchOutcome,
} from '@/services/repositories/PlayerRepository'
import { useSessionStore } from './useSessionStore'

function isLocalToken(token: string): boolean {
  return token.length === 0 || token.startsWith('local-')
}

export const usePlayerStore = defineStore('player', () => {
  const session = useSessionStore()
  const player = ref<Player | null>(null)

  const activeBull = computed(() => player.value?.activeBull ?? null)
  const stats = computed(() => (activeBull.value ? statsOf(activeBull.value) : null))
  const tier = computed(() => (player.value ? tierOf(player.value.activeBull.level) : 0))
  const division = computed(() => divisionOf(player.value?.record.rating ?? 0))
  const xpToNext = computed(() => (player.value ? xpForNext(player.value.activeBull.level) : 0))
  const isServerAccount = computed(
    () => Boolean(player.value) && session.online && !isLocalToken(player.value?.account.token ?? ''),
  )

  function setPlayer(next: Player): void {
    player.value = next
  }

  async function register(input: RegisterInput): Promise<void> {
    const result = await registerPlayer(input, session.online, newLocalToken(Math.random))
    player.value = result.player
    session.setDataSource(result.source)
  }

  async function resumeFromServer(): Promise<void> {
    if (!player.value) {
      return
    }
    const result = await loadPlayer(player.value.account.token, session.online)
    if (result) {
      player.value = result.player
      session.setDataSource(result.source)
    }
  }

  async function save(): Promise<void> {
    if (!player.value) {
      return
    }
    const source = await savePlayer(player.value, session.online)
    session.setDataSource(source)
  }

  function applyMatchResult(outcome: MatchOutcome, xpGain: number): void {
    if (!player.value) {
      return
    }
    const progressed = applyXp(player.value.activeBull.level, player.value.activeBull.xp, xpGain)
    player.value.record = outcome.record
    player.value.currency = outcome.currency
    player.value.activeBull.level = progressed.level
    player.value.activeBull.xp = progressed.xp
    session.setDataSource(outcome.source)
  }

  return {
    player,
    activeBull,
    stats,
    tier,
    division,
    xpToNext,
    isServerAccount,
    setPlayer,
    register,
    resumeFromServer,
    save,
    applyMatchResult,
  }
})
