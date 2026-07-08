import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePresenceStore } from '@/stores/usePresenceStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('usePresenceStore', () => {
  it('holds remote players and the online count', () => {
    const presence = usePresenceStore()
    presence.setRemotePlayers([{ username: 'SolBull', avatar: 'red', x: 100, y: 200 }])
    presence.setOnlineCount(6)
    expect(presence.remotePlayers).toHaveLength(1)
    expect(presence.remotePlayers[0].username).toBe('SolBull')
    expect(presence.onlineCount).toBe(6)
  })

  it('tracks the server clock offset and last heartbeat time', () => {
    const presence = usePresenceStore()
    presence.setServerOffset(1500)
    presence.markHeartbeat(999)
    expect(presence.serverOffset).toBe(1500)
    expect(presence.lastHeartbeatAt).toBe(999)
  })
})
