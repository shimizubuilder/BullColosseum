export interface ClockCallbacks {
  fixedUpdate: (fixedDt: number) => void
  render: (alpha: number) => void
}

export class Clock {
  private accumulator = 0

  constructor(
    private readonly fixedDt = 1 / 60,
    private readonly maxFrameSeconds = 0.05,
  ) {}

  advance(deltaSeconds: number, callbacks: ClockCallbacks): void {
    const frame = Math.min(Math.max(deltaSeconds, 0), this.maxFrameSeconds)
    this.accumulator += frame
    while (this.accumulator >= this.fixedDt) {
      callbacks.fixedUpdate(this.fixedDt)
      this.accumulator -= this.fixedDt
    }
    callbacks.render(this.accumulator / this.fixedDt)
  }

  reset(): void {
    this.accumulator = 0
  }
}
