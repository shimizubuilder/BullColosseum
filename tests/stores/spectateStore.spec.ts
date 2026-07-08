import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSpectateStore } from '@/stores/useSpectateStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { createLocalPlayer } from '@/services/offline/OfflineOracle'
import type { Player } from '@/domain/models/player'

const input = { username: 'Ansem', avatar: 'red', bullName: 'Toro', element: 'fire' }
const ENTRIES = [
  { username: 'SolBull', rating: 1800 },
  { username: 'BlackHoof', rating: 1700 },
]

function setup(gold = 500): { player: ReturnType<typeof usePlayerStore>; account: Player } {
  setActivePinia(createPinia())
  useSessionStore().setOnline(false)
  const player = usePlayerStore()
  player.setPlayer(createLocalPlayer(input, 'local-x'))
  const account = player.player as Player
  account.currency.gold = gold
  return { player, account }
}

describe('useSpectateStore', () => {
  it('opens a live card with a fresh pairing and viewers', () => {
    setup()
    const spectate = useSpectateStore()
    spectate.begin(ENTRIES)
    expect(spectate.active).toBe(true)
    expect(spectate.pair).not.toBeNull()
    expect(spectate.viewers).toBeGreaterThan(0)
  })

  it('charges gold on a placed bet and pays out on a win', () => {
    const { account } = setup(500)
    const spectate = useSpectateStore()
    spectate.begin(ENTRIES)
    const stake = spectate.stake
    spectate.placeBet('a')
    expect(spectate.placed).toBe(true)
    expect(account.currency.gold).toBe(500 - stake)
    spectate.settle('a')
    expect(account.currency.gold).toBe(500 - stake + Math.round(stake * 1.9))
    expect(spectate.placed).toBe(false)
  })

  it('keeps the loss and refuses a second bet in the same match', () => {
    const { account } = setup(500)
    const spectate = useSpectateStore()
    spectate.begin(ENTRIES)
    const stake = spectate.stake
    spectate.placeBet('a')
    spectate.placeBet('b')
    expect(account.currency.gold).toBe(500 - stake)
    spectate.settle('b')
    expect(account.currency.gold).toBe(500 - stake)
  })
})
