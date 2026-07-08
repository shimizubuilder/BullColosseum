import { apiPost } from '@/services/http/httpClient'
import { ENDPOINTS } from '@/services/http/endpoints'
import type { NetworkResult } from '@/services/http/NetworkResult'
import type {
  BullDto,
  MatchResponseDto,
  PlayerBundleDto,
  PlayerSavePayload,
  SaveResponseDto,
} from '@/services/dto/player.dto'

export interface RegisterInput {
  username: string
  avatar: string
  bullName: string
  element: string
}

export interface MatchReportInput {
  token: string
  result: 'win' | 'loss'
  opponent: string
  goldDelta: number
  xpDelta: number
  tokenDelta: number
  bull: BullDto
}

export function register(input: RegisterInput): Promise<NetworkResult<PlayerBundleDto>> {
  return apiPost(ENDPOINTS.player, {
    action: 'register',
    username: input.username,
    avatar: input.avatar,
    bullName: input.bullName,
    element: input.element,
  })
}

export function load(token: string): Promise<NetworkResult<PlayerBundleDto>> {
  return apiPost(ENDPOINTS.player, { action: 'load', token })
}

export function save(payload: PlayerSavePayload): Promise<NetworkResult<SaveResponseDto>> {
  return apiPost(ENDPOINTS.player, payload)
}

export function reportMatch(input: MatchReportInput): Promise<NetworkResult<MatchResponseDto>> {
  return apiPost(ENDPOINTS.player, {
    action: 'match',
    token: input.token,
    result: input.result,
    opponent: input.opponent,
    gold_delta: input.goldDelta,
    xp_delta: input.xpDelta,
    tok_delta: input.tokenDelta,
    bull: input.bull,
  })
}
