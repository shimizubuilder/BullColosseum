import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayerStore } from '@/stores/usePlayerStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

async function registered() {
  const player = usePlayerStore()
  await player.register({ username: 'A', avatar: 'ansem', bullName: 'T', element: 'fire' })
  return player
}

function setGold(player: Awaited<ReturnType<typeof registered>>, gold: number): void {
  if (player.player) {
    player.player.currency.gold = gold
  }
}

describe('trainBull', () => {
  it('spends gold and grants xp', async () => {
    const player = await registered()
    expect(player.trainBull()).toBe(true)
    expect(player.player?.currency.gold).toBe(32)
    expect(player.player?.activeBull.level).toBe(2)
  })

  it('refuses when gold is short', async () => {
    const player = await registered()
    setGold(player, 5)
    expect(player.trainBull()).toBe(false)
    expect(player.player?.currency.gold).toBe(5)
  })
})

describe('buyGear', () => {
  it('buys affordable gear and equips it', async () => {
    const player = await registered()
    setGold(player, 100)
    expect(player.buyGear('iron_horn')).toBe(true)
    expect(player.player?.activeBull.gear).toContain('iron_horn')
    expect(player.player?.currency.gold).toBe(20)
  })

  it('refuses a duplicate or an unaffordable token item', async () => {
    const player = await registered()
    setGold(player, 100)
    player.buyGear('iron_horn')
    expect(player.buyGear('iron_horn')).toBe(false)
    expect(player.buyGear('war_crown')).toBe(false)
  })
})

describe('convertVault', () => {
  it('mints tokens with a five percent burn', async () => {
    const player = await registered()
    setGold(player, 1000)
    expect(player.convertVault(0.5)).toBe(4)
    expect(player.player?.currency.gold).toBe(500)
    expect(player.player?.currency.chargeToken).toBe(4)
  })

  it('does nothing below the minimum conversion', async () => {
    const player = await registered()
    setGold(player, 50)
    expect(player.convertVault(0.5)).toBe(0)
    expect(player.player?.currency.gold).toBe(50)
  })
})
