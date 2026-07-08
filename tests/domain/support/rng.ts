import type { Rng } from '@/domain/rng'

export function sequenceRng(values: number[]): Rng {
  let index = 0
  return () => {
    const value = values[index] ?? 0
    index += 1
    return value
  }
}

export function constantRng(value: number): Rng {
  return () => value
}

export function seededRng(seed: number): Rng {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
