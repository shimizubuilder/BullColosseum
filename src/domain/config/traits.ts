import type { CombatStats } from '@/domain/models/stats'

export type TraitId = 'golden_horn' | 'rage' | 'alpha' | 'swift' | 'ironhide' | 'bloodline'

export interface TraitDefinition {
  id: TraitId
  name: string
  rare: boolean
  stats: Partial<CombatStats>
  color: string
  description: string
}

export const TRAITS: Record<TraitId, TraitDefinition> = {
  golden_horn: {
    id: 'golden_horn',
    name: 'Golden Horn',
    rare: true,
    stats: { power: 4 },
    color: '#ffcf4a',
    description: 'Golden horns · +4 Power',
  },
  rage: {
    id: 'rage',
    name: 'Rage',
    rare: true,
    stats: { power: 7, defense: -2 },
    color: '#e23b47',
    description: 'Fury · +7 Power, -2 Defense',
  },
  alpha: {
    id: 'alpha',
    name: 'Alpha',
    rare: true,
    stats: { power: 3, defense: 3, speed: 2, stamina: 3 },
    color: '#a35bff',
    description: 'Alpha bloodline · +all stats',
  },
  swift: {
    id: 'swift',
    name: 'Swift',
    rare: false,
    stats: { speed: 6 },
    color: '#3fc9ff',
    description: '+6 Speed',
  },
  ironhide: {
    id: 'ironhide',
    name: 'Ironhide',
    rare: false,
    stats: { defense: 7 },
    color: '#c9d2dd',
    description: '+7 Defense',
  },
  bloodline: {
    id: 'bloodline',
    name: 'Bloodline',
    rare: false,
    stats: { stamina: 7 },
    color: '#8affc0',
    description: '+7 Stamina',
  },
}

export const RARE_TRAITS: TraitId[] = ['golden_horn', 'rage', 'alpha']
export const COMMON_TRAITS: TraitId[] = ['swift', 'ironhide', 'bloodline']

export function findTrait(id: string): TraitDefinition | undefined {
  return Object.prototype.hasOwnProperty.call(TRAITS, id) ? TRAITS[id as TraitId] : undefined
}
