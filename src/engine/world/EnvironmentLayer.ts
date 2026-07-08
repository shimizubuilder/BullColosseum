import { Container, Graphics } from 'pixi.js'
import { timeOfDay, weatherNow, type TimeOfDay, type Weather } from './dayNight'

export class EnvironmentLayer {
  readonly background = new Container()
  readonly foreground = new Container()
  private readonly sky = new Graphics()
  private readonly tint = new Graphics()
  private readonly weather = new Graphics()

  constructor() {
    this.background.addChild(this.sky)
    this.foreground.addChild(this.tint)
    this.foreground.addChild(this.weather)
  }

  update(nowMs: number, width: number, height: number): void {
    const time = timeOfDay(nowMs)
    this.drawSky(time, width, height)
    this.drawTint(time, width, height)
    this.drawWeather(weatherNow(nowMs), nowMs, width, height)
  }

  private drawSky(time: TimeOfDay, width: number, height: number): void {
    this.sky.clear()
    if (time.daylight < 0.55) {
      const nightAlpha = (0.55 - time.daylight) / 0.55
      for (let i = 0; i < 70; i += 1) {
        const alpha = nightAlpha * (0.25 + ((i * 57) % 50) / 100)
        this.sky.rect((i * 149) % width, (i * 83) % Math.floor(height * 0.5), 2, 2).fill({ color: 0xffffff, alpha })
      }
    }
    if (time.t > 0.22 && time.t < 0.78) {
      const f = (time.t - 0.22) / 0.56
      this.sky.circle(width * f, height * 0.5 - Math.sin(f * Math.PI) * height * 0.42, 22).fill(0xffe08a)
    } else {
      const f = time.t >= 0.78 ? (time.t - 0.78) / 0.44 : (time.t + 0.22) / 0.44
      const moonX = width * f
      const moonY = height * 0.46 - Math.sin(f * Math.PI) * height * 0.36
      this.sky.circle(moonX, moonY, 17).fill(0xe6ecff)
      this.sky.circle(moonX + 7, moonY - 4, 14).fill(0x0a0710)
    }
  }

  private drawTint(time: TimeOfDay, width: number, height: number): void {
    this.tint.clear()
    const overlay = time.overlay
    if (overlay.a > 0.01) {
      const color = (overlay.r << 16) | (overlay.g << 8) | overlay.b
      this.tint.rect(0, 0, width, height).fill({ color, alpha: overlay.a })
    }
  }

  private drawWeather(weather: Weather, nowMs: number, width: number, height: number): void {
    this.weather.clear()
    if (weather.type === 'clear' || weather.intensity <= 0.02) {
      return
    }
    if (weather.type === 'cloudy') {
      this.weather.rect(0, 0, width, height).fill({ color: 0x282c3c, alpha: 0.16 * weather.intensity })
      return
    }
    const storm = weather.type === 'storm'
    const seconds = nowMs / 1000
    const drops = Math.floor((storm ? 240 : 130) * weather.intensity)
    for (let i = 0; i < drops; i += 1) {
      const x = ((i * 137 + seconds * (storm ? 920 : 600)) % (width + 120)) - 60
      const y = ((i * 83 + seconds * (storm ? 1400 : 950)) % (height + 120)) - 60
      const length = storm ? 18 : 12
      this.weather
        .moveTo(x, y)
        .lineTo(x - 6, y + length)
        .stroke({ width: storm ? 2 : 1, color: 0xafc3eb, alpha: 0.35 * weather.intensity })
    }
    this.weather.rect(0, 0, width, height).fill({ color: 0x12182a, alpha: 0.24 * weather.intensity })
  }

  destroy(): void {
    this.background.destroy({ children: true })
    this.foreground.destroy({ children: true })
  }
}
