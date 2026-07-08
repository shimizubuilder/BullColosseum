import { describe, expect, it } from 'vitest'
import { Clock } from '@/engine/core/Clock'

const noop = (): void => {}

describe('Clock', () => {
  it('runs exactly one fixed step for a single 1/60s frame', () => {
    const clock = new Clock(1 / 60)
    let fixed = 0
    clock.advance(1 / 60, { fixedUpdate: () => (fixed += 1), render: noop })
    expect(fixed).toBe(1)
  })

  it('drains multiple fixed steps from a large accumulated delta', () => {
    const clock = new Clock(1 / 60)
    let fixed = 0
    clock.advance(3 / 60, { fixedUpdate: () => (fixed += 1), render: noop })
    expect(fixed).toBe(3)
  })

  it('clamps a spike so it cannot spiral beyond the max frame', () => {
    const clock = new Clock(1 / 60, 0.05)
    let fixed = 0
    clock.advance(10, { fixedUpdate: () => (fixed += 1), render: noop })
    expect(fixed).toBe(3)
  })

  it('carries the accumulator remainder across frames', () => {
    const clock = new Clock(1 / 60)
    let fixed = 0
    const count = (): void => {
      fixed += 1
    }
    clock.advance(0.5 / 60, { fixedUpdate: count, render: noop })
    clock.advance(0.6 / 60, { fixedUpdate: count, render: noop })
    expect(fixed).toBe(1)
  })

  it('reports the render interpolation alpha inside the unit interval', () => {
    const clock = new Clock(1 / 60)
    let alpha = -1
    clock.advance(1.5 / 60, { fixedUpdate: noop, render: (value) => (alpha = value) })
    expect(alpha).toBeGreaterThanOrEqual(0)
    expect(alpha).toBeLessThan(1)
  })
})
