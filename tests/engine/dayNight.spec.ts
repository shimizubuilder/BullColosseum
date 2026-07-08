import { describe, expect, it } from 'vitest'
import { DAY_LENGTH_SECONDS, timeOfDay, weatherNow } from '@/engine/world/dayNight'

describe('timeOfDay', () => {
  it('is darkest at the start of the cycle', () => {
    const midnight = timeOfDay(0)
    expect(midnight.t).toBe(0)
    expect(midnight.overlay.a).toBeGreaterThan(0.4)
    expect(midnight.daylight).toBeLessThan(0.1)
  })

  it('is brightest at midday with no overlay tint', () => {
    const noon = timeOfDay(DAY_LENGTH_SECONDS * 1000 * 0.5)
    expect(noon.daylight).toBeGreaterThan(0.9)
    expect(noon.overlay.a).toBeLessThan(0.05)
  })

  it('wraps around after a full day', () => {
    const start = timeOfDay(1000)
    const wrapped = timeOfDay(1000 + DAY_LENGTH_SECONDS * 1000)
    expect(wrapped.t).toBeCloseTo(start.t, 6)
  })
})

describe('weatherNow', () => {
  it('is deterministic for the same instant', () => {
    expect(weatherNow(12_345_678)).toEqual(weatherNow(12_345_678))
  })

  it('keeps intensity within the unit interval', () => {
    for (const now of [0, 50_000, 123_456, 999_999]) {
      const weather = weatherNow(now)
      expect(weather.intensity).toBeGreaterThanOrEqual(0)
      expect(weather.intensity).toBeLessThanOrEqual(1)
    }
  })
})
