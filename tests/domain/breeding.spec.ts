import { describe, expect, it } from 'vitest'
import { breedOffspring } from '@/domain/breeding'
import { sequenceRng } from './support/rng'

describe('breedOffspring', () => {
  it('follows the legacy random-call order to a deterministic calf', () => {
    const rng = sequenceRng([0.9, 0.1, 0.9, 0.9, 0.5])
    const calf = breedOffspring(
      { element: 'fire', traits: ['alpha'], mythic: false },
      { element: 'shadow', traits: [], mythic: false },
      rng,
    )
    expect(calf).toEqual({
      name: 'Calf 46',
      element: 'shadow',
      level: 1,
      xp: 0,
      gear: [],
      traits: ['alpha'],
      mythic: false,
    })
  })

  it('raises the mythic chance from a mythic parent and grants a rare trait', () => {
    const rng = sequenceRng([0.1, 0.9, 0.0, 0.0, 0.5])
    const calf = breedOffspring(
      { element: 'fire', traits: [], mythic: true },
      { element: 'shadow', traits: [], mythic: false },
      rng,
    )
    expect(calf.mythic).toBe(true)
    expect(calf.traits).toContain('golden_horn')
  })

  it('caps inherited traits at the configured maximum', () => {
    const rng = sequenceRng([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
    const calf = breedOffspring(
      { element: 'fire', traits: ['golden_horn', 'rage', 'alpha'], mythic: false },
      { element: 'shadow', traits: ['swift', 'ironhide'], mythic: false },
      rng,
    )
    expect(calf.traits.length).toBeLessThanOrEqual(3)
  })
})
