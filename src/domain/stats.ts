import type { Bull } from '@/domain/models/bull'
import type { BullStatline, CombatStats } from '@/domain/models/stats'
import { ELEMENTS } from '@/domain/config/elements'
import { findGear } from '@/domain/config/gear'
import { findTrait } from '@/domain/config/traits'
import { ELEMENT_STAT_BONUS, MYTHIC_MULTIPLIER, STAT_FORMULA, WIN_WIDTH } from '@/domain/config/balance'
import { clamp } from '@/domain/math'
import { tierOf } from '@/domain/progression'

export interface StatsInput {
  level: number
  element: Bull['element']
  gear?: Bull['gear']
  traits?: Bull['traits']
  mythic?: boolean
}

export function statsOf(bull: StatsInput): BullStatline {
  const tier = tierOf(bull.level)
  const stats: CombatStats = {
    power: STAT_FORMULA.power.base + bull.level * STAT_FORMULA.power.perLevel + tier * STAT_FORMULA.power.perTier,
    defense: STAT_FORMULA.defense.base + bull.level * STAT_FORMULA.defense.perLevel + tier * STAT_FORMULA.defense.perTier,
    speed: STAT_FORMULA.speed.base + bull.level * STAT_FORMULA.speed.perLevel + tier * STAT_FORMULA.speed.perTier,
    stamina: STAT_FORMULA.stamina.base + bull.level * STAT_FORMULA.stamina.perLevel + tier * STAT_FORMULA.stamina.perTier,
  }

  const elementBonus = ELEMENTS[bull.element].statBonus
  if (elementBonus === 'power' || elementBonus === 'defense' || elementBonus === 'speed') {
    stats[elementBonus] += ELEMENT_STAT_BONUS
  }

  for (const gearId of bull.gear ?? []) {
    const gear = findGear(gearId)
    if (gear) {
      addStats(stats, gear.stats)
    }
  }

  for (const traitId of bull.traits ?? []) {
    const trait = findTrait(traitId)
    if (trait) {
      addStats(stats, trait.stats)
    }
  }

  if (bull.mythic) {
    stats.power *= MYTHIC_MULTIPLIER.power
    stats.defense *= MYTHIC_MULTIPLIER.defense
    stats.speed *= MYTHIC_MULTIPLIER.speed
    stats.stamina *= MYTHIC_MULTIPLIER.stamina
  }

  return {
    power: Math.max(1, Math.round(stats.power)),
    defense: Math.max(1, Math.round(stats.defense)),
    speed: Math.max(1, Math.round(stats.speed)),
    stamina: Math.max(1, Math.round(stats.stamina)),
    tier,
    mythic: Boolean(bull.mythic),
  }
}

function addStats(target: CombatStats, delta: Partial<CombatStats>): void {
  target.power += delta.power ?? 0
  target.defense += delta.defense ?? 0
  target.speed += delta.speed ?? 0
  target.stamina += delta.stamina ?? 0
}

export function winWidth(statline: BullStatline): number {
  return clamp(
    WIN_WIDTH.base + statline.tier * WIN_WIDTH.perTier + statline.speed * WIN_WIDTH.perSpeed,
    WIN_WIDTH.min,
    WIN_WIDTH.max,
  )
}
