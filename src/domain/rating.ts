import { DIVISIONS, type DivisionDefinition } from '@/domain/config/divisions'
import { LOCAL_RATING } from '@/domain/config/balance'
import { randomInt, type Rng } from '@/domain/rng'

export function divisionOf(rating: number): DivisionDefinition {
  let division = DIVISIONS[0]
  for (const candidate of DIVISIONS) {
    if (rating >= candidate.minRating) {
      division = candidate
    }
  }
  return division
}

export function localRatingDelta(win: boolean, rng: Rng): number {
  if (win) {
    return LOCAL_RATING.winBase + randomInt(rng, LOCAL_RATING.winRandomRange)
  }
  return -(LOCAL_RATING.lossBase + randomInt(rng, LOCAL_RATING.lossRandomRange))
}

export function applyRating(rating: number, delta: number): number {
  return Math.max(0, rating + delta)
}
