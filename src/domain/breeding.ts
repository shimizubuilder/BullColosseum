import type { Bull } from '@/domain/models/bull'
import type { ElementId } from '@/domain/config/elements'
import type { TraitId } from '@/domain/config/traits'
import { COMMON_TRAITS, RARE_TRAITS } from '@/domain/config/traits'
import { BREEDING } from '@/domain/config/balance'
import { pickFrom, randomInt, rollChance, type Rng } from '@/domain/rng'

export type BreedingParent = Pick<Bull, 'element' | 'traits' | 'mythic'>

export function breedOffspring(first: BreedingParent, second: BreedingParent, rng: Rng): Bull {
  const element: ElementId = rollChance(rng, BREEDING.elementFromFirstChance) ? first.element : second.element

  const traits = new Set<TraitId>()
  for (const parent of [first, second]) {
    for (const trait of parent.traits) {
      if (rollChance(rng, BREEDING.traitInheritChance)) {
        traits.add(trait)
      }
    }
  }

  if (rollChance(rng, BREEDING.extraTraitChance)) {
    const pool = rollChance(rng, BREEDING.extraTraitRareChance) ? RARE_TRAITS : COMMON_TRAITS
    traits.add(pickFrom(rng, pool))
  }

  let mythicChance = BREEDING.mythicBase
  if (first.mythic || second.mythic) {
    mythicChance += BREEDING.mythicParentBonus
  }
  if (first.traits.includes('alpha') || second.traits.includes('alpha')) {
    mythicChance += BREEDING.mythicAlphaBonus
  }
  const mythic = rollChance(rng, mythicChance)
  if (mythic) {
    traits.add(pickFrom(rng, RARE_TRAITS))
  }

  return {
    name: `Calf ${1 + randomInt(rng, 90)}`,
    element,
    level: 1,
    xp: 0,
    gear: [],
    traits: Array.from(traits).slice(0, BREEDING.maxTraits),
    mythic,
  }
}
