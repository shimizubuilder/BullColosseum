import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  claimableQuestCount,
  claimQuest,
  applyQuestProgress,
  rollDailyQuests,
  type Quest,
  type QuestType,
} from '@/domain/quests'
import type { Rng } from '@/domain/rng'
import type { PersistedQuests } from '@/services/offline/saveSchema'
import { usePlayerStore } from './usePlayerStore'

export function currentDateKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}

export const useQuestStore = defineStore('quest', () => {
  const dailyList = ref<Quest[]>([])
  const resetDate = ref('')

  const claimable = computed(() => claimableQuestCount(dailyList.value))

  function ensureDaily(today: string, rng: Rng = Math.random): void {
    if (resetDate.value === today && dailyList.value.length > 0) {
      return
    }
    resetDate.value = today
    dailyList.value = rollDailyQuests(rng)
  }

  function progress(type: QuestType, amount: number): void {
    dailyList.value = applyQuestProgress(dailyList.value, type, amount)
  }

  function claim(id: string): boolean {
    const result = claimQuest(dailyList.value, id)
    if (!result.reward) {
      return false
    }
    dailyList.value = result.quests
    usePlayerStore().grantReward(result.reward.gold, result.reward.token ?? 0)
    return true
  }

  function hydrate(state: PersistedQuests): void {
    resetDate.value = state.resetDate
    dailyList.value = state.dailyList
  }

  function snapshot(): PersistedQuests {
    return { resetDate: resetDate.value, dailyList: dailyList.value }
  }

  return { dailyList, resetDate, claimable, ensureDaily, progress, claim, hydrate, snapshot }
})
