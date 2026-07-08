import type { StatKey } from '@/domain/models/stats'

export type ElementId = 'fire' | 'bolt' | 'shadow'

export interface ElementDefinition {
  id: ElementId
  name: string
  statBonus: StatKey
  primaryColor: string
  secondaryColor: string
  description: string
}

export const ELEMENTS: Record<ElementId, ElementDefinition> = {
  fire: {
    id: 'fire',
    name: 'Fire',
    statBonus: 'power',
    primaryColor: '#ff5a1f',
    secondaryColor: '#ffb43a',
    description: '+Power',
  },
  bolt: {
    id: 'bolt',
    name: 'Lightning',
    statBonus: 'speed',
    primaryColor: '#3fc9ff',
    secondaryColor: '#d6f4ff',
    description: '+Speed',
  },
  shadow: {
    id: 'shadow',
    name: 'Shadow',
    statBonus: 'defense',
    primaryColor: '#a35bff',
    secondaryColor: '#d9b3ff',
    description: '+Defense',
  },
}

export const ELEMENT_IDS: ElementId[] = ['fire', 'bolt', 'shadow']
