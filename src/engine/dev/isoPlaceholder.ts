import { Container, Graphics } from 'pixi.js'
import { TILE_HEIGHT, TILE_WIDTH, tileToWorld, worldToScreen } from '@/engine/iso/isoMath'

const GRID_COLUMNS = 12
const GRID_ROWS = 12
const COLOR_TILE_LIGHT = 0x1b2129
const COLOR_TILE_DARK = 0x141a20
const COLOR_TILE_EDGE = 0x2a3540

export function renderIsoPlaceholder(stage: Container, viewportWidth: number, viewportHeight: number): Container {
  const world = new Container()
  world.position.set(viewportWidth / 2, viewportHeight / 2 - (GRID_ROWS * TILE_HEIGHT) / 2)

  for (let tileY = 0; tileY < GRID_ROWS; tileY += 1) {
    for (let tileX = 0; tileX < GRID_COLUMNS; tileX += 1) {
      const center = tileToWorld(tileX, tileY)
      const screen = worldToScreen(center.x, center.y)
      const isLight = (tileX + tileY) % 2 === 0

      const tile = new Graphics()
        .poly([
          screen.x,
          screen.y - TILE_HEIGHT / 2,
          screen.x + TILE_WIDTH / 2,
          screen.y,
          screen.x,
          screen.y + TILE_HEIGHT / 2,
          screen.x - TILE_WIDTH / 2,
          screen.y,
        ])
        .fill(isLight ? COLOR_TILE_LIGHT : COLOR_TILE_DARK)
        .stroke({ width: 1, color: COLOR_TILE_EDGE })

      world.addChild(tile)
    }
  }

  stage.addChild(world)
  return world
}
