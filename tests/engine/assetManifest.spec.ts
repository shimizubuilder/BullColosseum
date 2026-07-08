import { describe, expect, it, vi } from 'vitest'
import { parseAssetManifest, SPRITE_KEYS } from '@/engine/assets/assetManifest'

describe('parseAssetManifest', () => {
  it('accepts a valid manifest and applies anchor defaults', () => {
    const manifest = parseAssetManifest({
      version: 1,
      sprites: [{ key: 'building.stable', src: 'assets/sprites/stable.png' }],
    })
    expect(manifest?.sprites[0]).toMatchObject({ anchorX: 0.5, anchorY: 1 })
  })

  it('rejects unknown sprite keys', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const manifest = parseAssetManifest({
      version: 1,
      sprites: [{ key: 'building.castle', src: 'x.png' }],
    })
    expect(manifest).toBeNull()
    warn.mockRestore()
  })

  it('rejects a wrong version and malformed shapes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(parseAssetManifest({ version: 2, sprites: [] })).toBeNull()
    expect(parseAssetManifest({ sprites: {} })).toBeNull()
    expect(parseAssetManifest(null)).toBeNull()
    warn.mockRestore()
  })

  it('covers every building, portal, and prop the maps reference', () => {
    for (const key of ['building.colosseum', 'portal.farm', 'portal.main', 'prop.tree', 'prop.hay']) {
      expect(SPRITE_KEYS).toContain(key)
    }
  })
})
