import type { LeaderboardEntryDto } from '@/services/dto/leaderboard.dto'

export const FALLBACK_LEADERBOARD: LeaderboardEntryDto[] = [
  { username: 'Charger_Prime', avatar: 'ansem', rating: 1740, wins: 61, losses: 8, tier: 4 },
  { username: 'SolBull', avatar: 'red', rating: 1610, wins: 44, losses: 14, tier: 3 },
  { username: 'BlackHoofKing', avatar: 'gold', rating: 1555, wins: 40, losses: 19, tier: 3 },
  { username: 'MoonGored', avatar: 'bolt', rating: 1420, wins: 28, losses: 25, tier: 2 },
  { username: 'NoRetreat99', avatar: 'shadow', rating: 1390, wins: 25, losses: 22, tier: 2 },
  { username: 'HornDegen', avatar: 'gold', rating: 1280, wins: 17, losses: 30, tier: 1 },
]
