import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const KNOWN_KEYS = new Set([
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
  'tile.grass',
  'tile.grass_alt',
  'tile.road',
  'tile.plaza',
  'tile.sand',
  'tile.farm_soil',
  'bull.fire',
  'bull.bolt',
  'bull.shadow',
  'duel.stands',
  'duel.sand',
  'duel.gate',
])

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const manifestPath = join(publicDir, 'assets', 'manifest.json')

if (!existsSync(manifestPath)) {
  console.log('[assets] no manifest, building on placeholders')
  process.exit(0)
}

const errors = []
let manifest
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
} catch (error) {
  console.error(`[assets] manifest is not valid JSON: ${error.message}`)
  process.exit(1)
}

if (manifest.version !== 1) {
  errors.push(`unsupported manifest version ${manifest.version}`)
}
if (!Array.isArray(manifest.sprites)) {
  errors.push('manifest.sprites must be an array')
} else {
  const seen = new Set()
  for (const sprite of manifest.sprites) {
    const label = sprite?.key ?? '<missing key>'
    if (!KNOWN_KEYS.has(sprite?.key)) {
      errors.push(`unknown sprite key "${label}"`)
      continue
    }
    if (seen.has(sprite.key)) {
      errors.push(`duplicate sprite key "${label}"`)
    }
    seen.add(sprite.key)
    if (typeof sprite.src !== 'string' || sprite.src.length === 0) {
      errors.push(`sprite "${label}" has no src`)
    } else if (!existsSync(join(publicDir, sprite.src.replace(/^\//, '')))) {
      errors.push(`sprite "${label}" src not found: ${sprite.src}`)
    }
    if (sprite.screenWidth !== undefined && !(typeof sprite.screenWidth === 'number' && sprite.screenWidth > 0)) {
      errors.push(`sprite "${label}" screenWidth must be a positive number`)
    }
    for (const anchor of ['anchorX', 'anchorY']) {
      const value = sprite[anchor]
      if (value !== undefined && !(typeof value === 'number' && value >= 0 && value <= 1)) {
        errors.push(`sprite "${label}" ${anchor} must be within [0, 1]`)
      }
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[assets] ${error}`)
  }
  process.exit(1)
}
console.log(`[assets] manifest ok (${manifest.sprites.length} sprites)`)
