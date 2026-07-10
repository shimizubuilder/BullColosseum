import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  betPayout,
  isBetWon,
  nextStakeIndex,
  stakeAt,
  type BetSide,
  type MatchWinner,
} from '@/domain/combat/betting'
import { driftViewers, initialViewers, pickSpectatePair, type SpectatePair } from '@/domain/combat/spectate'
import type { SpectateEntry } from '@/domain/combat/matchmaking'
import { usePlayerStore } from './usePlayerStore'
import { useQuestStore } from './useQuestStore'

export const useSpectateStore = defineStore('spectate', () => {
  const pool = ref<SpectateEntry[]>([])
  const pair = ref<SpectatePair | null>(null)
  const viewers = ref(0)
  const stakeIndex = ref(1)
  const side = ref<BetSide | null>(null)
  const placed = ref(false)
  const message = ref('')
  const active = ref(false)

  const stake = computed(() => stakeAt(stakeIndex.value))

  function nextMatch(): void {
    pair.value = pickSpectatePair(pool.value, Math.random)
    side.value = null
    placed.value = false
    message.value = ''
  }

  function begin(entries: SpectateEntry[]): void {
    pool.value = entries
    active.value = true
    viewers.value = initialViewers(Math.random)
    nextMatch()
  }

  function cycleStake(): void {
    if (placed.value) {
      return
    }
    stakeIndex.value = nextStakeIndex(stakeIndex.value)
  }

  function placeBet(betSide: BetSide): void {
    if (placed.value || !pair.value) {
      return
    }
    const amount = stake.value
    const player = usePlayerStore()
    if (!player.chargeGold(amount)) {
      message.value = 'Not enough gold'
      return
    }
    side.value = betSide
    placed.value = true
    const target = betSide === 'a' ? pair.value[0] : pair.value[1]
    message.value = `Bet ${amount} gold on ${target.username}`
    useQuestStore().progress('bet', 1)
  }

  function settle(winner: MatchWinner): void {
    if (!placed.value || !side.value) {
      return
    }
    if (isBetWon(side.value, winner)) {
      const payout = betPayout(stake.value)
      const player = usePlayerStore()
      player.grantReward(payout, 0)
      void player.save()
      message.value = `Won +${payout} gold`
    } else {
      message.value = `Lost bet -${stake.value} gold`
    }
    placed.value = false
    side.value = null
  }

  function tickViewers(): void {
    viewers.value = driftViewers(viewers.value, Math.random)
  }

  function exit(): void {
    active.value = false
    pair.value = null
  }

  return {
    pool,
    pair,
    viewers,
    stakeIndex,
    side,
    placed,
    message,
    active,
    stake,
    begin,
    nextMatch,
    cycleStake,
    placeBet,
    settle,
    tickViewers,
    exit,
  }
})
