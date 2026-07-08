import type { Player } from '@/domain/models/player'
import type { WalletStatus } from '@/domain/models/player'
import type { StoredBullDto } from '@/services/dto/player.dto'
import { bullFromStoredDto } from '@/services/mappers/bullMapper'
import { STARTING_CAPACITY, STARTING_GOLD, STARTING_RATING } from '@/domain/config/balance'
import type { PersistedState } from './saveSchema'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function asWalletStatus(value: unknown): WalletStatus {
  return value === 'unverified' || value === 'linked' ? value : 'none'
}

function asStoredBull(value: unknown): StoredBullDto {
  return (isRecord(value) ? value : {}) as StoredBullDto
}

export function migrateLegacyV2(raw: unknown, tutorialDone: boolean): PersistedState | null {
  if (!isRecord(raw) || typeof raw.username !== 'string') {
    return null
  }
  const farm = isRecord(raw.farm) ? raw.farm : {}
  const player: Player = {
    account: { username: raw.username, avatar: asString(raw.avatar, 'ansem'), token: asString(raw.token) },
    wallet: {
      address: raw.wallet == null ? null : asString(raw.wallet),
      status: asWalletStatus(raw.walletStatus),
    },
    usernameChanged: Boolean(raw.usernameChanged),
    currency: { gold: asNumber(raw.gold, STARTING_GOLD), chargeToken: asNumber(raw.tok) },
    record: {
      wins: asNumber(raw.wins),
      losses: asNumber(raw.losses),
      rating: asNumber(raw.rating, STARTING_RATING),
    },
    activeBull: bullFromStoredDto(asStoredBull(raw.bull)),
    storedBulls: Array.isArray(raw.stored) ? raw.stored.map(asStoredBull).map(bullFromStoredDto) : [],
    farm: {
      plotIndex: farm.plot == null ? null : asNumber(farm.plot),
      capacity: asNumber(farm.capacity, STARTING_CAPACITY),
      lastClaimAt: asNumber(farm.lastClaim),
    },
  }
  return { player, tutorialDone }
}
