import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSceneStore } from '@/stores/useSceneStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useSceneStore', () => {
  it('starts at the boot scene', () => {
    const scene = useSceneStore()
    expect(scene.current).toBe('boot')
    expect(scene.overlay).toBeNull()
  })

  it('navigates and records the previous scene, clearing any overlay', () => {
    const scene = useSceneStore()
    scene.goto('login')
    scene.openOverlay('shop')
    expect(scene.overlay).toBe('shop')
    scene.goto('world')
    expect(scene.current).toBe('world')
    expect(scene.previous).toBe('login')
    expect(scene.overlay).toBeNull()
  })

  it('opens and closes overlays without changing the scene', () => {
    const scene = useSceneStore()
    scene.goto('world')
    scene.openOverlay('stable')
    expect(scene.current).toBe('world')
    expect(scene.overlay).toBe('stable')
    scene.closeOverlay()
    expect(scene.overlay).toBeNull()
  })
})
