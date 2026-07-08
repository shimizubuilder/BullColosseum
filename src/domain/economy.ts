import type { Bull } from '@/domain/models/bull'
import { BETTING, FARM, KING, TRAINING, VAULT } from '@/domain/config/balance'
import { clamp } from '@/domain/math'
import { tierOf } from '@/domain/progression'

export function trainingCost(level: number): number {
  return TRAINING.costBase + level * TRAINING.costPerLevel
}

export function trainingXp(level: number): number {
  return TRAINING.xpBase + level * TRAINING.xpPerLevel
}

export interface VaultConversion {
  spentGold: number
  mintedTokens: number
}

export function vaultConversion(gold: number, fraction: number): VaultConversion {
  const spentGold = Math.floor(gold * fraction)
  if (spentGold < VAULT.minGold) {
    return { spentGold: 0, mintedTokens: 0 }
  }
  const mintedTokens = Math.floor((spentGold / VAULT.goldPerToken) * VAULT.keepRate)
  return { spentGold, mintedTokens }
}

export type RestingBull = Pick<Bull, 'level' | 'traits' | 'mythic'>

export function farmEarnRate(bull: RestingBull): number {
  return (
    FARM.earnBase +
    tierOf(bull.level) * FARM.earnPerTier +
    (bull.mythic ? FARM.earnMythic : 0) +
    bull.traits.length * FARM.earnPerTrait
  )
}

export function farmRatePerHour(restingBulls: RestingBull[]): number {
  return restingBulls.reduce((total, bull) => total + farmEarnRate(bull), 0)
}

export function pendingEarnings(ratePerHour: number, elapsedSeconds: number): number {
  const cappedSeconds = clamp(elapsedSeconds, 0, FARM.earningsCapSeconds)
  return Math.floor((ratePerHour * cappedSeconds) / 3600)
}

export function plotPrice(): number {
  return FARM.plotPrice
}

export function extendCost(capacity: number): number {
  return FARM.extendCostPerCapacity * capacity
}

export function calfCost(): number {
  return FARM.calfCost
}

export function betPayout(stake: number): number {
  return Math.round(stake * BETTING.payoutMultiplier)
}

export function kingBounty(heldSeconds: number): number {
  return Math.min(KING.bountyCap, Math.floor(Math.max(0, heldSeconds) / 60) * KING.bountyPerMinute)
}
