export interface FarmDto {
  plot: number
  username: string
  avatar: string
  capacity: number
  bulls: number
}

export interface FarmListResponseDto {
  ok: boolean
  farms?: FarmDto[]
}
