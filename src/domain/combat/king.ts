import type { ElementId } from '@/domain/config/elements'
import type { TraitId } from '@/domain/config/traits'
import type { BullStatline } from '@/domain/models/stats'
import { KING } from '@/domain/config/balance'
import { TIERS } from '@/domain/config/tiers'
import { clamp } from '@/domain/math'
import { statsOf } from '@/domain/stats'

export interface KingBull {
  element: ElementId
  level: number
  traits: TraitId[]
  mythic: boolean
}

export interface KingState {
  username: string
  avatar: string
  tier: number
  since: number
  bull: KingBull
  mine: boolean
}

export function kingHoldSeconds(since: number, now: number): number {
  return Math.max(0, now - since)
}

export function kingBounty(since: number, now: number): number {
  return Math.min(KING.bountyCap, Math.floor(kingHoldSeconds(since, now) / 60) * KING.bountyPerMinute)
}

export function kingChallengerSkill(tier: number): number {
  return clamp(
    KING.challengerSkillBase + tier * KING.challengerSkillPerTier,
    KING.challengerSkillMin,
    KING.challengerSkillMax,
  )
}

export function kingChallengerStats(bull: KingBull, tier: number): BullStatline {
  const level = bull.level > 0 ? bull.level : TIERS[tier].minLevel + 2
  return statsOf({ level, element: bull.element, gear: [], traits: bull.traits, mythic: bull.mythic })
}
