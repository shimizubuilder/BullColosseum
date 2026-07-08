export function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}
