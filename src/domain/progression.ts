import { TIERS } from '@/domain/config/tiers'
import { XP_FOR_NEXT } from '@/domain/config/balance'

export function tierOf(level: number): number {
  let tier = 0
  for (let index = 0; index < TIERS.length; index += 1) {
    if (level >= TIERS[index].minLevel) {
      tier = index
    }
  }
  return tier
}

export function xpForNext(level: number): number {
  return XP_FOR_NEXT.base + level * XP_FOR_NEXT.perLevel
}

export interface XpGain {
  level: number
  xp: number
  levelsGained: number
  tierBefore: number
  tierAfter: number
}

export function applyXp(level: number, xp: number, amount: number): XpGain {
  const tierBefore = tierOf(level)
  let nextLevel = level
  let remainingXp = xp + amount
  let levelsGained = 0
  while (remainingXp >= xpForNext(nextLevel)) {
    remainingXp -= xpForNext(nextLevel)
    nextLevel += 1
    levelsGained += 1
  }
  return {
    level: nextLevel,
    xp: remainingXp,
    levelsGained,
    tierBefore,
    tierAfter: tierOf(nextLevel),
  }
}
