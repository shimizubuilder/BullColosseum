import { describe, expect, it } from 'vitest'
import { canTransition } from '@/engine/scene/transitionTable'

describe('canTransition', () => {
  it('allows any first scene from the null initial state', () => {
    expect(canTransition(null, 'login')).toBe(true)
    expect(canTransition(null, 'overworld')).toBe(true)
  })

  it('rejects a self-transition', () => {
    expect(canTransition('overworld', 'overworld')).toBe(false)
  })

  it('permits declared edges', () => {
    expect(canTransition('login', 'overworld')).toBe(true)
    expect(canTransition('overworld', 'farm')).toBe(true)
    expect(canTransition('farm', 'overworld')).toBe(true)
  })

  it('blocks undeclared edges', () => {
    expect(canTransition('login', 'duel')).toBe(false)
    expect(canTransition('login', 'farm')).toBe(false)
  })
})
