export interface DivisionDefinition {
  name: string
  minRating: number
  color: string
  icon: string
}

export const DIVISIONS: DivisionDefinition[] = [
  { name: 'Bronze', minRating: 0, color: '#c07a3a', icon: '🥉' },
  { name: 'Silver', minRating: 1100, color: '#c9d2dd', icon: '🥈' },
  { name: 'Gold', minRating: 1250, color: '#ffcf4a', icon: '🥇' },
  { name: 'Platinum', minRating: 1400, color: '#8affe0', icon: '💠' },
  { name: 'Diamond', minRating: 1550, color: '#5bd6ff', icon: '💎' },
  { name: 'Gladiator', minRating: 1750, color: '#ff7a3a', icon: '⚔️' },
  { name: 'Emperor', minRating: 2000, color: '#ff4a6a', icon: '👑' },
]
