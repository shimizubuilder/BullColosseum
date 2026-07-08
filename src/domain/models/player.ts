import type { Bull } from './bull'

export type WalletStatus = 'none' | 'unverified' | 'linked'

export interface Wallet {
  address: string | null
  status: WalletStatus
}

export interface Currency {
  gold: number
  chargeToken: number
}

export interface PlayerRecord {
  wins: number
  losses: number
  rating: number
}

export interface FarmState {
  plotIndex: number | null
  capacity: number
  lastClaimAt: number
}

export interface PlayerAccount {
  username: string
  avatar: string
  token: string
}

export interface Player {
  account: PlayerAccount
  wallet: Wallet
  usernameChanged: boolean
  currency: Currency
  record: PlayerRecord
  activeBull: Bull
  storedBulls: Bull[]
  farm: FarmState
}
