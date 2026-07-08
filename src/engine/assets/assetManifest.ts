import { z } from 'zod'

export const SPRITE_KEYS = [
  'building.colosseum',
  'building.stable',
  'building.shop',
  'building.vault',
  'building.leaderboard',
  'building.quests',
  'portal.farm',
  'portal.main',
  'prop.tree',
  'prop.rock',
  'prop.bush',
  'prop.hay',
] as const

export type SpriteKey = (typeof SPRITE_KEYS)[number]

const spriteAssetSchema = z.object({
  key: z.enum(SPRITE_KEYS),
  src: z.string().min(1),
  screenWidth: z.number().positive().optional(),
  anchorX: z.number().min(0).max(1).default(0.5),
  anchorY: z.number().min(0).max(1).default(1),
})

const assetManifestSchema = z.object({
  version: z.literal(1),
  sprites: z.array(spriteAssetSchema),
})

export type SpriteAsset = z.infer<typeof spriteAssetSchema>
export type AssetManifest = z.infer<typeof assetManifestSchema>

export function parseAssetManifest(raw: unknown): AssetManifest | null {
  const result = assetManifestSchema.safeParse(raw)
  if (!result.success) {
    console.warn('[assets] invalid manifest, using placeholders', result.error.message)
    return null
  }
  return result.data
}
