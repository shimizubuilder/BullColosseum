import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TOURNAMENT } from '@/domain/config/balance'
import {
  buildBracket,
  buildFighterPool,
  runBracket,
  tournamentFighter,
  tournamentPayout,
  withPlayer,
  type BracketRound,
  type TournamentEntry,
  type TournamentFighter,
  type TournamentMode,
} from '@/domain/combat/tournament'
import { usePlayerStore } from './usePlayerStore'

export const useTournamentStore = defineStore('tournament', () => {
  const mode = ref<TournamentMode>('practice')
  const fighters = ref<TournamentFighter[]>([])
  const rounds = ref<BracketRound[]>([])
  const pool = ref(0)
  const playerIn = ref(false)
  const running = ref(false)
  const finished = ref(false)
  const champion = ref<TournamentFighter | null>(null)

  function open(nextMode: TournamentMode, entries: TournamentEntry[]): void {
    mode.value = nextMode
    pool.value = TOURNAMENT.modes[nextMode].pool
    playerIn.value = false
    running.value = false
    finished.value = false
    champion.value = null
    fighters.value = buildFighterPool(entries, Math.random)
    rounds.value = buildBracket(fighters.value)
  }

  function join(playerName: string, rating: number): boolean {
    if (running.value || playerIn.value || finished.value) {
      return false
    }
    const entry = TOURNAMENT.modes[mode.value].entry
    const player = usePlayerStore()
    if (!player.chargeGold(entry)) {
      return false
    }
    playerIn.value = true
    pool.value += entry
    fighters.value = withPlayer(fighters.value, tournamentFighter(playerName, rating, true))
    rounds.value = buildBracket(fighters.value)
    return true
  }

  function run(): void {
    if (running.value || finished.value) {
      return
    }
    running.value = true
    const result = runBracket(rounds.value, Math.random)
    rounds.value = result.rounds
    champion.value = result.champion
    running.value = false
    finished.value = true
    const payout = tournamentPayout(pool.value, result.champion)
    if (payout.gold > 0 || payout.token > 0) {
      const player = usePlayerStore()
      player.grantReward(payout.gold, payout.token)
      void player.save()
    }
  }

  return { mode, fighters, rounds, pool, playerIn, running, finished, champion, open, join, run }
})
