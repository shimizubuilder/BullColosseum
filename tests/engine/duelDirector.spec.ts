import { describe, expect, it } from 'vitest'
import { DuelDirector, type DuelFighter } from '@/engine/duel/DuelDirector'
import { statsOf } from '@/domain/stats'
import { constantRng } from '../domain/support/rng'

function fighter(name: string, level: number, skill: number): DuelFighter {
  return {
    name,
    element: 'fire',
    stats: statsOf({ name, element: 'fire', level, xp: 0, gear: [], traits: [], mythic: false }),
    skill,
  }
}

function runToEnd(director: DuelDirector, taps: number): void {
  let guard = 0
  while (!director.finished && guard < 100_000) {
    director.advance(1 / 60, taps)
    guard += 1
  }
}

describe('DuelDirector', () => {
  it('starts in the intro phase with an even clash', () => {
    const director = new DuelDirector(fighter('Me', 6, 0.7), fighter('Foe', 5, 0.5), constantRng(0.4))
    const snapshot = director.snapshot()
    expect(snapshot.phase).toBe('intro')
    expect(snapshot.clash).toBe(0.5)
  })

  it('advances intro into the lock phase after the intro duration', () => {
    const director = new DuelDirector(fighter('Me', 6, 0.7), fighter('Foe', 5, 0.5), constantRng(0.4))
    director.advance(1.2, 0)
    expect(director.snapshot().phase).toBe('lock')
  })

  it('runs a spectated duel to completion with a decisive outcome', () => {
    const director = new DuelDirector(fighter('Me', 6, 0.7), fighter('Foe', 5, 0.5), constantRng(0.4), true)
    runToEnd(director, 0)
    expect(director.finished).toBe(true)
    expect(['win', 'lose']).toContain(director.result)
  })

  it('locks on a player tap and drives through to a result', () => {
    const director = new DuelDirector(fighter('Me', 6, 0.9), fighter('Foe', 5, 0.5), constantRng(0.5))
    director.advance(1.2, 0)
    director.advance(1 / 60, 1)
    expect(director.snapshot().lock.locked).toBe(true)
    runToEnd(director, 1)
    expect(director.finished).toBe(true)
    expect(['win', 'lose']).toContain(director.result)
  })
})
