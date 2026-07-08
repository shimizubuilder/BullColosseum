import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Player } from '@/domain/models/player'
import { statsOf } from '@/domain/stats'
import { divisionOf } from '@/domain/rating'
import { applyXp, tierOf, xpForNext } from '@/domain/progression'
import { trainingCost, trainingXp, vaultConversion } from '@/domain/economy'
import { findGear, type GearId } from '@/domain/config/gear'
import type { RegisterInput } from '@/services/api/playerApi'
import * as profileApi from '@/services/api/profileApi'
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

  function trainBull(): boolean {
    if (!player.value) {
      return false
    }
    const bull = player.value.activeBull
    const cost = trainingCost(bull.level)
    if (player.value.currency.gold < cost) {
      return false
    }
    player.value.currency.gold -= cost
    const progressed = applyXp(bull.level, bull.xp, trainingXp(bull.level))
    bull.level = progressed.level
    bull.xp = progressed.xp
    void save()
    return true
  }

  function buyGear(gearId: GearId): boolean {
    if (!player.value) {
      return false
    }
    const gear = findGear(gearId)
    const bull = player.value.activeBull
    if (!gear || bull.gear.includes(gearId)) {
      return false
    }
    const wallet = player.value.currency
    const balance = gear.currency === 'token' ? wallet.chargeToken : wallet.gold
    if (balance < gear.cost) {
      return false
    }
    if (gear.currency === 'token') {
      wallet.chargeToken -= gear.cost
    } else {
      wallet.gold -= gear.cost
    }
    bull.gear.push(gearId)
    void save()
    return true
  }

  function recordWallet(address: string): void {
    if (!player.value) {
      return
    }
    player.value.wallet = { address, status: 'unverified' }
    if (isServerAccount.value) {
      void profileApi.setWallet(player.value.account.token, address)
    }
  }

  function markWalletLinked(address: string, nonce: string, signature: string): void {
    if (!player.value) {
      return
    }
    player.value.wallet = { address, status: 'linked' }
    if (isServerAccount.value) {
      void profileApi.verifyWallet(player.value.account.token, address, nonce, signature)
    }
  }

  async function renameAccount(username: string): Promise<{ ok: boolean; error?: string }> {
    if (!player.value || player.value.usernameChanged) {
      return { ok: false, error: 'locked' }
    }
    const nextName = username.trim().slice(0, 16)
    if (!nextName || nextName === player.value.account.username) {
      return { ok: false, error: 'unchanged' }
    }
    if (isServerAccount.value) {
      const result = await profileApi.rename(player.value.account.token, nextName)
      if (result.status === 'ok' && result.data.ok && result.data.player) {
        player.value.account.username = result.data.player.username
        player.value.usernameChanged = true
        return { ok: true }
      }
      const error = result.status === 'ok' && result.data.error === 'taken' ? 'taken' : 'failed'
      return { ok: false, error }
    }
    player.value.account.username = nextName
    player.value.usernameChanged = true
    return { ok: true }
  }

  function convertVault(fraction: number): number {
    if (!player.value) {
      return 0
    }
    const { spentGold, mintedTokens } = vaultConversion(player.value.currency.gold, fraction)
    if (spentGold <= 0) {
      return 0
    }
    player.value.currency.gold -= spentGold
    player.value.currency.chargeToken += mintedTokens
    void save()
    return mintedTokens
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
    trainBull,
    buyGear,
    convertVault,
    recordWallet,
    markWalletLinked,
    renameAccount,
  }
})
