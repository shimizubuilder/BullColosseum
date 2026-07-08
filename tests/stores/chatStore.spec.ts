import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChatStore } from '@/stores/useChatStore'
import { useSessionStore } from '@/stores/useSessionStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useChatStore', () => {
  it('seeds the offline chat when polling while offline', async () => {
    const chat = useChatStore()
    useSessionStore().setOnline(false)
    await chat.poll()
    expect(chat.mode).toBe('offline')
    expect(chat.messages.length).toBeGreaterThan(0)
  })

  it('appends a local message when sending offline', async () => {
    const chat = useChatStore()
    useSessionStore().setOnline(false)
    await chat.poll()
    const before = chat.messages.length
    await chat.send('charge!')
    expect(chat.messages.length).toBe(before + 1)
    expect(chat.messages[chat.messages.length - 1].message).toBe('charge!')
  })

  it('ignores an empty message', async () => {
    const chat = useChatStore()
    useSessionStore().setOnline(false)
    await chat.poll()
    const before = chat.messages.length
    await chat.send('   ')
    expect(chat.messages.length).toBe(before)
  })

  it('preserves live messages when an online poll hits a transient error', async () => {
    const chat = useChatStore()
    useSessionStore().setOnline(true)
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ ok: true, messages: [{ id: 1, username: 'A', avatar: 'ansem', message: 'hi' }] }),
        })
        .mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) }),
    )
    await chat.poll()
    expect(chat.messages).toHaveLength(1)
    await chat.poll()
    expect(chat.messages).toHaveLength(1)
    expect(chat.messages[0].message).toBe('hi')
  })

  it('caps the log at 60 messages', async () => {
    const chat = useChatStore()
    useSessionStore().setOnline(false)
    await chat.poll()
    for (let i = 0; i < 65; i += 1) {
      await chat.send(`m${i}`)
    }
    expect(chat.messages.length).toBe(60)
  })
})
