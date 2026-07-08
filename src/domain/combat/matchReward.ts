import { MATCH_REWARD } from '@/domain/config/balance'
import { randomInt, rollChance, type Rng } from '@/domain/rng'

export interface MatchReward {
  xp: number
  gold: number
  token: number
}

export function rollMatchReward(win: boolean, foeTier: number, myTier: number, rng: Rng): MatchReward {
  if (win) {
    const xp =
      MATCH_REWARD.win.xpBase + foeTier * MATCH_REWARD.win.xpPerFoeTier + randomInt(rng, MATCH_REWARD.win.xpRandomRange)
    const gold =
      MATCH_REWARD.win.goldBase +
      foeTier * MATCH_REWARD.win.goldPerFoeTier +
      randomInt(rng, MATCH_REWARD.win.goldRandomRange)
    const token =
      foeTier >= myTier && rollChance(rng, MATCH_REWARD.win.upsetTokenChance) ? MATCH_REWARD.win.upsetToken : 0
    return { xp, gold, token }
  }
  const xp = MATCH_REWARD.loss.xpBase + foeTier * MATCH_REWARD.loss.xpPerFoeTier
  const gold = MATCH_REWARD.loss.goldBase + foeTier * MATCH_REWARD.loss.goldPerFoeTier
  return { xp, gold, token: 0 }
}
