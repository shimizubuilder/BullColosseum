import type { MapDefinition, PathDef, PlotDef, PortalDef, PropDef, PropKind } from './mapTypes'

const PLOT_COLUMNS = 5
const PLOT_ROWS = 4
const PLOT_ORIGIN_X = 360
const PLOT_ORIGIN_Y = 360
const PLOT_STEP_X = 445
const PLOT_STEP_Y = 380
const PLOT_WIDTH = 250
const PLOT_DEPTH = 200

const PROP_KINDS: PropKind[] = ['hay', 'bush', 'rock']

function buildPlots(): PlotDef[] {
  const plots: PlotDef[] = []
  let index = 0
  for (let row = 0; row < PLOT_ROWS; row += 1) {
    for (let column = 0; column < PLOT_COLUMNS; column += 1) {
      plots.push({
        index,
        x: PLOT_ORIGIN_X + column * PLOT_STEP_X,
        y: PLOT_ORIGIN_Y + row * PLOT_STEP_Y,
        width: PLOT_WIDTH,
        depth: PLOT_DEPTH,
      })
      index += 1
    }
  }
  return plots
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function scatterProps(width: number, height: number, count: number, plots: PlotDef[]): PropDef[] {
  const random = seededRandom(0xfa27)
  const props: PropDef[] = []
  for (let index = 0; index < count; index += 1) {
    let x = 0
    let y = 0
    let clear = false
    let attempts = 0
    while (!clear && attempts < 40) {
      x = 120 + random() * (width - 240)
      y = 120 + random() * (height - 240)
      clear = plots.every((plot) => Math.abs(x - plot.x) >= plot.width / 2 + 60 || Math.abs(y - plot.y) >= plot.depth / 2 + 60)
      attempts += 1
    }
    props.push({ x, y, kind: PROP_KINDS[(index * 5) % PROP_KINDS.length] })
  }
  return props
}

const PLOTS = buildPlots()

const PORTALS: PortalDef[] = [{ target: 'main', x: 1300, y: 1900, size: 88, label: 'MAIN PORTAL' }]

const LANES: PathDef[] = [
  { points: [{ x: 1300, y: 2000 }, { x: 1300, y: 200 }], width: 200 },
  { points: [{ x: 200, y: 1100 }, { x: 2400, y: 1100 }], width: 200 },
]

export const FARM_MAP: MapDefinition = {
  width: 2600,
  height: 2000,
  spawn: { x: 1300, y: 1830 },
  ground: 'farm',
  buildings: [],
  plots: PLOTS,
  portals: PORTALS,
  props: scatterProps(2600, 2000, 34, PLOTS),
  paths: LANES,
}
