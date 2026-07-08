export interface KingBullDto {
  elem?: string
  lv?: number
  traits?: string[]
  mythic?: boolean | number
}

export interface KingDto {
  username: string
  avatar: string
  tier: number
  since: number
  bull: KingBullDto
}

export interface KingResponseDto {
  ok: boolean
  king: KingDto | null
  now: number
}

export interface ChallengePayload {
  action: 'challenge'
  token: string
  won: 0 | 1
  tier: number
  bull: KingBullDto
}

export interface ChallengeResponseDto {
  ok: boolean
  became_king?: boolean
  reward_to_prev?: number
  king: KingDto | null
  now: number
}
