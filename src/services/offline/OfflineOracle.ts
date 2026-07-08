import type { Player } from '@/domain/models/player'
import type { ElementId } from '@/domain/config/elements'
import { ELEMENT_IDS } from '@/domain/config/elements'
import { STARTING_CAPACITY, STARTING_GOLD, STARTING_RATING, STARTING_TOKEN } from '@/domain/config/balance'
import type { Rng } from '@/domain/rng'
import type { RegisterInput } from '@/services/api/playerApi'
import type { LeaderboardEntryDto } from '@/services/dto/leaderboard.dto'
import { FALLBACK_LEADERBOARD } from './fixtures'

export function newLocalToken(rng: Rng): string {
  return `local-${Math.floor(rng() * 1e12).toString(36)}`
}

function toElement(value: string): ElementId {
  return (ELEMENT_IDS as string[]).includes(value) ? (value as ElementId) : 'fire'
}

export function createLocalPlayer(input: RegisterInput, token: string): Player {
  return {
    account: { username: input.username, avatar: input.avatar, token },
    wallet: { address: null, status: 'none' },
    usernameChanged: false,
    currency: { gold: STARTING_GOLD, chargeToken: STARTING_TOKEN },
    record: { wins: 0, losses: 0, rating: STARTING_RATING },
    activeBull: {
      name: input.bullName,
      element: toElement(input.element),
      level: 1,
      xp: 0,
      gear: [],
      traits: [],
      mythic: false,
    },
    storedBulls: [],
    farm: { plotIndex: null, capacity: STARTING_CAPACITY, lastClaimAt: 0 },
  }
}

export function offlineLeaderboard(self: LeaderboardEntryDto): LeaderboardEntryDto[] {
  const entries = [...FALLBACK_LEADERBOARD, self]
  entries.sort((first, second) => second.rating - first.rating)
  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }))
}
