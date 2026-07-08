import type { BullStatline } from '@/domain/models/stats'
import type { ElementId } from '@/domain/config/elements'
import type { Rng } from '@/domain/rng'
import { clamp } from '@/domain/math'
import { COMBAT_PUSH, COMBAT_TIMING } from '@/domain/config/balance'
import {
  clampClashAfterLock,
  pushPowerPerTap,
  resolveFinalOutcome,
  resolveLockTap,
  setupFinal,
  type LockResult,
} from '@/domain/combat/chargeClash'
import { finalCommitChance, lockAimTolerance, opponentPushRate, spectatorPushRate } from '@/domain/combat/duelAi'

export interface DuelFighter {
  name: string
  element: ElementId
  stats: BullStatline
  skill: number
}

export interface DuelSetup {
  me: DuelFighter
  foe: DuelFighter
  spectate: boolean
}

export type DuelPhase = 'intro' | 'lock' | 'push' | 'final' | 'throw' | 'done'
export type DuelOutcome = 'win' | 'lose'

export interface DuelSnapshot {
  phase: DuelPhase
  clash: number
  banner: string
  attackerIsMe: boolean
  outcome: DuelOutcome | null
  lock: { cursor: number; locked: boolean; result: LockResult | null }
  push: { time: number; limit: number; stamina: number }
  final: { cursor: number; zone: number; zoneAt: number; done: boolean }
}

const LOCK_BANNER: Record<LockResult, string> = {
  perfect: 'PERFECT!',
  good: 'GOOD',
  ok: 'OK',
  miss: 'MISS',
}

export class DuelDirector {
  private phase: DuelPhase = 'intro'
  private t = 0
  private clash = 0.5
  private banner = 'LOCK HORNS!'
  private attackerIsMe = true
  private outcome: DuelOutcome | null = null

  private lockCursor = 0
  private lockDir = 1
  private locked = false
  private lockResult: LockResult | null = null
  private lockDelay = 0

  private pushTime = 0
  private pushLimit = COMBAT_PUSH.durationLimit
  private stamina = 1
  private foeStamina = 1

  private finalCursor = 0
  private finalDir = 1
  private finalSpeed = 1.7
  private finalZone = 0.2
  private finalZoneAt = 0.5
  private finalDone = false

  private meAim = 0
  private meAccumulator = 0
  private finalPlan: boolean | null = null
  private finalTimer = 0

  constructor(
    private readonly me: DuelFighter,
    private readonly foe: DuelFighter,
    private readonly rng: Rng,
    private readonly spectate = false,
  ) {}

  get finished(): boolean {
    return this.phase === 'done'
  }

  get result(): DuelOutcome | null {
    return this.outcome
  }

  advance(dt: number, playerTaps: number): void {
    this.t += dt
    switch (this.phase) {
      case 'intro':
        this.advanceIntro()
        break
      case 'lock':
        this.advanceLock(dt, playerTaps)
        break
      case 'push':
        this.advancePush(dt, playerTaps)
        break
      case 'final':
        this.advanceFinal(dt, playerTaps)
        break
      case 'throw':
        if (this.t >= COMBAT_TIMING.throwDuration) {
          this.phase = 'done'
        }
        break
      case 'done':
        break
    }
  }

  private advanceIntro(): void {
    if (this.t > COMBAT_TIMING.introDuration) {
      this.phase = 'lock'
      this.t = 0
      this.banner = 'TAP THE GOLD ZONE'
    }
  }

  private advanceLock(dt: number, playerTaps: number): void {
    this.lockCursor += this.lockDir * COMBAT_TIMING.lockCursorSpeed * dt
    if (this.lockCursor > 1) {
      this.lockCursor = 1
      this.lockDir = -1
    }
    if (this.lockCursor < 0) {
      this.lockCursor = 0
      this.lockDir = 1
    }

    let tap = playerTaps > 0 || this.t > COMBAT_TIMING.autoTapTimeout
    if (this.spectate && !this.locked) {
      if (this.meAim === 0) {
        this.meAim = lockAimTolerance(this.me.skill)
      }
      if (Math.abs(this.lockCursor - 0.5) <= this.meAim) {
        tap = true
      }
    }

    if (tap && !this.locked) {
      this.locked = true
      const outcome = resolveLockTap(Math.abs(this.lockCursor - 0.5), this.me.stats)
      this.lockResult = outcome.result
      this.clash = clampClashAfterLock(this.clash + outcome.advance)
      this.banner = LOCK_BANNER[outcome.result]
      this.lockDelay = COMBAT_TIMING.lockDelay
    }

    if (this.locked) {
      this.lockDelay -= dt
      if (this.lockDelay <= 0) {
        this.phase = 'push'
        this.t = 0
        this.pushLimit = COMBAT_PUSH.durationLimit
        this.banner = 'PUSH! TAP FAST'
      }
    }
  }

  private advancePush(dt: number, playerTaps: number): void {
    this.pushTime += dt
    let taps = playerTaps
    if (this.spectate) {
      this.meAccumulator += spectatorPushRate(this.me.skill) * dt
      while (this.meAccumulator >= 1) {
        taps += 1
        this.meAccumulator -= 1
      }
    }

    if (taps > 0) {
      const power = pushPowerPerTap(this.me.stats)
      this.clash = clamp(this.clash + power * this.stamina * taps, COMBAT_PUSH.clashMin, COMBAT_PUSH.clashMax)
      this.stamina = clamp(
        this.stamina - COMBAT_PUSH.staminaDecayPerTap * taps,
        COMBAT_PUSH.staminaMin,
        COMBAT_PUSH.staminaMax,
      )
    }
    this.stamina = clamp(this.stamina + dt * COMBAT_PUSH.staminaRegenPerSecond, 0, 1)

    const foePower = pushPowerPerTap(this.foe.stats)
    const foeRate = opponentPushRate(this.foe.skill) * this.foeStamina
    this.clash = clamp(this.clash - foePower * foeRate * dt, COMBAT_PUSH.clashMin, COMBAT_PUSH.clashMax)
    this.foeStamina = clamp(
      this.foeStamina - foeRate * dt * COMBAT_PUSH.foeStaminaDrain + dt * COMBAT_PUSH.foeStaminaRegenPerSecond,
      COMBAT_PUSH.foeStaminaMin,
      1,
    )

    if (this.pushTime >= this.pushLimit || this.clash >= COMBAT_PUSH.endHigh || this.clash <= COMBAT_PUSH.endLow) {
      const setup = setupFinal(this.clash, this.me.stats, this.foe.skill, this.rng)
      this.attackerIsMe = setup.attackerIsMe
      this.finalZone = setup.zone
      this.finalZoneAt = setup.zoneAt
      this.finalSpeed = setup.speed
      this.finalDone = false
      this.banner = setup.attackerIsMe ? 'FINAL CHARGE — THROW HIM!' : 'COUNTER! TURN IT AROUND!'
      this.phase = 'final'
      this.t = 0
    }
  }

  private advanceFinal(dt: number, playerTaps: number): void {
    this.finalCursor += this.finalDir * this.finalSpeed * dt
    if (this.finalCursor > 1) {
      this.finalCursor = 1
      this.finalDir = -1
    }
    if (this.finalCursor < 0) {
      this.finalCursor = 0
      this.finalDir = 1
    }

    let tap = playerTaps > 0 || this.t > COMBAT_TIMING.autoTapTimeout
    const inZone = Math.abs(this.finalCursor - this.finalZoneAt) < this.finalZone / 2
    if (this.spectate && !this.finalDone) {
      if (this.finalPlan === null) {
        this.finalPlan = this.rng() < finalCommitChance(this.me.skill)
      }
      this.finalTimer += dt
      if (this.finalPlan) {
        if (inZone) {
          tap = true
        }
      } else if (this.finalTimer > COMBAT_TIMING.finalCommitDelay && !inZone) {
        tap = true
      }
    }

    if (tap && !this.finalDone) {
      this.finalDone = true
      const win = resolveFinalOutcome(this.attackerIsMe, this.clash, inZone)
      this.outcome = win ? 'win' : 'lose'
      this.banner = win ? 'KNOCKOUT!' : 'THROWN OUT!'
      this.phase = 'throw'
      this.t = 0
    }
  }

  snapshot(): DuelSnapshot {
    return {
      phase: this.phase,
      clash: this.clash,
      banner: this.banner,
      attackerIsMe: this.attackerIsMe,
      outcome: this.outcome,
      lock: { cursor: this.lockCursor, locked: this.locked, result: this.lockResult },
      push: { time: this.pushTime, limit: this.pushLimit, stamina: this.stamina },
      final: { cursor: this.finalCursor, zone: this.finalZone, zoneAt: this.finalZoneAt, done: this.finalDone },
    }
  }
}
