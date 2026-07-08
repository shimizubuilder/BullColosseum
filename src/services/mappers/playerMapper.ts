import type { Bull } from '@/domain/models/bull'
import type { Player, WalletStatus } from '@/domain/models/player'
import type { BullDto, PlayerDto, PlayerSavePayload } from '@/services/dto/player.dto'
import { bullFromDto, bullFromStoredDto, bullToPayload, bullToStoredPayload } from './bullMapper'

const WALLET_STATUSES: WalletStatus[] = ['none', 'unverified', 'linked']

function toWalletStatus(value: unknown): WalletStatus {
  return (WALLET_STATUSES as string[]).includes(value as string) ? (value as WalletStatus) : 'none'
}

function toCount(value: unknown): number {
  return Math.max(0, Math.trunc(Number(value) || 0))
}

function defaultBull(): Bull {
  return { name: 'Toro', element: 'fire', level: 1, xp: 0, gear: [], traits: [], mythic: false }
}

export function playerFromDto(dto: PlayerDto, activeBull: BullDto | null): Player {
  return {
    account: {
      username: dto.username,
      avatar: dto.avatar,
      token: dto.token ?? '',
    },
    wallet: {
      address: dto.wallet ?? null,
      status: toWalletStatus(dto.wallet_status),
    },
    usernameChanged: Boolean(dto.username_changed),
    currency: {
      gold: toCount(dto.gold),
      chargeToken: toCount(dto.chargetoken),
    },
    record: {
      wins: toCount(dto.wins),
      losses: toCount(dto.losses),
      rating: toCount(dto.rating),
    },
    activeBull: activeBull ? bullFromDto(activeBull) : defaultBull(),
    storedBulls: (dto.stored_bulls ?? []).map(bullFromStoredDto),
    farm: {
      plotIndex: dto.farm_plot ?? null,
      capacity: Math.max(2, Math.trunc(Number(dto.farm_capacity) || 2)),
      lastClaimAt: toCount(dto.farm_claim),
    },
  }
}

export function playerToSavePayload(player: Player): PlayerSavePayload {
  return {
    action: 'save',
    token: player.account.token,
    gold: player.currency.gold,
    chargetoken: player.currency.chargeToken,
    bull: bullToPayload(player.activeBull),
    farm_plot: player.farm.plotIndex,
    farm_capacity: player.farm.capacity,
    stored_bulls: player.storedBulls.map(bullToStoredPayload),
    farm_claim: player.farm.lastClaimAt,
  }
}
