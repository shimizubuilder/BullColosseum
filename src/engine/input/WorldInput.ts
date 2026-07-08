export interface Axis {
  x: number
  y: number
}

export interface PointerTarget {
  x: number
  y: number
}

function isTextEntry(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export class WorldInput {
  private readonly pressed = new Set<string>()
  private pointerTarget: PointerTarget | null = null
  private enterQueued = false

  constructor(private readonly canvas: HTMLCanvasElement) {}

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (isTextEntry(event.target)) {
      return
    }
    const key = event.key.toLowerCase()
    this.pressed.add(key)
    if (key === 'e') {
      this.enterQueued = true
    }
  }

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    this.pressed.delete(event.key.toLowerCase())
  }

  private readonly handlePointer = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect()
    this.pointerTarget = { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  attach(): void {
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    this.canvas.addEventListener('pointerdown', this.handlePointer)
  }

  detach(): void {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    this.canvas.removeEventListener('pointerdown', this.handlePointer)
    this.pressed.clear()
    this.pointerTarget = null
    this.enterQueued = false
  }

  axis(): Axis {
    let x = 0
    let y = 0
    if (this.pressed.has('a') || this.pressed.has('arrowleft')) {
      x -= 1
    }
    if (this.pressed.has('d') || this.pressed.has('arrowright')) {
      x += 1
    }
    if (this.pressed.has('w') || this.pressed.has('arrowup')) {
      y -= 1
    }
    if (this.pressed.has('s') || this.pressed.has('arrowdown')) {
      y += 1
    }
    return { x, y }
  }

  consumePointer(): PointerTarget | null {
    const target = this.pointerTarget
    this.pointerTarget = null
    return target
  }

  consumeEnter(): boolean {
    const queued = this.enterQueued
    this.enterQueued = false
    return queued
  }
}
