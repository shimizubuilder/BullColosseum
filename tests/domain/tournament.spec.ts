import { describe, expect, it } from 'vitest'
import {
  buildBracket,
  buildFighterPool,
  runBracket,
  tournamentFighter,
  tournamentPayout,
  withPlayer,
} from '@/domain/combat/tournament'
import { constantRng, seededRng } from './support/rng'

describe('buildFighterPool', () => {
  it('fills the bracket up to eight fighters from the entry list plus fillers', () => {
    const pool = buildFighterPool([{ username: 'SolBull', rating: 1600 }], seededRng(7))
    expect(pool).toHaveLength(8)
    expect(pool[0].name).toBe('SolBull')
    expect(pool[1].name).toContain('#')
  })
})

describe('buildBracket', () => {
  it('lays out a three-round single-elimination tree', () => {
    const bracket = buildBracket(buildFighterPool([], seededRng(1)))
    expect(bracket.map((round) => round.length)).toEqual([4, 2, 1])
  })
})

describe('runBracket', () => {
  it('crowns the first seed when every match favours side A', () => {
    const fighters = buildFighterPool([], seededRng(3))
    const result = runBracket(buildBracket(fighters), constantRng(0))
    expect(result.champion).toEqual(fighters[0])
  })

  it('crowns the last seed when every match favours side B', () => {
    const fighters = buildFighterPool([], seededRng(3))
    const result = runBracket(buildBracket(fighters), constantRng(1))
    expect(result.champion).toEqual(fighters[7])
  })

  it('does not mutate the source bracket', () => {
    const bracket = buildBracket(buildFighterPool([], seededRng(3)))
    runBracket(bracket, constantRng(0))
    expect(bracket[bracket.length - 1][0].winner).toBeNull()
  })
})

describe('tournamentPayout', () => {
  it('pays the pool and a token to a winning player, nothing otherwise', () => {
    const me = tournamentFighter('You', 1500, true)
    const roster = withPlayer(buildFighterPool([], seededRng(3)), me)
    const champ = runBracket(buildBracket(roster), constantRng(1)).champion
    expect(champ?.isMe).toBe(true)
    expect(tournamentPayout(650, champ)).toEqual({ gold: 650, token: 1 })
    expect(tournamentPayout(650, tournamentFighter('Bot', 1200, false))).toEqual({ gold: 0, token: 0 })
  })
})
