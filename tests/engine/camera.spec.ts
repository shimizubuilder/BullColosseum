import { describe, expect, it } from 'vitest'
import type { Container } from 'pixi.js'
import { Camera } from '@/engine/core/Camera'

interface CapturedContainer {
  container: Container
  scale: number[]
  position: [number, number][]
}

function stubContainer(): CapturedContainer {
  const scale: number[] = []
  const position: [number, number][] = []
  const container = {
    scale: { set: (value: number) => scale.push(value) },
    position: { set: (x: number, y: number) => position.push([x, y]) },
  } as unknown as Container
  return { container, scale, position }
}

describe('Camera', () => {
  it('centers the world on screen with integer-snapped translation', () => {
    const camera = new Camera()
    camera.centerOn(10.4, 5.2)
    const stub = stubContainer()
    camera.applyTo(stub.container, 800, 600)
    expect(stub.scale).toEqual([1])
    expect(stub.position).toEqual([[390, 295]])
  })

  it('rounds zoom to an integer and never below one', () => {
    const camera = new Camera()
    camera.zoom = 1.7
    camera.centerOn(10.4, 0)
    const stub = stubContainer()
    camera.applyTo(stub.container, 800, 600)
    expect(stub.scale).toEqual([2])
    expect(stub.position).toEqual([[379, 300]])
  })

  it('clamps sub-unit zoom up to one', () => {
    const camera = new Camera()
    camera.zoom = 0.3
    const stub = stubContainer()
    camera.applyTo(stub.container, 800, 600)
    expect(stub.scale).toEqual([1])
  })
})
