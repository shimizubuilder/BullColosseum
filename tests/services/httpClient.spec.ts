import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiGet, apiPost } from '@/services/http/httpClient'

function mockFetch(response: { ok?: boolean; status?: number; body: unknown }) {
  return vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: () => Promise.resolve(response.body),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('httpClient', () => {
  it('returns server data on a successful response', async () => {
    vi.stubGlobal('fetch', mockFetch({ body: { ok: true, value: 1 } }))
    const result = await apiGet<{ ok: boolean; value: number }>('leaderboard.php')
    expect(result).toEqual({ status: 'ok', data: { ok: true, value: 1 }, source: 'server' })
  })

  it('treats a db_unavailable body as offline', async () => {
    vi.stubGlobal('fetch', mockFetch({ body: { ok: false, error: 'db_unavailable' } }))
    expect(await apiGet('leaderboard.php')).toEqual({ status: 'offline' })
  })

  it('returns offline when the request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    expect(await apiPost('player.php', { action: 'load' })).toEqual({ status: 'offline' })
  })

  it('returns an error result for a non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch({ ok: false, status: 500, body: { ok: false } }))
    expect(await apiGet('player.php')).toEqual({ status: 'error', code: 500 })
  })
})
