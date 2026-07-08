export type Rng = () => number

export function randomRange(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min)
}

export function randomInt(rng: Rng, maxExclusive: number): number {
  return Math.floor(rng() * maxExclusive)
}

export function rollChance(rng: Rng, probability: number): boolean {
  return rng() < probability
}

export function pickFrom<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}
