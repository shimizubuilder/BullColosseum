import { apiPost } from '@/services/http/httpClient'
import { ENDPOINTS } from '@/services/http/endpoints'
import type { NetworkResult } from '@/services/http/NetworkResult'
import type { RenameResponseDto, WalletUpdateResponseDto } from '@/services/dto/profile.dto'

export function setWallet(token: string, wallet: string): Promise<NetworkResult<WalletUpdateResponseDto>> {
  return apiPost(ENDPOINTS.profile, { action: 'setwallet', token, wallet })
}

export function verifyWallet(
  token: string,
  wallet: string,
  nonce: string,
  signature: string,
): Promise<NetworkResult<WalletUpdateResponseDto>> {
  return apiPost(ENDPOINTS.profile, { action: 'verify', token, wallet, nonce, signature })
}

export function rename(token: string, username: string): Promise<NetworkResult<RenameResponseDto>> {
  return apiPost(ENDPOINTS.profile, { action: 'rename', token, username })
}
