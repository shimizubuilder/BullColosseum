export interface TierVisual {
  size: number
  aura: number
  armor: number
  eyeColor: string
}

export interface TierDefinition {
  name: string
  minLevel: number
  visual: TierVisual
}

export const TIERS: TierDefinition[] = [
  { name: 'Calf', minLevel: 1, visual: { size: 0.55, aura: 0, armor: 0, eyeColor: '#ffffff' } },
  { name: 'Young Bull', minLevel: 3, visual: { size: 0.72, aura: 0.2, armor: 0, eyeColor: '#ffd27a' } },
  { name: 'Bull', minLevel: 6, visual: { size: 0.9, aura: 0.5, armor: 0, eyeColor: '#ff9a3a' } },
  { name: 'Alpha Bull', minLevel: 10, visual: { size: 1.08, aura: 0.8, armor: 1, eyeColor: '#ff4a4a' } },
  { name: 'The Black Bull', minLevel: 15, visual: { size: 1.3, aura: 1.2, armor: 2, eyeColor: '#ff2a2a' } },
]
