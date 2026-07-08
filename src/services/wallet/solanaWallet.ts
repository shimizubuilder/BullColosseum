const SOLANA_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
const OWNERSHIP_MESSAGE_PREFIX = 'Charge Arena — verify wallet ownership\nnonce: '

export interface PhantomPublicKey {
  toString(): string
  toBytes(): Uint8Array
}

export interface PhantomProvider {
  isPhantom?: boolean
  publicKey?: PhantomPublicKey | null
  connect(): Promise<{ publicKey: { toString(): string } }>
  signMessage(message: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>
}

export type WalletErrorReason =
  | 'phantom-missing'
  | 'connection-cancelled'
  | 'address-mismatch'
  | 'signature-invalid'
  | 'verification-cancelled'

export class WalletError extends Error {
  constructor(
    readonly reason: WalletErrorReason,
    message: string,
  ) {
    super(message)
    this.name = 'WalletError'
  }
}

export interface OwnershipProof {
  address: string
  nonce: string
  signature: string
  cryptographicallyVerified: boolean | null
}

export function isValidSolanaAddress(address: string): boolean {
  return SOLANA_ADDRESS_PATTERN.test(address)
}

export function buildOwnershipMessage(nonce: string): string {
  return `${OWNERSHIP_MESSAGE_PREFIX}${nonce}`
}

export function createNonce(random: () => number, timestamp: number): string {
  return `CHARGE-${random().toString(36).slice(2)}-${timestamp}`
}

function resolveProvider(): PhantomProvider | null {
  const provider = (globalThis as { solana?: PhantomProvider }).solana
  return provider?.isPhantom ? provider : null
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

async function verifyEd25519(
  publicKey: Uint8Array,
  signature: Uint8Array,
  message: Uint8Array,
): Promise<boolean | null> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    return null
  }
  try {
    const key = await subtle.importKey('raw', new Uint8Array(publicKey), { name: 'Ed25519' }, false, ['verify'])
    return await subtle.verify({ name: 'Ed25519' }, key, new Uint8Array(signature), new Uint8Array(message))
  } catch {
    return null
  }
}

export async function connectPhantom(): Promise<string> {
  const provider = resolveProvider()
  if (!provider) {
    throw new WalletError('phantom-missing', 'Phantom not detected — paste your address below instead.')
  }
  try {
    const response = await provider.connect()
    return response.publicKey.toString()
  } catch {
    throw new WalletError('connection-cancelled', 'Wallet connection cancelled.')
  }
}

export async function proveOwnership(expectedAddress: string | null, nonce: string): Promise<OwnershipProof> {
  const provider = resolveProvider()
  if (!provider) {
    throw new WalletError('phantom-missing', 'Phantom is required to sign the ownership challenge.')
  }
  try {
    if (!provider.publicKey) {
      await provider.connect()
    }
    const address = provider.publicKey?.toString() ?? ''
    if (expectedAddress && expectedAddress !== address) {
      throw new WalletError('address-mismatch', 'Connected wallet does not match the saved address.')
    }
    const message = new TextEncoder().encode(buildOwnershipMessage(nonce))
    const signed = await provider.signMessage(message, 'utf8')
    const publicKeyBytes = provider.publicKey?.toBytes() ?? new Uint8Array()
    const verified = await verifyEd25519(publicKeyBytes, signed.signature, message)
    if (verified === false) {
      throw new WalletError('signature-invalid', 'Signature verification failed.')
    }
    return { address, nonce, signature: encodeBase64(signed.signature), cryptographicallyVerified: verified }
  } catch (error) {
    if (error instanceof WalletError) {
      throw error
    }
    throw new WalletError('verification-cancelled', 'Verification cancelled.')
  }
}
