import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessageDto } from '@/services/dto/chat.dto'
import * as chatApi from '@/services/api/chatApi'
import { seededChat } from '@/services/offline/OfflineOracle'
import { useSessionStore } from './useSessionStore'
import { usePlayerStore } from './usePlayerStore'

const MESSAGE_CAP = 60

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessageDto[]>([])
  const lastId = ref(0)
  const mode = ref<'online' | 'offline'>('offline')
  const minimized = ref(false)
  let seeded = false
  let polling = false

  function ingest(incoming: ChatMessageDto[]): void {
    const next = lastId.value === 0 ? incoming : [...messages.value, ...incoming]
    messages.value = next.slice(-MESSAGE_CAP)
    const latest = incoming[incoming.length - 1]
    if (latest?.id) {
      lastId.value = latest.id
    }
  }

  function pushLocal(message: ChatMessageDto): void {
    messages.value = [...messages.value, message].slice(-MESSAGE_CAP)
  }

  function ensureSeeded(): void {
    if (!seeded) {
      seeded = true
      messages.value = seededChat()
    }
  }

  async function poll(): Promise<void> {
    if (polling) {
      return
    }
    polling = true
    try {
      const session = useSessionStore()
      if (!session.online) {
        mode.value = 'offline'
        if (messages.value.length === 0) {
          ensureSeeded()
        }
        return
      }
      const result = await chatApi.poll(lastId.value)
      if (result.status === 'ok' && result.data.ok && result.data.messages) {
        mode.value = 'online'
        ingest(result.data.messages)
      } else if (result.status === 'offline') {
        mode.value = 'offline'
        if (messages.value.length === 0) {
          ensureSeeded()
        }
      }
    } finally {
      polling = false
    }
  }

  async function send(text: string): Promise<void> {
    const message = text.trim()
    if (!message) {
      return
    }
    const session = useSessionStore()
    const player = usePlayerStore()
    const username = player.player?.account.username ?? 'Player'
    const avatar = player.player?.account.avatar ?? 'ansem'
    if (session.online) {
      await chatApi.post(username, avatar, message)
      await poll()
    } else {
      pushLocal({ username, avatar, message })
    }
  }

  function toggleMinimized(): void {
    minimized.value = !minimized.value
  }

  return { messages, lastId, mode, minimized, poll, send, toggleMinimized }
})
