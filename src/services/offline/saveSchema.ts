import { z } from 'zod'
import type { Player } from '@/domain/models/player'
import type { Quest } from '@/domain/quests'

const bullSchema = z.object({
  name: z.string(),
  element: z.enum(['fire', 'bolt', 'shadow']),
  level: z.number(),
  xp: z.number(),
  gear: z.array(z.string()),
  traits: z.array(z.string()),
  mythic: z.boolean(),
})

const playerSchema = z.object({
  account: z.object({ username: z.string(), avatar: z.string(), token: z.string() }),
  wallet: z.object({ address: z.string().nullable(), status: z.enum(['none', 'unverified', 'linked']) }),
  usernameChanged: z.boolean(),
  currency: z.object({ gold: z.number(), chargeToken: z.number() }),
  record: z.object({ wins: z.number(), losses: z.number(), rating: z.number() }),
  activeBull: bullSchema,
  storedBulls: z.array(bullSchema),
  farm: z.object({ plotIndex: z.number().nullable(), capacity: z.number(), lastClaimAt: z.number() }),
})

const questSchema = z.object({
  id: z.string(),
  type: z.enum(['win', 'breed', 'collect', 'bet', 'spectate']),
  target: z.number(),
  descriptionTemplate: z.string(),
  reward: z.object({ gold: z.number(), token: z.number().optional() }),
  progress: z.number(),
  claimed: z.boolean(),
})

const questsSchema = z.object({
  resetDate: z.string(),
  dailyList: z.array(questSchema),
})

const persistedStateSchema = z.object({
  player: playerSchema.nullable(),
  tutorialDone: z.boolean(),
  quests: questsSchema.optional(),
})

export const CURRENT_SCHEMA_VERSION = 3

export const saveEnvelopeSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  data: persistedStateSchema,
})

export interface PersistedQuests {
  resetDate: string
  dailyList: Quest[]
}

export interface PersistedState {
  player: Player | null
  tutorialDone: boolean
  quests?: PersistedQuests
}
