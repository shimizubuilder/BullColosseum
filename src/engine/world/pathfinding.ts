import type { MapDefinition } from '@/domain/maps/mapTypes'
import type { Point } from '@/engine/iso/isoMath'

export interface BlockedGrid {
  cell: number
  cols: number
  rows: number
  blocked: Uint8Array
}

export function buildBlockedGrid(map: MapDefinition, cell = 40): BlockedGrid {
  const cols = Math.ceil(map.width / cell)
  const rows = Math.ceil(map.height / cell)
  const blocked = new Uint8Array(cols * rows)
  for (const building of map.buildings) {
    const centerY = building.y - building.depth * 0.05
    const halfWidth = building.width / 2 + 20
    const halfDepth = building.depth * 0.42 + 20
    const x0 = Math.max(0, Math.floor((building.x - halfWidth) / cell))
    const x1 = Math.min(cols - 1, Math.floor((building.x + halfWidth) / cell))
    const y0 = Math.max(0, Math.floor((centerY - halfDepth) / cell))
    const y1 = Math.min(rows - 1, Math.floor((centerY + halfDepth) / cell))
    for (let gy = y0; gy <= y1; gy += 1) {
      for (let gx = x0; gx <= x1; gx += 1) {
        blocked[gy * cols + gx] = 1
      }
    }
  }
  return { cell, cols, rows, blocked }
}

function cellBlocked(grid: BlockedGrid, gx: number, gy: number): boolean {
  return gx < 0 || gy < 0 || gx >= grid.cols || gy >= grid.rows || grid.blocked[gy * grid.cols + gx] === 1
}

export function lineClear(grid: BlockedGrid, ax: number, ay: number, bx: number, by: number): boolean {
  const distance = Math.hypot(bx - ax, by - ay)
  const steps = Math.max(1, Math.ceil(distance / (grid.cell * 0.5)))
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const x = ax + (bx - ax) * t
    const y = ay + (by - ay) * t
    if (cellBlocked(grid, Math.floor(x / grid.cell), Math.floor(y / grid.cell))) {
      return false
    }
  }
  return true
}

function nearestFree(grid: BlockedGrid, gx: number, gy: number): [number, number] {
  if (!cellBlocked(grid, gx, gy)) {
    return [gx, gy]
  }
  for (let radius = 1; radius < 10; radius += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) {
          continue
        }
        if (!cellBlocked(grid, gx + dx, gy + dy)) {
          return [gx + dx, gy + dy]
        }
      }
    }
  }
  return [gx, gy]
}

const NEIGHBORS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

export function findPath(grid: BlockedGrid, sx: number, sy: number, tx: number, ty: number): Point[] {
  const key = (x: number, y: number): number => y * grid.cols + x
  const startCell = cellBlocked(grid, Math.floor(sx / grid.cell), Math.floor(sy / grid.cell))
    ? nearestFree(grid, Math.floor(sx / grid.cell), Math.floor(sy / grid.cell))
    : [Math.floor(sx / grid.cell), Math.floor(sy / grid.cell)]
  const targetCell = nearestFree(grid, Math.floor(tx / grid.cell), Math.floor(ty / grid.cell))
  const goal = key(targetCell[0], targetCell[1])
  const startKey = key(startCell[0], startCell[1])
  const heuristic = (x: number, y: number): number => Math.hypot(x - targetCell[0], y - targetCell[1])
  const cost: Record<number, number> = { [startKey]: 0 }
  const cameFrom: Record<number, number> = {}
  const open = [{ x: startCell[0], y: startCell[1], f: heuristic(startCell[0], startCell[1]) }]
  const inOpen: Record<number, number> = { [startKey]: 1 }
  let found = false
  let guard = 0
  while (open.length && guard++ < 9000) {
    let best = 0
    for (let i = 1; i < open.length; i += 1) {
      if (open[i].f < open[best].f) {
        best = i
      }
    }
    const current = open.splice(best, 1)[0]
    const currentKey = key(current.x, current.y)
    inOpen[currentKey] = 0
    if (currentKey === goal) {
      found = true
      break
    }
    for (const [dx, dy] of NEIGHBORS) {
      const nx = current.x + dx
      const ny = current.y + dy
      if (cellBlocked(grid, nx, ny)) {
        continue
      }
      if (dx && dy && (cellBlocked(grid, current.x + dx, current.y) || cellBlocked(grid, current.x, current.y + dy))) {
        continue
      }
      const nextCost = cost[currentKey] + (dx && dy ? 1.414 : 1)
      const neighborKey = key(nx, ny)
      if (cost[neighborKey] === undefined || nextCost < cost[neighborKey]) {
        cost[neighborKey] = nextCost
        cameFrom[neighborKey] = currentKey
        if (!inOpen[neighborKey]) {
          open.push({ x: nx, y: ny, f: nextCost + heuristic(nx, ny) })
          inOpen[neighborKey] = 1
        }
      }
    }
  }
  if (!found) {
    return [{ x: tx, y: ty }]
  }
  const cells: Point[] = []
  let cursor: number | undefined = goal
  while (cursor !== undefined && cursor !== startKey) {
    const cx = cursor % grid.cols
    cells.push({ x: cx * grid.cell + grid.cell / 2, y: ((cursor - cx) / grid.cols) * grid.cell + grid.cell / 2 })
    cursor = cameFrom[cursor]
  }
  cells.reverse()
  cells.push({ x: tx, y: ty })
  const smoothed: Point[] = []
  let fromX = sx
  let fromY = sy
  let i = 0
  while (i < cells.length) {
    let j = cells.length - 1
    while (j > i) {
      if (lineClear(grid, fromX, fromY, cells[j].x, cells[j].y)) {
        break
      }
      j -= 1
    }
    smoothed.push(cells[j])
    fromX = cells[j].x
    fromY = cells[j].y
    i = j + 1
  }
  return smoothed
}

export function computePath(
  map: MapDefinition,
  grid: BlockedGrid,
  sx: number,
  sy: number,
  tx: number,
  ty: number,
): Point[] {
  if (lineClear(grid, sx, sy, tx, ty)) {
    return [{ x: tx, y: ty }]
  }
  return findPath(grid, sx, sy, tx, ty)
}
