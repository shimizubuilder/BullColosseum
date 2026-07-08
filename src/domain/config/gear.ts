import type { CombatStats } from '@/domain/models/stats'

export type GearId = 'iron_horn' | 'blaze_horn' | 'chest_plate' | 'war_crown'
export type GearSlot = 'horn' | 'chest' | 'head'
export type CurrencyId = 'gold' | 'token'

export interface GearDefinition {
  id: GearId
  name: string
  slot: GearSlot
  cost: number
  currency: CurrencyId
  stats: Partial<CombatStats>
  description: string
}

export const GEAR: GearDefinition[] = [
  {
    id: 'iron_horn',
    name: 'Iron Horns',
    slot: 'horn',
    cost: 80,
    currency: 'gold',
    stats: { power: 3 },
    description: 'Metal horns. +3 Power.',
  },
  {
    id: 'blaze_horn',
    name: 'Blaze Horns',
    slot: 'horn',
    cost: 180,
    currency: 'gold',
    stats: { power: 5, speed: 1 },
    description: 'Flaming horns. +5 Power.',
  },
  {
    id: 'chest_plate',
    name: 'Chest Plate',
    slot: 'chest',
    cost: 120,
    currency: 'gold',
    stats: { defense: 5 },
    description: 'Chest guard. +5 Defense.',
  },
  {
    id: 'war_crown',
    name: 'War Crown',
    slot: 'head',
    cost: 5,
    currency: 'token',
    stats: { defense: 4, power: 4 },
    description: 'Legendary. Gated by holding $CHARGE.',
  },
]

export function findGear(id: string): GearDefinition | undefined {
  return GEAR.find((gear) => gear.id === id)
}
