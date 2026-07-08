import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MatchReward } from '@/domain/combat/matchReward'

export type DuelContext = 'ranked' | 'practice'

export interface DuelResult {
  won: boolean
  opponentName: string
  reward: MatchReward
  ratingDelta: number
}

export const useDuelStore = defineStore('duel', () => {
  const active = ref(false)
  const context = ref<DuelContext>('ranked')
  const result = ref<DuelResult | null>(null)

  function begin(nextContext: DuelContext): void {
    active.value = true
    context.value = nextContext
    result.value = null
  }

  function finish(outcome: DuelResult): void {
    active.value = false
    result.value = outcome
  }

  function clearResult(): void {
    result.value = null
  }

  return { active, context, result, begin, finish, clearResult }
})
