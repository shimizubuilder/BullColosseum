export const ENDPOINTS = {
  player: 'player.php',
  leaderboard: 'leaderboard.php',
  profile: 'profile.php',
  king: 'king.php',
  presence: 'presence.php',
  chat: 'chat.php',
  farm: 'farm.php',
} as const

export type EndpointName = keyof typeof ENDPOINTS
