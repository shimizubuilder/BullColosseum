export const STARTING_GOLD = 60
export const STARTING_TOKEN = 0
export const STARTING_RATING = 1000
export const STARTING_CAPACITY = 2

export const STAT_FORMULA = {
  power: { base: 6, perLevel: 1.2, perTier: 4 },
  defense: { base: 5, perLevel: 0.9, perTier: 3 },
  speed: { base: 5, perLevel: 0.8, perTier: 2.5 },
  stamina: { base: 6, perLevel: 1.0, perTier: 3 },
}
export const ELEMENT_STAT_BONUS = 6
export const MYTHIC_MULTIPLIER = { power: 1.35, defense: 1.35, speed: 1.3, stamina: 1.35 }

export const WIN_WIDTH = { base: 7, perTier: 3, perSpeed: 0.25, min: 6, max: 26 }

export const XP_FOR_NEXT = { base: 4, perLevel: 3 }

export const TRAINING = { costBase: 20, costPerLevel: 8, xpBase: 6, xpPerLevel: 1 }

export const MATCH_REWARD = {
  win: {
    xpBase: 5,
    xpPerFoeTier: 2,
    xpRandomRange: 3,
    goldBase: 25,
    goldPerFoeTier: 10,
    goldRandomRange: 10,
    upsetTokenChance: 0.25,
    upsetToken: 1,
  },
  loss: { xpBase: 2, xpPerFoeTier: 1, goldBase: 6, goldPerFoeTier: 2 },
}

export const LOCAL_RATING = { winBase: 14, winRandomRange: 10, lossBase: 9, lossRandomRange: 8 }

export const VAULT = { goldPerToken: 100, keepRate: 0.95, minGold: 100 }

export const FARM = {
  plotPrice: 150,
  extendCostPerCapacity: 100,
  calfCost: 80,
  earnBase: 5,
  earnPerTier: 3,
  earnMythic: 15,
  earnPerTrait: 2,
  earningsCapSeconds: 8 * 3600,
}

export const BREEDING = {
  cost: 140,
  elementFromFirstChance: 0.5,
  traitInheritChance: 0.5,
  extraTraitChance: 0.18,
  extraTraitRareChance: 0.35,
  mythicBase: 0.02,
  mythicParentBonus: 0.15,
  mythicAlphaBonus: 0.05,
  maxTraits: 3,
}

export const MATCHMAKING = {
  tierOffsets: [-1, 0, 0, 0, 1],
  levelSpread: 4,
  levelMin: 1,
  levelMax: 22,
  skillBase: 0.42,
  skillPerWin: 0.02,
  skillWinCap: 0.42,
  skillPerTier: 0.03,
  skillMin: 0.4,
  skillMax: 0.9,
  commonTraitChance: 0.12,
  rareTraitChance: 0.05,
  mythicChance: 0.02,
  names: [
    'Grimhoof',
    'Basalt',
    'Cinder',
    'Volt',
    'Umbra',
    'Ravager',
    'Onyx',
    'Molten',
    'Havok',
    'Nero',
    'Bane',
    'Titan',
  ],
}

export const SPECTATE = {
  fighterLevelOffset: 2,
  levelMin: 1,
  levelMax: 20,
  skillBase: 0.5,
  skillRatingDivisor: 1600,
  skillMin: 0.45,
  skillMax: 0.92,
}

export const BETTING = { stakes: [25, 50, 100, 200], payoutMultiplier: 1.9 }

export const TOURNAMENT = {
  size: 8,
  championTokenReward: 1,
  modes: {
    practice: { pool: 200, entry: 50, label: 'Practice' },
    daily: { pool: 600, entry: 80, label: 'Daily' },
    weekly: { pool: 1800, entry: 150, label: 'Weekly' },
  },
}

export const KING = { bountyPerMinute: 5, bountyCap: 1000, becomeKingGoldReward: 50 }

export const COMBAT_LOCK = {
  perfect: { errorFactor: 0.4, advance: 0.14 },
  good: { errorFactor: 1.0, advance: 0.08 },
  ok: { errorFactor: 1.9, advance: 0.02 },
  miss: { advance: -0.06 },
  clashMin: 0.2,
  clashMax: 0.8,
}

export const COMBAT_PUSH = {
  powerBase: 8,
  powerScale: 0.5,
  powerDivisor: 100,
  staminaDecayPerTap: 0.05,
  staminaMin: 0.25,
  staminaMax: 1,
  staminaRegenPerSecond: 0.35,
  foeRateMin: 1.8,
  foeRateMax: 4.2,
  foeStaminaDrain: 0.12,
  foeStaminaRegenPerSecond: 0.3,
  foeStaminaMin: 0.3,
  clashMin: 0.05,
  clashMax: 0.95,
  durationLimit: 6,
  endHigh: 0.9,
  endLow: 0.1,
}

export const COMBAT_FINAL = {
  attackerZoneMin: 0.14,
  attackerZoneMax: 0.34,
  defenderZoneMin: 0.16,
  defenderZoneMax: 0.09,
  winWidthZoneDivisor: 300,
  zoneAtMin: 0.32,
  zoneAtMax: 0.68,
  speedMin: 1.4,
  speedMax: 2.2,
  speedSkillScale: 0.5,
  speedSkillBase: 0.3,
}

export const COMBAT_AI = {
  aimToleranceEasy: 0.2,
  aimTolerancePro: 0.03,
  spectatorPushRateMin: 1.9,
  spectatorPushRateMax: 4.3,
  opponentPushRateMin: 1.8,
  opponentPushRateMax: 4.2,
  finalCommitBase: 0.1,
  finalCommitSkillScale: 0.85,
}

export const COMBAT_TIMING = {
  introDuration: 1.15,
  lockCursorSpeed: 1.1,
  lockDelay: 0.6,
  autoTapTimeout: 4.5,
  throwDuration: 1.1,
  finalCommitDelay: 0.9,
}
