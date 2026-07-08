import { SPECTATE } from '@/domain/config/balance'
import { randomInt, type Rng } from '@/domain/rng'
import type { SpectateEntry } from '@/domain/combat/matchmaking'

export type SpectatePair = [SpectateEntry, SpectateEntry]

export function pickSpectatePair(pool: SpectateEntry[], rng: Rng): SpectatePair | null {
  if (pool.length < 2) {
    return null
  }
  const top = pool.slice(0, Math.min(SPECTATE.topPoolSize, pool.length))
  const first = randomInt(rng, top.length)
  let second = randomInt(rng, top.length)
  if (second === first) {
    second = (second + 1) % top.length
  }
  return [top[first], top[second]]
}

export function initialViewers(rng: Rng): number {
  return SPECTATE.viewersBase + randomInt(rng, SPECTATE.viewersRange)
}

export function driftViewers(current: number, rng: Rng): number {
  return Math.max(SPECTATE.viewersMin, current + randomInt(rng, SPECTATE.viewersDriftRange) - SPECTATE.viewersDriftBias)
}
