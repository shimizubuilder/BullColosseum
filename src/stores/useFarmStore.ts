import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchFarms, type FarmInfo } from '@/services/repositories/FarmRepository'
import { usePlayerStore } from './usePlayerStore'
import { useSessionStore } from './useSessionStore'

export const useFarmStore = defineStore('farm', () => {
  const farmsByPlot = ref<Record<number, FarmInfo>>({})
  const selectedPlot = ref<number | null>(null)

  async function load(): Promise<void> {
    const player = usePlayerStore()
    const session = useSessionStore()
    const account = player.player
    farmsByPlot.value = await fetchFarms(
      {
        plotIndex: account?.farm.plotIndex ?? null,
        username: account?.account.username ?? 'You',
        avatar: account?.account.avatar ?? 'ansem',
        capacity: account?.farm.capacity ?? 2,
        bullsInPen: account?.storedBulls.length ?? 0,
      },
      session.online,
    )
  }

  function selectPlot(index: number): void {
    selectedPlot.value = index
  }

  return { farmsByPlot, selectedPlot, load, selectPlot }
})
