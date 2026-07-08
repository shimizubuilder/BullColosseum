import { randomInt, type Rng } from '@/domain/rng'

export type QuestType = 'win' | 'breed' | 'collect' | 'bet' | 'spectate'

export interface QuestReward {
  gold: number
  token?: number
}

export interface QuestDefinition {
  id: string
  type: QuestType
  target: number
  descriptionTemplate: string
  reward: QuestReward
}

export interface Quest extends QuestDefinition {
  progress: number
  claimed: boolean
}

export const QUEST_POOL: QuestDefinition[] = [
  { id: 'win3', type: 'win', target: 3, descriptionTemplate: 'Win {count} ranked duels', reward: { gold: 90 } },
  { id: 'win5', type: 'win', target: 5, descriptionTemplate: 'Win {count} ranked duels', reward: { gold: 150, token: 1 } },
  { id: 'breed1', type: 'breed', target: 1, descriptionTemplate: 'Breed {count} Bull', reward: { gold: 70 } },
  { id: 'collect2', type: 'collect', target: 2, descriptionTemplate: 'Collect pen earnings {count}×', reward: { gold: 50 } },
  { id: 'bet2', type: 'bet', target: 2, descriptionTemplate: 'Place {count} live bets', reward: { gold: 60 } },
  { id: 'watch1', type: 'spectate', target: 1, descriptionTemplate: 'Watch a live match', reward: { gold: 30 } },
]

export const DAILY_QUEST_COUNT = 3

export function rollDailyQuests(rng: Rng): Quest[] {
  const pool = QUEST_POOL.slice()
  const chosen: Quest[] = []
  for (let index = 0; index < DAILY_QUEST_COUNT && pool.length > 0; index += 1) {
    const [definition] = pool.splice(randomInt(rng, pool.length), 1)
    chosen.push({ ...definition, progress: 0, claimed: false })
  }
  return chosen
}

export function applyQuestProgress(quests: Quest[], type: QuestType, amount: number): Quest[] {
  return quests.map((quest) =>
    quest.type === type && quest.progress < quest.target
      ? { ...quest, progress: Math.min(quest.target, quest.progress + amount) }
      : quest,
  )
}

export function isQuestClaimable(quest: Quest): boolean {
  return !quest.claimed && quest.progress >= quest.target
}

export function claimableQuestCount(quests: Quest[]): number {
  return quests.filter(isQuestClaimable).length
}

export interface QuestClaim {
  quests: Quest[]
  reward: QuestReward | null
}

export function claimQuest(quests: Quest[], id: string): QuestClaim {
  const target = quests.find((quest) => quest.id === id)
  if (!target || !isQuestClaimable(target)) {
    return { quests, reward: null }
  }
  return {
    quests: quests.map((quest) => (quest.id === id ? { ...quest, claimed: true } : quest)),
    reward: target.reward,
  }
}

export function formatQuestDescription(quest: QuestDefinition): string {
  return quest.descriptionTemplate.replace('{count}', String(quest.target))
}
