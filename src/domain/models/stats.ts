export type StatKey = 'power' | 'defense' | 'speed' | 'stamina'

export interface CombatStats {
  power: number
  defense: number
  speed: number
  stamina: number
}

export interface BullStatline extends CombatStats {
  tier: number
  mythic: boolean
}
