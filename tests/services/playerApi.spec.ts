import { afterEach, describe, expect, it, vi } from 'vitest'
import { load, register, reportMatch } from '@/services/api/playerApi'
import { ping } from '@/services/api/leaderboardApi'

function captureFetch(body: unknown, ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, status, json: () => Promise.resolve(body) })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function sentBody(fetchMock: ReturnType<typeof vi.fn>) {
  return JSON.parse(fetchMock.mock.calls[0][1].body)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('playerApi', () => {
  it('posts a register action to the player endpoint', async () => {
    const fetchMock = captureFetch({ ok: true, returning: false, player: {}, bull: null })
    const result = await register({ username: 'Ansem', avatar: 'ansem', bullName: 'Toro', element: 'fire' })
    expect(result.status).toBe('ok')
    expect(fetchMock.mock.calls[0][0]).toBe('/api/player.php')
    expect(sentBody(fetchMock)).toEqual({
      action: 'register',
      username: 'Ansem',
      avatar: 'ansem',
      bullName: 'Toro',
      element: 'fire',
    })
  })

  it('translates match input to the snake_case server fields', async () => {
    const fetchMock = captureFetch({ ok: true, player: {}, rating_delta: 12 })
    await reportMatch({
      token: 't',
      result: 'win',
      opponent: 'Grimhoof',
      goldDelta: 30,
      xpDelta: 9,
      tokenDelta: 1,
      bull: { name: 'x', element: 'fire', level: 1, xp: 0, tier: 0, gear: [], traits: [], mythic: 0 },
    })
    expect(sentBody(fetchMock)).toMatchObject({
      action: 'match',
      token: 't',
      result: 'win',
      opponent: 'Grimhoof',
      gold_delta: 30,
      xp_delta: 9,
      tok_delta: 1,
    })
  })

  it('returns offline when the server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect((await load('t')).status).toBe('offline')
  })
})

describe('leaderboardApi.ping', () => {
  it('is true only when the server responds ok', async () => {
    captureFetch({ ok: true, leaderboard: [] })
    expect(await ping()).toBe(true)
  })

  it('is false when offline', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await ping()).toBe(false)
  })
})
