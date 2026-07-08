import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChatStore } from '@/stores/useChatStore'
import { useSessionStore } from '@/stores/useSessionStore'

beforeEach(() => {
  setActivePinia(createPinia())
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
