import type { BullStatline } from '@/domain/models/stats'
import { COMBAT_FINAL, COMBAT_LOCK, COMBAT_PUSH } from '@/domain/config/balance'
import { clamp, lerp } from '@/domain/math'
import { randomRange, type Rng } from '@/domain/rng'
import { winWidth } from '@/domain/stats'

export type LockResult = 'perfect' | 'good' | 'ok' | 'miss'

export interface LockTapOutcome {
  result: LockResult
  score: number
  advance: number
}

const LOCK_SCORE: Record<LockResult, number> = { perfect: 3, good: 2, ok: 1, miss: 0 }

export function resolveLockTap(cursorError: number, attackerStats: BullStatline): LockTapOutcome {
  const window = winWidth(attackerStats) / 100
  if (cursorError < window * COMBAT_LOCK.perfect.errorFactor) {
    return { result: 'perfect', score: LOCK_SCORE.perfect, advance: COMBAT_LOCK.perfect.advance }
  }
  if (cursorError < window * COMBAT_LOCK.good.errorFactor) {
    return { result: 'good', score: LOCK_SCORE.good, advance: COMBAT_LOCK.good.advance }
  }
  if (cursorError < window * COMBAT_LOCK.ok.errorFactor) {
    return { result: 'ok', score: LOCK_SCORE.ok, advance: COMBAT_LOCK.ok.advance }
  }
  return { result: 'miss', score: LOCK_SCORE.miss, advance: COMBAT_LOCK.miss.advance }
}

export function clampClashAfterLock(clash: number): number {
  return clamp(clash, COMBAT_LOCK.clashMin, COMBAT_LOCK.clashMax)
}

export function pushPowerPerTap(stats: BullStatline): number {
  return (stats.power * COMBAT_PUSH.powerScale + COMBAT_PUSH.powerBase) / COMBAT_PUSH.powerDivisor
}

export interface FinalSetup {
  attackerIsMe: boolean
  zone: number
  zoneAt: number
  speed: number
}

export function setupFinal(clash: number, myStats: BullStatline, foeSkill: number, rng: Rng): FinalSetup {
  const attackerIsMe = clash >= 0.5
  const advantage = Math.abs(clash - 0.5) * 2
  const widthBonus = winWidth(myStats) / COMBAT_FINAL.winWidthZoneDivisor
  const zone = attackerIsMe
    ? lerp(COMBAT_FINAL.attackerZoneMin, COMBAT_FINAL.attackerZoneMax, advantage) + widthBonus
    : lerp(COMBAT_FINAL.defenderZoneMin, COMBAT_FINAL.defenderZoneMax, advantage) + widthBonus
  const zoneAt = randomRange(rng, COMBAT_FINAL.zoneAtMin, COMBAT_FINAL.zoneAtMax)
  const speed = lerp(
    COMBAT_FINAL.speedMin,
    COMBAT_FINAL.speedMax,
    foeSkill * COMBAT_FINAL.speedSkillScale + COMBAT_FINAL.speedSkillBase,
  )
  return { attackerIsMe, zone, zoneAt, speed }
}

export function resolveFinalOutcome(attackerIsMe: boolean, clash: number, hit: boolean): boolean {
  if (attackerIsMe) {
    return hit ? true : clash > 0.5
  }
  return hit
}
