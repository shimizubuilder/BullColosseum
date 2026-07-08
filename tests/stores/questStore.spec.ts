import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useQuestStore } from '@/stores/useQuestStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { createLocalPlayer } from '@/services/offline/OfflineOracle'
import { constantRng } from '../domain/support/rng'

const input = { username: 'Ansem', avatar: 'red', bullName: 'Toro', element: 'fire' }

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useQuestStore', () => {
  it('rolls three daily quests on a new date', () => {
    const quest = useQuestStore()
    quest.ensureDaily('2026-07-08', constantRng(0))
    expect(quest.dailyList).toHaveLength(3)
    expect(quest.resetDate).toBe('2026-07-08')
  })

  it('does not re-roll on the same date', () => {
    const quest = useQuestStore()
    quest.ensureDaily('2026-07-08', constantRng(0))
    const first = quest.dailyList
    quest.ensureDaily('2026-07-08', constantRng(0))
    expect(quest.dailyList).toBe(first)
  })

  it('claims a completed quest, grants its reward, and cannot claim twice', () => {
    const player = usePlayerStore()
    player.setPlayer(createLocalPlayer(input, 'local-x'))
    const quest = useQuestStore()
    quest.ensureDaily('2026-07-08', constantRng(0))

    const breedQuest = quest.dailyList.find((item) => item.type === 'breed')
    expect(breedQuest).toBeDefined()
    if (!breedQuest) {
      return
    }

    quest.progress('breed', 1)
    const goldBefore = player.player?.currency.gold ?? 0
    expect(quest.claim(breedQuest.id)).toBe(true)
    expect(player.player?.currency.gold).toBe(goldBefore + breedQuest.reward.gold)
    expect(quest.claim(breedQuest.id)).toBe(false)
  })
})
