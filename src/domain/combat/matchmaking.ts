import type { BullStatline } from '@/domain/models/stats'
import type { ElementId } from '@/domain/config/elements'
import type { TraitId } from '@/domain/config/traits'
import { ELEMENT_IDS } from '@/domain/config/elements'
import { COMMON_TRAITS, RARE_TRAITS } from '@/domain/config/traits'
import { TIERS } from '@/domain/config/tiers'
import { MATCHMAKING, SPECTATE, STARTING_RATING } from '@/domain/config/balance'
import { clamp } from '@/domain/math'
import { pickFrom, randomInt, rollChance, type Rng } from '@/domain/rng'
import { tierOf } from '@/domain/progression'
import { statsOf } from '@/domain/stats'

export interface Opponent {
  name: string
  element: ElementId
  level: number
  tier: number
  skill: number
  traits: TraitId[]
  mythic: boolean
  gear: never[]
}

export function createOpponent(playerLevel: number, playerWins: number, rng: Rng): Opponent {
  const tier = clamp(tierOf(playerLevel) + pickFrom(rng, MATCHMAKING.tierOffsets), 0, TIERS.length - 1)
  const level = clamp(
    TIERS[tier].minLevel + randomInt(rng, MATCHMAKING.levelSpread),
    MATCHMAKING.levelMin,
    MATCHMAKING.levelMax,
  )
  const element = pickFrom(rng, ELEMENT_IDS)
  const skill = clamp(
    MATCHMAKING.skillBase +
      Math.min(MATCHMAKING.skillWinCap, playerWins * MATCHMAKING.skillPerWin) +
      tier * MATCHMAKING.skillPerTier,
    MATCHMAKING.skillMin,
    MATCHMAKING.skillMax,
  )

  const traits: TraitId[] = []
  if (rollChance(rng, MATCHMAKING.commonTraitChance)) {
    traits.push(pickFrom(rng, COMMON_TRAITS))
  }
  if (rollChance(rng, MATCHMAKING.rareTraitChance)) {
    traits.push(pickFrom(rng, RARE_TRAITS))
  }
  const mythic = rollChance(rng, MATCHMAKING.mythicChance)
  const baseName = pickFrom(rng, MATCHMAKING.names)

  return {
    name: mythic ? `✦${baseName}` : baseName,
    element,
    level,
    tier,
    skill,
    traits,
    mythic,
    gear: [],
  }
}

export interface SpectateEntry {
  username: string
  rating: number
  tier?: number
}

export interface SpectateFighter {
  name: string
  element: ElementId
  skill: number
  stats: BullStatline
  gear: never[]
}

export function createSpectateFighter(entry: SpectateEntry, rng: Rng): SpectateFighter {
  const tier = entry.tier ?? 0
  const level = clamp(TIERS[tier].minLevel + SPECTATE.fighterLevelOffset, SPECTATE.levelMin, SPECTATE.levelMax)
  const element = pickFrom(rng, ELEMENT_IDS)
  const skill = tournamentFighterSkill(entry.rating || STARTING_RATING)
  return {
    name: entry.username,
    element,
    skill,
    stats: statsOf({ level, element, gear: [], traits: [], mythic: false }),
    gear: [],
  }
}

export function tournamentFighterSkill(rating: number): number {
  return clamp(
    SPECTATE.skillBase + (rating - STARTING_RATING) / SPECTATE.skillRatingDivisor,
    SPECTATE.skillMin,
    SPECTATE.skillMax,
  )
}

export function simulateBracketWinner<T extends { skill: number }>(first: T, second: T, rng: Rng): T {
  return rng() < first.skill / (first.skill + second.skill) ? first : second
}
