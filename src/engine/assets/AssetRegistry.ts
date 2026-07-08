import { Assets, Texture } from 'pixi.js'
import { PlaceholderFactory } from './PlaceholderFactory'
import { parseAssetManifest, type SpriteAsset, type SpriteKey } from './assetManifest'

export interface LoadedSprite {
  texture: Texture
  asset: SpriteAsset
}

export class AssetRegistry {
  readonly placeholder = new PlaceholderFactory()
  private readonly sprites = new Map<SpriteKey, LoadedSprite>()

  async load(manifestUrl = 'assets/manifest.json'): Promise<void> {
    let raw: unknown
    try {
      raw = await Assets.load({ src: manifestUrl, loadParser: 'loadJson' })
    } catch {
      return
    }
    const manifest = parseAssetManifest(raw)
    if (!manifest) {
      return
    }
    await Promise.all(
      manifest.sprites.map(async (asset) => {
        try {
          const texture = await Assets.load<Texture>(asset.src)
          texture.source.scaleMode = 'nearest'
          this.sprites.set(asset.key, { texture, asset })
        } catch {
          console.warn(`[assets] missing sprite ${asset.key} at ${asset.src}, using placeholder`)
        }
      }),
    )
  }

  sprite(key: SpriteKey): LoadedSprite | null {
    return this.sprites.get(key) ?? null
  }
}
