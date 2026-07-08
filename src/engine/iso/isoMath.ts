export const ISO = 0.62

export interface Point {
  x: number
  y: number
}

export function worldToIso(worldX: number, worldY: number): Point {
  return { x: (worldX - worldY) * ISO, y: (worldX + worldY) * 0.5 * ISO }
}

export function isoToWorld(isoX: number, isoY: number): Point {
  return { x: (2 * isoY + isoX) / (2 * ISO), y: (2 * isoY - isoX) / (2 * ISO) }
}

export interface IsoBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export function isoBounds(width: number, height: number): IsoBounds {
  const corners = [worldToIso(0, 0), worldToIso(width, 0), worldToIso(0, height), worldToIso(width, height)]
  const xs = corners.map((corner) => corner.x)
  const ys = corners.map((corner) => corner.y)
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
}
