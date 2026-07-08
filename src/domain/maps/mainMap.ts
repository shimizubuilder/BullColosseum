import type { BuildingDef, MapDefinition, PortalDef, PropDef, PropKind } from './mapTypes'

const BUILDINGS: BuildingDef[] = [
  { key: 'colosseum', x: 1500, y: 950, width: 440, depth: 330, height: 82, color: '#7a6047', roof: '#a07a52', icon: '⚔', label: 'COLOSSEUM' },
  { key: 'stable', x: 620, y: 720, width: 210, depth: 180, height: 108, color: '#6b4a2e', roof: '#a06a38', icon: '🐂', label: 'STABLE' },
  { key: 'shop', x: 2380, y: 740, width: 200, depth: 180, height: 108, color: '#2f5f8a', roof: '#3f8bc0', icon: '🛡️', label: 'GEAR SHOP' },
  { key: 'vault', x: 700, y: 1500, width: 200, depth: 180, height: 108, color: '#8a742f', roof: '#c0a53f', icon: '🏦', label: 'GOLD VAULT' },
  { key: 'leaderboard', x: 2320, y: 1500, width: 190, depth: 170, height: 104, color: '#5a2f8a', roof: '#8b4fc0', icon: '🏆', label: 'RANKINGS' },
  { key: 'quests', x: 960, y: 1900, width: 190, depth: 160, height: 100, color: '#2f8a5a', roof: '#3fbf7f', icon: '📋', label: 'QUEST BOARD' },
]

const PORTALS: PortalDef[] = [{ target: 'farm', x: 2150, y: 1950, size: 88, label: 'FARM ISLAND' }]

const PROP_KINDS: PropKind[] = ['tree', 'tree', 'rock', 'bush', 'tree']

function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function scatterProps(width: number, height: number, count: number, buildings: BuildingDef[]): PropDef[] {
  const random = seededRandom(0x51a17)
  const props: PropDef[] = []
  for (let index = 0; index < count; index += 1) {
    let x = 0
    let y = 0
    let clear = false
    let attempts = 0
    while (!clear && attempts < 40) {
      x = 120 + random() * (width - 240)
      y = 120 + random() * (height - 240)
      clear = buildings.every((b) => Math.abs(x - b.x) >= b.width / 2 + 70 || Math.abs(y - b.y) >= b.depth / 2 + 70)
      attempts += 1
    }
    props.push({ x, y, kind: PROP_KINDS[(index * 7) % PROP_KINDS.length] })
  }
  return props
}

export const MAIN_MAP: MapDefinition = {
  width: 3000,
  height: 2200,
  spawn: { x: 1500, y: 1950 },
  ground: 'grass',
  buildings: BUILDINGS,
  plots: [],
  portals: PORTALS,
  props: scatterProps(3000, 2200, 44, BUILDINGS),
}
