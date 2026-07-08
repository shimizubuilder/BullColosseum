import { describe, expect, it } from 'vitest'
import {
  createOpponent,
  createSpectateFighter,
  simulateBracketWinner,
  tournamentFighterSkill,
} from '@/domain/combat/matchmaking'
import { constantRng, sequenceRng } from './support/rng'

describe('createOpponent', () => {
  it('builds a deterministic opponent from the random stream', () => {
    const opponent = createOpponent(1, 0, sequenceRng([0.4, 0.0, 0.0, 0.9, 0.9, 0.9, 0.0]))
    expect(opponent).toEqual({
      name: 'Grimhoof',
      element: 'fire',
      level: 1,
      tier: 0,
      skill: 0.42,
      traits: [],
      mythic: false,
      gear: [],
    })
  })

  it('clamps skill within its configured band for a strong player', () => {
    const opponent = createOpponent(20, 999, sequenceRng([0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9]))
    expect(opponent.skill).toBeLessThanOrEqual(0.9)
    expect(opponent.skill).toBeGreaterThanOrEqual(0.4)
  })
})

describe('tournamentFighterSkill', () => {
  it('scales skill with rating inside the band', () => {
    expect(tournamentFighterSkill(1000)).toBeCloseTo(0.5)
    expect(tournamentFighterSkill(2000)).toBeCloseTo(0.92)
    expect(tournamentFighterSkill(100)).toBeCloseTo(0.45)
  })
})

describe('createSpectateFighter', () => {
  it('names the fighter after the entry and derives stats', () => {
    const fighter = createSpectateFighter({ username: 'SolBull', rating: 1600, tier: 3 }, constantRng(0))
    expect(fighter.name).toBe('SolBull')
    expect(fighter.stats.power).toBeGreaterThan(0)
  })

  it('defaults a falsy rating to the baseline skill', () => {
    const fighter = createSpectateFighter({ username: 'Ghost', rating: 0 }, constantRng(0))
    expect(fighter.skill).toBeCloseTo(0.5)
  })
})

describe('simulateBracketWinner', () => {
  it('favours the higher-skill fighter probabilistically', () => {
    expect(simulateBracketWinner({ skill: 0.8 }, { skill: 0.2 }, constantRng(0.5))).toEqual({ skill: 0.8 })
    expect(simulateBracketWinner({ skill: 0.8 }, { skill: 0.2 }, constantRng(0.9))).toEqual({ skill: 0.2 })
  })
})
