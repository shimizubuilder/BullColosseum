import { BETTING } from '@/domain/config/balance'

export type BetSide = 'a' | 'b'
export type MatchWinner = 'a' | 'b'

export function stakeAt(index: number): number {
  return BETTING.stakes[index % BETTING.stakes.length]
}

export function nextStakeIndex(index: number): number {
  return (index + 1) % BETTING.stakes.length
}

export function betPayout(stake: number): number {
  return Math.round(stake * BETTING.payoutMultiplier)
}

export function isBetWon(side: BetSide, winner: MatchWinner): boolean {
  return side === winner
}
