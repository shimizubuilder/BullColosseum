import { describe, expect, it } from 'vitest'
import {
  clampClashAfterLock,
  pushPowerPerTap,
  resolveFinalOutcome,
  resolveLockTap,
  setupFinal,
} from '@/domain/combat/chargeClash'
import {
  finalCommitChance,
  lockAimTolerance,
  opponentPushRate,
  spectatorPushRate,
} from '@/domain/combat/duelAi'
import { rollMatchReward } from '@/domain/combat/matchReward'
import { statsOf } from '@/domain/stats'
import { constantRng, sequenceRng } from './support/rng'

const attacker = statsOf({ level: 1, element: 'fire' })

describe('resolveLockTap', () => {
  it('grades the tap by distance from centre', () => {
    expect(resolveLockTap(0.01, attacker).result).toBe('perfect')
    expect(resolveLockTap(0.05, attacker).result).toBe('good')
    expect(resolveLockTap(0.12, attacker).result).toBe('ok')
    expect(resolveLockTap(0.3, attacker).result).toBe('miss')
  })

  it('exposes the clash advance for each grade', () => {
    expect(resolveLockTap(0.01, attacker).advance).toBeCloseTo(0.14)
    expect(resolveLockTap(0.3, attacker).advance).toBeCloseTo(-0.06)
  })
})

describe('clampClashAfterLock', () => {
  it('keeps the clash inside the lock bounds', () => {
    expect(clampClashAfterLock(0.05)).toBe(0.2)
    expect(clampClashAfterLock(0.95)).toBe(0.8)
    expect(clampClashAfterLock(0.5)).toBe(0.5)
  })
})

describe('pushPowerPerTap', () => {
  it('derives tap power from the power stat', () => {
    expect(pushPowerPerTap(attacker)).toBeCloseTo(0.145)
  })
})

describe('setupFinal', () => {
  it('sets the attacker as the leading side and derives a deterministic zone', () => {
    const setup = setupFinal(0.7, attacker, 0.5, constantRng(0.5))
    expect(setup.attackerIsMe).toBe(true)
    expect(setup.zone).toBeCloseTo(0.2483, 3)
    expect(setup.zoneAt).toBeCloseTo(0.5)
    expect(setup.speed).toBeCloseTo(1.84)
  })
})

describe('resolveFinalOutcome', () => {
  it('resolves the four attacker and defender cases', () => {
    expect(resolveFinalOutcome(true, 0.7, true)).toBe(true)
    expect(resolveFinalOutcome(true, 0.6, false)).toBe(true)
    expect(resolveFinalOutcome(true, 0.4, false)).toBe(false)
    expect(resolveFinalOutcome(false, 0.7, true)).toBe(true)
    expect(resolveFinalOutcome(false, 0.7, false)).toBe(false)
  })
})

describe('duelAi', () => {
  it('interpolates behaviour across the skill range', () => {
    expect(lockAimTolerance(0)).toBeCloseTo(0.2)
    expect(lockAimTolerance(1)).toBeCloseTo(0.03)
    expect(spectatorPushRate(0)).toBeCloseTo(1.9)
    expect(spectatorPushRate(1)).toBeCloseTo(4.3)
    expect(opponentPushRate(1)).toBeCloseTo(4.2)
    expect(finalCommitChance(0)).toBeCloseTo(0.1)
    expect(finalCommitChance(1)).toBeCloseTo(0.95)
  })
})

describe('rollMatchReward', () => {
  it('rewards a win with the upset token when out-tiered', () => {
    expect(rollMatchReward(true, 2, 1, sequenceRng([0, 0, 0]))).toEqual({ xp: 9, gold: 45, token: 1 })
  })

  it('never grants the upset token below the opponent tier', () => {
    expect(rollMatchReward(true, 1, 2, sequenceRng([0, 0, 0])).token).toBe(0)
  })

  it('gives a modest consolation on a loss', () => {
    expect(rollMatchReward(false, 2, 1, sequenceRng([0]))).toEqual({ xp: 4, gold: 10, token: 0 })
  })
})
