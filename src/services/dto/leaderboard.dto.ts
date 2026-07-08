export interface LeaderboardEntryDto {
  rank?: number
  username: string
  avatar: string
  rating: number
  wins: number
  losses: number
  tier: number
}

export interface LeaderboardResponseDto {
  ok: boolean
  leaderboard: LeaderboardEntryDto[]
}
