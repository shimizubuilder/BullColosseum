export type BuildingKey = 'colosseum' | 'stable' | 'shop' | 'vault' | 'leaderboard' | 'quests'

export interface BuildingDef {
  key: BuildingKey
  x: number
  y: number
  width: number
  depth: number
  height: number
  color: string
  roof: string
  icon: string
  label: string
}

export interface PortalDef {
  target: 'farm' | 'main'
  x: number
  y: number
  size: number
  label: string
}

export type PropKind = 'tree' | 'rock' | 'bush'

export interface PropDef {
  x: number
  y: number
  kind: PropKind
}

export interface MapDefinition {
  width: number
  height: number
  spawn: { x: number; y: number }
  buildings: BuildingDef[]
  portals: PortalDef[]
  props: PropDef[]
}
