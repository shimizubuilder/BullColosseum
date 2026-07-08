import { describe, expect, it } from 'vitest'
import {
  applyQuestProgress,
  claimQuest,
  claimableQuestCount,
  formatQuestDescription,
  rollDailyQuests,
} from '@/domain/quests'
import { sequenceRng } from './support/rng'

describe('rollDailyQuests', () => {
  it('draws three distinct quests without replacement', () => {
    const quests = rollDailyQuests(sequenceRng([0, 0, 0]))
    expect(quests.map((quest) => quest.id)).toEqual(['win3', 'win5', 'breed1'])
    expect(quests.every((quest) => quest.progress === 0 && !quest.claimed)).toBe(true)
  })
})

describe('applyQuestProgress', () => {
  it('advances matching quests without exceeding the target', () => {
    const quests = rollDailyQuests(sequenceRng([0, 0, 0]))
    const advanced = applyQuestProgress(quests, 'win', 2)
    expect(advanced.find((quest) => quest.id === 'win3')?.progress).toBe(2)
    expect(advanced.find((quest) => quest.id === 'win5')?.progress).toBe(2)
    expect(advanced.find((quest) => quest.id === 'breed1')?.progress).toBe(0)

    const capped = applyQuestProgress(advanced, 'win', 10)
    expect(capped.find((quest) => quest.id === 'win3')?.progress).toBe(3)
  })
})

describe('claim flow', () => {
  it('claims a completed quest exactly once and returns its reward', () => {
    let quests = rollDailyQuests(sequenceRng([0, 0, 0]))
    quests = applyQuestProgress(quests, 'win', 3)
    expect(claimableQuestCount(quests)).toBe(1)

    const firstClaim = claimQuest(quests, 'win3')
    expect(firstClaim.reward).toEqual({ gold: 90 })
    expect(claimableQuestCount(firstClaim.quests)).toBe(0)

    const secondClaim = claimQuest(firstClaim.quests, 'win3')
    expect(secondClaim.reward).toBeNull()
  })
})

describe('formatQuestDescription', () => {
  it('substitutes the target count', () => {
    expect(formatQuestDescription({ id: 'win3', type: 'win', target: 3, descriptionTemplate: 'Win {count} ranked duels', reward: { gold: 90 } })).toBe(
      'Win 3 ranked duels',
    )
  })
})
