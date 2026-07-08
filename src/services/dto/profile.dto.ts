export interface RenamedPlayerDto {
  username: string
}

export interface RenameResponseDto {
  ok: boolean
  player?: RenamedPlayerDto
  error?: string
}

export interface WalletUpdateResponseDto {
  ok: boolean
}
