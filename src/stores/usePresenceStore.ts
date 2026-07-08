import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface RemoteActorSnapshot {
  username: string
  avatar: string
  x: number
  y: number
}

export const usePresenceStore = defineStore('presence', () => {
  const remotePlayers = ref<RemoteActorSnapshot[]>([])
  const onlineCount = ref(1)
  const serverOffset = ref(0)
  const lastHeartbeatAt = ref(0)

  function setRemotePlayers(players: RemoteActorSnapshot[]): void {
    remotePlayers.value = players
  }

  function setOnlineCount(count: number): void {
    onlineCount.value = count
  }

  function setServerOffset(offsetMs: number): void {
    serverOffset.value = offsetMs
  }

  function markHeartbeat(timestamp: number): void {
    lastHeartbeatAt.value = timestamp
  }

  return {
    remotePlayers,
    onlineCount,
    serverOffset,
    lastHeartbeatAt,
    setRemotePlayers,
    setOnlineCount,
    setServerOffset,
    markHeartbeat,
  }
})
