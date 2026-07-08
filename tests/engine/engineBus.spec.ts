import { describe, expect, it } from 'vitest'
import { EngineBus } from '@/engine/core/EngineBus'

describe('EngineBus', () => {
  it('delivers an emitted payload to a subscriber', () => {
    const bus = new EngineBus()
    const received: string[] = []
    bus.on('transition:end', (payload) => received.push(payload.to))
    bus.emit('transition:end', { to: 'overworld' })
    expect(received).toEqual(['overworld'])
  })

  it('stops delivery once a subscriber unsubscribes', () => {
    const bus = new EngineBus()
    let calls = 0
    const off = bus.on('transition:end', () => (calls += 1))
    bus.emit('transition:end', { to: 'login' })
    off()
    bus.emit('transition:end', { to: 'overworld' })
    expect(calls).toBe(1)
  })

  it('fans an event out to every subscriber', () => {
    const bus = new EngineBus()
    let a = 0
    let b = 0
    bus.on('transition:start', () => (a += 1))
    bus.on('transition:start', () => (b += 1))
    bus.emit('transition:start', { from: 'login', to: 'overworld' })
    expect([a, b]).toEqual([1, 1])
  })

  it('drops all subscribers on clear', () => {
    const bus = new EngineBus()
    let calls = 0
    bus.on('world:prompt', () => (calls += 1))
    bus.clear()
    bus.emit('world:prompt', { text: 'Enter Stable' })
    expect(calls).toBe(0)
  })
})
