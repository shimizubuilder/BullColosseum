import { Container, Graphics, Text } from 'pixi.js'
import { BaseScene, type SceneContext } from '@/engine/scene/Scene'
import { lerp } from '@/domain/math'
import { ELEMENTS } from '@/domain/config/elements'
import { winWidth } from '@/domain/stats'
import { DuelDirector, type DuelFighter, type DuelSnapshot } from '@/engine/duel/DuelDirector'
import { BullSprite } from '@/engine/duel/BullSprite'

const VIRTUAL_WIDTH = 960
const VIRTUAL_HEIGHT = 540
const GROUND_Y = 430
const OUT_LEFT = 90
const OUT_RIGHT = VIRTUAL_WIDTH - 90

function clashPositionX(clash: number): number {
  return lerp(OUT_LEFT + 150, OUT_RIGHT - 150, clash)
}

function fallbackFighter(name: string): DuelFighter {
  return {
    name,
    element: 'fire',
    stats: { power: 20, defense: 20, speed: 20, stamina: 20, tier: 0, mythic: false },
    skill: 0.6,
  }
}

export class DuelScene extends BaseScene {
  readonly id = 'duel' as const

  private readonly stage = new Container()
  private readonly arena = new Graphics()
  private readonly hud = new Graphics()
  private readonly banner: Text
  private readonly meName: Text
  private readonly foeName: Text
  private readonly director: DuelDirector
  private readonly me: DuelFighter
  private readonly foe: DuelFighter
  private readonly meBull: BullSprite
  private readonly foeBull: BullSprite

  private meX = OUT_LEFT
  private foeX = OUT_RIGHT
  private meThrow = 0
  private foeThrow = 0
  private legPhase = 0
  private bannerTimer = 0
  private lastBanner = ''
  private tapCount = 0
  private ended = false

  private readonly handleKey = (event: KeyboardEvent): void => {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault()
      this.tapCount += 1
    }
  }

  private readonly handlePointer = (): void => {
    this.tapCount += 1
  }

  constructor(context: SceneContext) {
    super(context)
    const setup = context.duelSetup
    this.me = setup?.me ?? fallbackFighter('You')
    this.foe = setup?.foe ?? fallbackFighter('Rival')
    this.director = new DuelDirector(this.me, this.foe, Math.random, setup?.spectate ?? false)

    this.stage.addChild(this.arena)
    this.meBull = new BullSprite(ELEMENTS[this.me.element].primaryColor, 1)
    this.foeBull = new BullSprite(ELEMENTS[this.foe.element].primaryColor, -1)
    this.stage.addChild(this.foeBull.container)
    this.stage.addChild(this.meBull.container)
    this.stage.addChild(this.hud)

    this.meName = new Text({
      text: `▸ ${this.me.name}`,
      style: { fontFamily: 'Segoe UI, sans-serif', fontSize: 18, fontWeight: '800', fill: 0xffffff },
    })
    this.meName.position.set(24, 26)
    this.foeName = new Text({
      text: `${this.foe.name} ◂`,
      style: { fontFamily: 'Segoe UI, sans-serif', fontSize: 18, fontWeight: '800', fill: 0xff8a8a },
    })
    this.foeName.anchor.set(1, 0)
    this.foeName.position.set(VIRTUAL_WIDTH - 24, 26)
    this.banner = new Text({
      text: '',
      style: { fontFamily: 'Segoe UI, sans-serif', fontSize: 40, fontWeight: '900', fill: 0xffcf4a, stroke: { color: 0x000000, width: 6 } },
    })
    this.banner.anchor.set(0.5)
    this.banner.position.set(VIRTUAL_WIDTH / 2, 150)
    this.stage.addChild(this.meName)
    this.stage.addChild(this.foeName)
    this.stage.addChild(this.banner)

    this.drawArena()
    this.root.addChild(this.stage)
  }

  enter(): void {
    window.addEventListener('keydown', this.handleKey)
    this.context.app.canvas.addEventListener('pointerdown', this.handlePointer)
  }

  exit(): void {
    window.removeEventListener('keydown', this.handleKey)
    this.context.app.canvas.removeEventListener('pointerdown', this.handlePointer)
  }

  destroy(): void {
    this.exit()
    super.destroy()
  }

  fixedUpdate(fixedDt: number): void {
    const taps = this.tapCount
    this.tapCount = 0
    this.director.advance(fixedDt, taps)
    this.legPhase += fixedDt * 14

    const snapshot = this.director.snapshot()
    const centerX = clashPositionX(snapshot.clash)
    if (snapshot.phase === 'throw' || snapshot.phase === 'done') {
      const won = snapshot.outcome === 'win'
      if (won) {
        this.foeX += fixedDt * 900
        this.foeThrow += fixedDt * 6
      } else {
        this.meX -= fixedDt * 900
        this.meThrow += fixedDt * 6
      }
    } else {
      this.meX = lerp(this.meX, centerX - 72, fixedDt * 8)
      this.foeX = lerp(this.foeX, centerX + 72, fixedDt * 8)
    }

    if (snapshot.banner !== this.lastBanner) {
      this.lastBanner = snapshot.banner
      this.bannerTimer = 1.4
    }
    this.bannerTimer = Math.max(0, this.bannerTimer - fixedDt)

    if (this.director.finished && !this.ended) {
      this.ended = true
      this.context.bus.emit('duel:end', { won: snapshot.outcome === 'win' })
    }
  }

  render(): void {
    const width = this.context.app.screen.width
    const height = this.context.app.screen.height
    const scale = Math.min(width / VIRTUAL_WIDTH, height / VIRTUAL_HEIGHT)
    this.stage.scale.set(scale)
    this.stage.position.set((width - VIRTUAL_WIDTH * scale) / 2, (height - VIRTUAL_HEIGHT * scale) / 2)

    this.meBull.container.position.set(this.meX, GROUND_Y - this.meThrow * 40)
    this.meBull.setFacing(1)
    this.meBull.update(this.legPhase)
    this.foeBull.container.position.set(this.foeX, GROUND_Y - this.foeThrow * 40)
    this.foeBull.setFacing(-1)
    this.foeBull.update(this.legPhase)

    const snapshot = this.director.snapshot()
    this.drawHud(snapshot)
    this.banner.text = this.bannerTimer > 0 ? snapshot.banner : ''
  }

  private drawArena(): void {
    this.arena.clear()
    this.arena.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0x160d22)
    this.arena.rect(0, 300, VIRTUAL_WIDTH, 60).fill(0x0d0a16)
    this.arena.rect(0, 360, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - 360).fill(0x2f2218)
    for (const [x, direction] of [
      [OUT_LEFT, -1],
      [OUT_RIGHT, 1],
    ]) {
      this.arena
        .rect(direction < 0 ? 0 : x, 360, direction < 0 ? x : VIRTUAL_WIDTH - x, VIRTUAL_HEIGHT - 360)
        .fill({ color: 0xe23b47, alpha: 0.12 })
    }
  }

  private drawHud(snapshot: DuelSnapshot): void {
    const g = this.hud
    g.clear()

    const meColor = parseInt(ELEMENTS[this.me.element].primaryColor.replace('#', ''), 16)
    const barX = VIRTUAL_WIDTH / 2 - 180
    const barWidth = 360
    const split = barWidth * snapshot.clash
    g.roundRect(barX, 54, barWidth, 14, 7).fill(0x0d0a15)
    g.rect(barX, 54, split, 14).fill(meColor)
    g.rect(barX + split, 54, barWidth - split, 14).fill(0xe23b47)
    g.roundRect(barX, 54, barWidth, 14, 7).stroke({ width: 2, color: 0x332a45 })
    g.circle(barX + split, 61, 6).fill(0xffffff)

    if (snapshot.phase === 'lock') {
      this.drawTimingBar(snapshot.lock.cursor, winWidth(this.me.stats) / 100, snapshot.lock.locked)
    } else if (snapshot.phase === 'push') {
      const remaining = Math.max(0, 1 - snapshot.push.time / snapshot.push.limit)
      g.rect(VIRTUAL_WIDTH / 2 - 90, 486, 180, 10).fill(0x0d0a15)
      g.rect(VIRTUAL_WIDTH / 2 - 90, 486, 180 * remaining, 10).fill(remaining < 0.3 ? 0xe23b47 : 0xffcf4a)
      g.rect(VIRTUAL_WIDTH / 2 - 90, 500, 180 * snapshot.push.stamina, 6).fill(0x8affc0)
    } else if (snapshot.phase === 'final') {
      this.drawFinalBar(snapshot)
    }
  }

  private drawTimingBar(cursor: number, window: number, locked: boolean): void {
    const g = this.hud
    const y = 480
    const barX = VIRTUAL_WIDTH / 2 - 200
    const barWidth = 400
    const center = barX + barWidth * 0.5
    g.roundRect(barX, y, barWidth, 20, 10).fill(0x0d0a15).stroke({ width: 2, color: 0x332a45 })
    g.rect(center - barWidth * window * 1.9, y + 2, barWidth * window * 3.8, 16).fill({ color: 0xcfc3e6, alpha: 0.25 })
    g.rect(center - barWidth * window, y + 2, barWidth * window * 2, 16).fill({ color: 0x8affc0, alpha: 0.35 })
    g.rect(center - barWidth * window * 0.4, y + 2, barWidth * window * 0.8, 16).fill({ color: 0xffcf4a, alpha: 0.9 })
    const px = barX + barWidth * cursor
    g.rect(px - 2, y - 6, 4, 32).fill(locked ? 0xffffff : 0xff5566)
  }

  private drawFinalBar(snapshot: DuelSnapshot): void {
    const g = this.hud
    const y = 480
    const barX = VIRTUAL_WIDTH / 2 - 220
    const barWidth = 440
    g.roundRect(barX, y, barWidth, 22, 11).fill(0x0d0a15).stroke({ width: 2, color: 0x332a45 })
    const zoneColor = snapshot.attackerIsMe ? 0xffcf4a : 0x3fc9ff
    g.rect(barX + barWidth * (snapshot.final.zoneAt - snapshot.final.zone / 2), y + 2, barWidth * snapshot.final.zone, 18).fill(zoneColor)
    const px = barX + barWidth * snapshot.final.cursor
    g.rect(px - 2, y - 7, 4, 36).fill(0xffffff)
  }
}
