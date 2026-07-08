import { MATCHMAKING, TOURNAMENT } from '@/domain/config/balance'
import { pickFrom, type Rng } from '@/domain/rng'
import { simulateBracketWinner, tournamentFighterSkill } from '@/domain/combat/matchmaking'

export type TournamentMode = keyof typeof TOURNAMENT.modes

export interface TournamentEntry {
  username: string
  rating: number
}

export interface TournamentFighter {
  name: string
  rating: number
  skill: number
  isMe: boolean
}

export interface BracketMatch {
  a: TournamentFighter | null
  b: TournamentFighter | null
  winner: TournamentFighter | null
}

export type BracketRound = BracketMatch[]

export interface BracketResult {
  rounds: BracketRound[]
  champion: TournamentFighter | null
}

export function tournamentFighter(name: string, rating: number, isMe = false): TournamentFighter {
  return { name, rating, skill: tournamentFighterSkill(rating), isMe }
}

export function buildFighterPool(entries: TournamentEntry[], rng: Rng): TournamentFighter[] {
  const fighters = entries.slice(0, TOURNAMENT.size).map((entry) => tournamentFighter(entry.username, entry.rating))
  while (fighters.length < TOURNAMENT.size) {
    const name = `${pickFrom(rng, MATCHMAKING.names)}#${10 + Math.floor(rng() * 90)}`
    fighters.push(tournamentFighter(name, 900 + Math.floor(rng() * 500)))
  }
  return fighters
}

export function buildBracket(fighters: TournamentFighter[]): BracketRound[] {
  const first: BracketRound = []
  for (let index = 0; index < TOURNAMENT.size; index += 2) {
    first.push({ a: fighters[index] ?? null, b: fighters[index + 1] ?? null, winner: null })
  }
  const rounds: BracketRound[] = [first]
  let count = first.length
  while (count > 1) {
    count = Math.floor(count / 2)
    rounds.push(Array.from({ length: count }, () => ({ a: null, b: null, winner: null })))
  }
  return rounds
}

export function withPlayer(fighters: TournamentFighter[], me: TournamentFighter): TournamentFighter[] {
  const next = fighters.slice()
  next[next.length - 1] = me
  return next
}

export function runBracket(rounds: BracketRound[], rng: Rng): BracketResult {
  const result = rounds.map((round) => round.map((match) => ({ ...match })))
  for (let index = 0; index < result.length; index += 1) {
    for (const match of result[index]) {
      if (match.a && match.b) {
        match.winner = simulateBracketWinner(match.a, match.b, rng)
      } else {
        match.winner = match.a ?? match.b
      }
    }
    const nextRound = result[index + 1]
    if (nextRound) {
      const winners = result[index].map((match) => match.winner)
      for (let slot = 0; slot < nextRound.length; slot += 1) {
        nextRound[slot].a = winners[slot * 2] ?? null
        nextRound[slot].b = winners[slot * 2 + 1] ?? null
      }
    }
  }
  const finalRound = result[result.length - 1]
  return { rounds: result, champion: finalRound[0]?.winner ?? null }
}

export function tournamentPayout(pool: number, champion: TournamentFighter | null): { gold: number; token: number } {
  if (champion?.isMe) {
    return { gold: pool, token: TOURNAMENT.championTokenReward }
  }
  return { gold: 0, token: 0 }
}
