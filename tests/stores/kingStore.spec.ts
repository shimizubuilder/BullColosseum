import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useKingStore } from '@/stores/useKingStore'
import { useSessionStore } from '@/stores/useSessionStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useKingStore offline', () => {
  it('seeds a bot king when refreshing while offline', async () => {
    useSessionStore().setOnline(false)
    const king = useKingStore()
    await king.refresh('Ansem')
    expect(king.state).not.toBeNull()
    expect(king.isMine).toBe(false)
    expect(king.bounty).toBeGreaterThan(0)
  })

  it('crowns the local player and marks the throne as mine', async () => {
    useSessionStore().setOnline(false)
    const king = useKingStore()
    await king.becomeKing({
      useServer: false,
      token: 'local-1',
      tier: 3,
      bull: { element: 'fire', level: 12, traits: [], mythic: false },
      username: 'Ansem',
      avatar: 'red',
    })
    expect(king.isMine).toBe(true)
    expect(king.state?.username).toBe('Ansem')
    expect(king.bounty).toBe(0)
  })
})

describe('useKingStore server payload', () => {
  it('maps a server king dto into domain state and flags ownership', () => {
    const king = useKingStore()
    king.applyServerKing(
      { username: 'SolBull', avatar: 'gold', tier: 4, since: 1000, bull: { elem: 'shadow', lv: 16, traits: ['alpha'], mythic: 1 } },
      2200,
      'SolBull',
    )
    expect(king.isMine).toBe(true)
    expect(king.state?.bull.element).toBe('shadow')
    expect(king.state?.bull.mythic).toBe(true)
    expect(king.holdSeconds).toBe(1200)
  })
})
