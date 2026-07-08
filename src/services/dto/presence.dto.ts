export interface PresencePayload {
  username: string
  avatar: string
  x: number
  y: number
  map: string
}

export interface RemotePlayerDto {
  username: string
  avatar: string
  x: number
  y: number
}

export interface PresenceResponseDto {
  ok: boolean
  players?: RemotePlayerDto[]
  online?: number
  time?: number
}
