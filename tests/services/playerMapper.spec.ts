import { describe, expect, it } from 'vitest'
import { bullFromDto, bullFromStoredDto, bullToPayload } from '@/services/mappers/bullMapper'
import { playerFromDto, playerToSavePayload } from '@/services/mappers/playerMapper'
import type { PlayerDto } from '@/services/dto/player.dto'
import type { Player } from '@/domain/models/player'

describe('bullMapper', () => {
  it('maps an active-bull DTO to the domain shape', () => {
    expect(
      bullFromDto({
        name: 'Onyx',
        element: 'shadow',
        level: 5,
        xp: 3,
        tier: 1,
        gear: ['iron_horn'],
        traits: ['alpha'],
        mythic: 1,
      }),
    ).toEqual({
      name: 'Onyx',
      element: 'shadow',
      level: 5,
      xp: 3,
      gear: ['iron_horn'],
      traits: ['alpha'],
      mythic: true,
    })
  })

  it('reads the legacy stored shape (elem / lv)', () => {
    expect(bullFromStoredDto({ name: 'Calf 5', elem: 'bolt', lv: 7, xp: 2 })).toMatchObject({
      element: 'bolt',
      level: 7,
      xp: 2,
    })
  })

  it('reads the clean stored shape (element / level)', () => {
    expect(bullFromStoredDto({ name: 'Calf 9', element: 'fire', level: 3 })).toMatchObject({
      element: 'fire',
      level: 3,
    })
  })

  it('falls back to fire for an unknown element', () => {
    expect(bullFromStoredDto({ name: 'X', elem: 'water', lv: 2 }).element).toBe('fire')
  })

  it('serializes a bull with a computed tier and integer mythic flag', () => {
    const payload = bullToPayload({
      name: 'Blackhoof',
      element: 'fire',
      level: 10,
      xp: 0,
      gear: [],
      traits: [],
      mythic: true,
    })
    expect(payload).toEqual({
      name: 'Blackhoof',
      element: 'fire',
      level: 10,
      xp: 0,
      tier: 3,
      gear: [],
      traits: [],
      mythic: 1,
    })
  })
})

const serverPlayer: PlayerDto = {
  id: 7,
  username: 'Ansem',
  avatar: 'ansem',
  gold: 240,
  chargetoken: 5,
  wins: 12,
  losses: 4,
  rating: 1180,
  wallet: 'So1anaAddr',
  wallet_status: 'linked',
  username_changed: 1,
  farm_plot: 3,
  farm_capacity: 4,
  stored_bulls: [{ name: 'Calf 1', elem: 'shadow', lv: 4, xp: 1 }],
  farm_claim: 1_700_000_000,
  token: 'server-token-abc',
}

describe('playerMapper', () => {
  it('maps a server player DTO to the domain shape with renamed fields', () => {
    const player = playerFromDto(serverPlayer, {
      name: 'Toro',
      element: 'fire',
      level: 6,
      xp: 2,
      tier: 2,
      gear: [],
      traits: [],
      mythic: 0,
    })
    expect(player.account).toEqual({ username: 'Ansem', avatar: 'ansem', token: 'server-token-abc' })
    expect(player.currency).toEqual({ gold: 240, chargeToken: 5 })
    expect(player.wallet).toEqual({ address: 'So1anaAddr', status: 'linked' })
    expect(player.usernameChanged).toBe(true)
    expect(player.farm).toEqual({ plotIndex: 3, capacity: 4, lastClaimAt: 1_700_000_000 })
    expect(player.activeBull.level).toBe(6)
    expect(player.storedBulls).toHaveLength(1)
    expect(player.storedBulls[0]).toMatchObject({ element: 'shadow', level: 4 })
  })

  it('uses the default Toro when the server sends no active bull', () => {
    const player = playerFromDto(serverPlayer, null)
    expect(player.activeBull).toEqual({
      name: 'Toro',
      element: 'fire',
      level: 1,
      xp: 0,
      gear: [],
      traits: [],
      mythic: false,
    })
  })

  it('serializes back to the save payload with the server field names', () => {
    const player: Player = playerFromDto(serverPlayer, null)
    const payload = playerToSavePayload(player)
    expect(payload.action).toBe('save')
    expect(payload.token).toBe('server-token-abc')
    expect(payload.chargetoken).toBe(5)
    expect(payload.farm_plot).toBe(3)
    expect(payload.farm_capacity).toBe(4)
    expect(payload.farm_claim).toBe(1_700_000_000)
    expect(payload.stored_bulls[0]).toMatchObject({ element: 'shadow', level: 4 })
    expect(payload.bull.tier).toBe(0)
  })
})
