export interface BullDto {
  id?: number
  name: string
  element: string
  level: number
  xp: number
  tier: number
  gear: string[]
  traits: string[]
  mythic: number
}

export interface StoredBullDto {
  name?: string
  element?: string
  elem?: string
  level?: number
  lv?: number
  xp?: number
  gear?: string[]
  traits?: string[]
  mythic?: number | boolean
}

export interface PlayerDto {
  id: number
  username: string
  avatar: string
  gold: number
  chargetoken: number
  wins: number
  losses: number
  rating: number
  wallet: string | null
  wallet_status: string
  username_changed: number
  farm_plot: number | null
  farm_capacity: number
  stored_bulls: StoredBullDto[]
  farm_claim: number
  token?: string
}

export interface PlayerSavePayload {
  action: 'save'
  token: string
  gold: number
  chargetoken: number
  bull: BullDto
  farm_plot: number | null
  farm_capacity: number
  stored_bulls: StoredBullDto[]
  farm_claim: number
}
