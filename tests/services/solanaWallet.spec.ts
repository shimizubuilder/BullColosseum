import { describe, expect, it } from 'vitest'
import { buildOwnershipMessage, createNonce, isValidSolanaAddress } from '@/services/wallet/solanaWallet'

describe('isValidSolanaAddress', () => {
  it('accepts a base58 string within the length range', () => {
    expect(isValidSolanaAddress('A'.repeat(43))).toBe(true)
  })

  it('rejects strings containing non-base58 characters', () => {
    expect(isValidSolanaAddress(`${'A'.repeat(42)}0`)).toBe(false)
  })

  it('rejects strings outside the 32-44 length range', () => {
    expect(isValidSolanaAddress('A'.repeat(10))).toBe(false)
  })
})

describe('buildOwnershipMessage', () => {
  it('embeds the nonce after the challenge prefix', () => {
    expect(buildOwnershipMessage('CHARGE-x-1')).toBe(
      'Charge Arena — verify wallet ownership\nnonce: CHARGE-x-1',
    )
  })
})

describe('createNonce', () => {
  it('composes a deterministic nonce from the injected random and timestamp', () => {
    expect(createNonce(() => 0.5, 123)).toBe('CHARGE-i-123')
  })
})
