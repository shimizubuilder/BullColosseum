import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useFarmStore } from '@/stores/useFarmStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { createLocalPlayer } from '@/services/offline/OfflineOracle'
import type { Player } from '@/domain/models/player'

const input = { username: 'Ansem', avatar: 'red', bullName: 'Toro', element: 'fire' }

function setup(gold = 500): { player: ReturnType<typeof usePlayerStore>; account: Player } {
  setActivePinia(createPinia())
  const player = usePlayerStore()
  player.setPlayer(createLocalPlayer(input, 'local-x'))
  const account = player.player as Player
  account.currency.gold = gold
  return { player, account }
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('buyPlot', () => {
  it('buys a plot, spends its price, and blocks a second purchase', () => {
    const { player, account } = setup(200)
    expect(player.buyPlot(3)).toBe(true)
    expect(account.farm.plotIndex).toBe(3)
    expect(account.currency.gold).toBe(50)
    expect(player.buyPlot(4)).toBe(false)
  })

  it('refuses when the player cannot afford it', () => {
    const { player } = setup(100)
    expect(player.buyPlot(1)).toBe(false)
  })
})

describe('collectFarm', () => {
  it('pays out capped passive earnings from resting bulls', () => {
    const { player, account } = setup()
    player.buyPlot(0)
    account.storedBulls.push({ name: 'Rester', element: 'fire', level: 6, xp: 0, gear: [], traits: [], mythic: false })
    account.farm.lastClaimAt = Date.now() - 3_600_000
    const goldBefore = account.currency.gold
    const earned = player.collectFarm()
    expect(earned).toBeGreaterThan(0)
    expect(account.currency.gold).toBe(goldBefore + earned)
  })
})

describe('buyCalf and breed', () => {
  it('buys a calf into the pen', () => {
    const { player, account } = setup()
    player.buyPlot(0)
    const goldBefore = account.currency.gold
    expect(player.buyCalf()).not.toBeNull()
    expect(account.storedBulls).toHaveLength(1)
    expect(account.currency.gold).toBeLessThan(goldBefore)
  })

  it('breeds two distinct bulls into a calf and rejects a self-pairing', () => {
    const { player, account } = setup()
    player.buyPlot(0)
    player.buyCalf()
    expect(player.breed(0, 0)).toBeNull()
    const calf = player.breed(0, 1)
    expect(calf).not.toBeNull()
    expect(account.storedBulls).toHaveLength(2)
  })
})

describe('useFarmStore', () => {
  it('marks the player-owned plot as mine when loading offline', async () => {
    const { player } = setup()
    useSessionStore().setOnline(false)
    player.buyPlot(2)
    const farm = useFarmStore()
    await farm.load()
    expect(farm.farmsByPlot[2]?.mine).toBe(true)
  })
})
