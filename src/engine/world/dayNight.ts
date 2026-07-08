export const DAY_LENGTH_SECONDS = 300
export const WEATHER_PERIOD_SECONDS = 100

export interface TintColor {
  r: number
  g: number
  b: number
  a: number
}

export interface TimeOfDay {
  t: number
  daylight: number
  overlay: TintColor
}

interface Keyframe {
  t: number
  color: [number, number, number]
  alpha: number
}

const KEYFRAMES: Keyframe[] = [
  { t: 0.0, color: [8, 10, 34], alpha: 0.55 },
  { t: 0.2, color: [46, 24, 58], alpha: 0.42 },
  { t: 0.27, color: [255, 150, 90], alpha: 0.26 },
  { t: 0.34, color: [0, 0, 0], alpha: 0.0 },
  { t: 0.68, color: [0, 0, 0], alpha: 0.0 },
  { t: 0.75, color: [255, 120, 60], alpha: 0.28 },
  { t: 0.84, color: [36, 20, 64], alpha: 0.44 },
  { t: 1.0, color: [8, 10, 34], alpha: 0.55 },
]

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function timeOfDay(nowMs: number): TimeOfDay {
  const t = ((nowMs / 1000) % DAY_LENGTH_SECONDS) / DAY_LENGTH_SECONDS
  let index = 0
  while (index < KEYFRAMES.length - 1 && KEYFRAMES[index + 1].t <= t) {
    index += 1
  }
  const from = KEYFRAMES[index]
  const to = KEYFRAMES[Math.min(index + 1, KEYFRAMES.length - 1)]
  const span = to.t - from.t || 1
  const f = clamp01((t - from.t) / span)
  const lerp = (a: number, b: number): number => a + (b - a) * f
  return {
    t,
    daylight: 0.5 + 0.5 * Math.cos((t - 0.5) * Math.PI * 2),
    overlay: {
      r: Math.floor(lerp(from.color[0], to.color[0])),
      g: Math.floor(lerp(from.color[1], to.color[1])),
      b: Math.floor(lerp(from.color[2], to.color[2])),
      a: lerp(from.alpha, to.alpha),
    },
  }
}

export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'storm'

export interface Weather {
  type: WeatherType
  intensity: number
}

function hash(seed: number): number {
  let n = seed >>> 0
  n = Math.imul(n, 2654435761) >>> 0
  n ^= n >>> 15
  n = Math.imul(n, 2246822519) >>> 0
  n ^= n >>> 13
  return (n >>> 0) / 4294967295
}

export function weatherNow(nowMs: number): Weather {
  const cycles = nowMs / 1000 / WEATHER_PERIOD_SECONDS
  const roll = hash(Math.floor(cycles))
  const type: WeatherType = roll < 0.5 ? 'clear' : roll < 0.72 ? 'cloudy' : roll < 0.9 ? 'rain' : 'storm'
  const intensity = clamp01(Math.sin((cycles % 1) * Math.PI) * 1.35)
  return { type, intensity }
}
