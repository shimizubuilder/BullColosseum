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

export type PropKind = 'tree' | 'rock' | 'bush' | 'hay'

export interface PropDef {
  x: number
  y: number
  kind: PropKind
}

export interface PlotDef {
  index: number
  x: number
  y: number
  width: number
  depth: number
}

export type GroundStyle = 'grass' | 'farm'

export interface PathDef {
  points: { x: number; y: number }[]
  width: number
}

export interface RingDef {
  cx: number
  cy: number
  rx: number
  ry: number
  band: number
}

export interface MapDefinition {
  width: number
  height: number
  spawn: { x: number; y: number }
  ground: GroundStyle
  buildings: BuildingDef[]
  plots: PlotDef[]
  portals: PortalDef[]
  props: PropDef[]
  paths?: PathDef[]
  ring?: RingDef
}
