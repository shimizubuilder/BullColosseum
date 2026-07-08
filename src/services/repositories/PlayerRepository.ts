import type { Currency, Player, PlayerRecord } from '@/domain/models/player'
import type { Rng } from '@/domain/rng'
import { applyRating, localRatingDelta } from '@/domain/rating'
import { bullToPayload } from '@/services/mappers/bullMapper'
import { playerFromDto, playerToSavePayload } from '@/services/mappers/playerMapper'
import * as playerApi from '@/services/api/playerApi'
import type { RegisterInput } from '@/services/api/playerApi'
import { createLocalPlayer } from '@/services/offline/OfflineOracle'

export interface PlayerResult {
  player: Player
  source: 'server' | 'offline'
}

export interface MatchReward {
  xp: number
  gold: number
  token: number
}

export interface MatchOutcome {
  record: PlayerRecord
  currency: Currency
  ratingDelta: number
  source: 'server' | 'offline'
}

function isServerToken(token: string): boolean {
  return token.length > 0 && !token.startsWith('local-')
}

export async function registerPlayer(
  input: RegisterInput,
  online: boolean,
  localToken: string,
): Promise<PlayerResult> {
  if (online) {
    const result = await playerApi.register(input)
    if (result.status === 'ok' && result.data.ok) {
      return { player: playerFromDto(result.data.player, result.data.bull), source: 'server' }
    }
  }
  return { player: createLocalPlayer(input, localToken), source: 'offline' }
}

export async function loadPlayer(token: string, online: boolean): Promise<PlayerResult | null> {
  if (online && isServerToken(token)) {
    const result = await playerApi.load(token)
    if (result.status === 'ok' && result.data.ok) {
      return { player: playerFromDto(result.data.player, result.data.bull), source: 'server' }
    }
  }
  return null
}

export async function savePlayer(player: Player, online: boolean): Promise<'server' | 'offline'> {
  if (online && isServerToken(player.account.token)) {
    const result = await playerApi.save(playerToSavePayload(player))
    if (result.status === 'ok') {
      return 'server'
    }
  }
  return 'offline'
}

export interface MatchReportParams {
  player: Player
  won: boolean
  reward: MatchReward
  opponentName: string
  online: boolean
  rng: Rng
}

export async function reportMatch(params: MatchReportParams): Promise<MatchOutcome> {
  const { player, won, reward, opponentName, online, rng } = params

  if (online && isServerToken(player.account.token)) {
    const result = await playerApi.reportMatch({
      token: player.account.token,
      result: won ? 'win' : 'loss',
      opponent: opponentName,
      goldDelta: reward.gold,
      xpDelta: reward.xp,
      tokenDelta: reward.token,
      bull: bullToPayload(player.activeBull),
    })
    if (result.status === 'ok' && result.data.ok) {
      const updated = playerFromDto(result.data.player, null)
      return {
        record: updated.record,
        currency: updated.currency,
        ratingDelta: result.data.rating_delta,
        source: 'server',
      }
    }
  }

  const ratingDelta = localRatingDelta(won, rng)
  return {
    record: {
      wins: player.record.wins + (won ? 1 : 0),
      losses: player.record.losses + (won ? 0 : 1),
      rating: applyRating(player.record.rating, ratingDelta),
    },
    currency: {
      gold: Math.max(0, player.currency.gold + reward.gold),
      chargeToken: Math.max(0, player.currency.chargeToken + reward.token),
    },
    ratingDelta,
    source: 'offline',
  }
}
