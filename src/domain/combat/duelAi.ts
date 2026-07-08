import { COMBAT_AI } from '@/domain/config/balance'
import { lerp } from '@/domain/math'

export function lockAimTolerance(skill: number): number {
  return lerp(COMBAT_AI.aimToleranceEasy, COMBAT_AI.aimTolerancePro, skill)
}

export function spectatorPushRate(skill: number): number {
  return lerp(COMBAT_AI.spectatorPushRateMin, COMBAT_AI.spectatorPushRateMax, skill)
}

export function opponentPushRate(skill: number): number {
  return lerp(COMBAT_AI.opponentPushRateMin, COMBAT_AI.opponentPushRateMax, skill)
}

export function finalCommitChance(skill: number): number {
  return skill * COMBAT_AI.finalCommitSkillScale + COMBAT_AI.finalCommitBase
}
