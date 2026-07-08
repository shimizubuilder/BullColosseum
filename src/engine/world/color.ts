function expand(hex: string): string {
  const raw = hex.replace('#', '')
  return raw.length === 3
    ? raw
        .split('')
        .map((char) => char + char)
        .join('')
    : raw
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, value | 0))
}

export function hexToNumber(hex: string): number {
  return parseInt(expand(hex), 16)
}

export function shade(hex: string, amount: number): number {
  const raw = expand(hex)
  const r = clampByte(parseInt(raw.slice(0, 2), 16) + amount)
  const g = clampByte(parseInt(raw.slice(2, 4), 16) + amount)
  const b = clampByte(parseInt(raw.slice(4, 6), 16) + amount)
  return (r << 16) | (g << 8) | b
}
