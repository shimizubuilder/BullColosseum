export type DivisionIconKey = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'gladiator' | 'emperor'

export interface DivisionDefinition {
  name: string
  minRating: number
  color: string
  iconKey: DivisionIconKey
}

export const DIVISIONS: DivisionDefinition[] = [
  { name: 'Bronze', minRating: 0, color: '#c07a3a', iconKey: 'bronze' },
  { name: 'Silver', minRating: 1100, color: '#c9d2dd', iconKey: 'silver' },
  { name: 'Gold', minRating: 1250, color: '#ffcf4a', iconKey: 'gold' },
  { name: 'Platinum', minRating: 1400, color: '#8affe0', iconKey: 'platinum' },
  { name: 'Diamond', minRating: 1550, color: '#5bd6ff', iconKey: 'diamond' },
  { name: 'Gladiator', minRating: 1750, color: '#ff7a3a', iconKey: 'gladiator' },
  { name: 'Emperor', minRating: 2000, color: '#ff4a6a', iconKey: 'emperor' },
]
