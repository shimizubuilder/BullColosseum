<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import {
  connectPhantom,
  createNonce,
  isValidSolanaAddress,
  proveOwnership,
  WalletError,
} from '@/services/wallet/solanaWallet'
import OverlayShell from '@/ui/components/OverlayShell.vue'
import DivisionIcon from '@/ui/components/DivisionIcon.vue'
import IconTrendingUp from '~icons/tabler/trending-up'
import IconCircleCheck from '~icons/tabler/circle-check'
import IconAlertTriangle from '~icons/tabler/alert-triangle'

const player = usePlayerStore()

const account = computed(() => player.player?.account ?? null)
const wallet = computed(() => player.player?.wallet ?? { address: null, status: 'none' as const })
const record = computed(() => player.player?.record ?? { wins: 0, losses: 0, rating: 0 })
const usernameChanged = computed(() => Boolean(player.player?.usernameChanged))

const nameInput = ref(account.value?.username ?? '')
const pastedAddress = ref('')
const showPaste = ref(false)
const walletMessage = ref('')
const renameMessage = ref('')

const shortAddress = computed(() => {
  const address = wallet.value.address
  return address ? `${address.slice(0, 4)}…${address.slice(-4)}` : 'Not connected'
})
const canVerify = computed(() => Boolean(wallet.value.address) && wallet.value.status !== 'linked')

async function connect(): Promise<void> {
  try {
    const address = await connectPhantom()
    player.recordWallet(address)
    walletMessage.value = 'Wallet connected (unverified). Verify ownership to link.'
  } catch (error) {
    if (error instanceof WalletError && error.reason === 'phantom-missing') {
      showPaste.value = true
      walletMessage.value = error.message
    } else {
      walletMessage.value = 'Wallet connection cancelled.'
    }
  }
}

function savePasted(): void {
  const address = pastedAddress.value.trim()
  if (!isValidSolanaAddress(address)) {
    walletMessage.value = 'Invalid Solana address.'
    return
  }
  player.recordWallet(address)
  walletMessage.value = 'Address saved (needs verification).'
}

async function verify(): Promise<void> {
  try {
    const nonce = createNonce(Math.random, Date.now())
    const proof = await proveOwnership(wallet.value.address, nonce)
    player.markWalletLinked(proof.address, proof.nonce, proof.signature)
    walletMessage.value =
      proof.cryptographicallyVerified === true
        ? 'Cryptographically verified (Ed25519).'
        : 'Signed in Phantom (Ed25519 unavailable in this browser).'
  } catch (error) {
    walletMessage.value = error instanceof WalletError ? error.message : 'Verification failed.'
  }
}

async function rename(): Promise<void> {
  const result = await player.renameAccount(nameInput.value)
  if (result.ok) {
    renameMessage.value = 'Username updated.'
  } else if (result.error === 'unchanged') {
    renameMessage.value = 'Enter a different username.'
  } else if (result.error === 'taken') {
    renameMessage.value = 'Username already taken.'
  } else if (result.error === 'locked') {
    renameMessage.value = 'Username already changed.'
  } else {
    renameMessage.value = 'Failed to change username.'
  }
}
</script>

<template>
  <OverlayShell title="Profile" :subtitle="account?.username">
    <div v-if="player.player" class="profile">
      <div class="profile__head">
        <span class="profile__record">
          {{ record.wins }}W · {{ record.losses }}L · <IconTrendingUp class="profile__icon" /> {{ record.rating }}
        </span>
        <span class="profile__division" :style="{ color: player.division.color }">
          <DivisionIcon :icon-key="player.division.iconKey" /> {{ player.division.name }}
        </span>
      </div>

      <section class="field">
        <label class="field__label">Username</label>
        <div class="field__row">
          <input v-model="nameInput" class="field__input" maxlength="16" :disabled="usernameChanged" />
          <button class="btn" type="button" :disabled="usernameChanged" @click="rename">Change</button>
        </div>
        <small class="field__hint">
          {{ usernameChanged ? 'Username can no longer be changed.' : 'Username can be changed once.' }}
          {{ renameMessage }}
        </small>
      </section>

      <section class="field">
        <label class="field__label">Solana Wallet</label>
        <div class="wallet__status">
          <span class="wallet__addr">{{ shortAddress }}</span>
          <span v-if="wallet.status === 'linked'" class="tag tag--linked"><IconCircleCheck class="tag__icon" /> Linked</span>
          <span v-else-if="wallet.status === 'unverified'" class="tag tag--warn">
            <IconAlertTriangle class="tag__icon" /> Unverified
          </span>
        </div>
        <div class="field__row">
          <button class="btn" type="button" @click="connect">Connect</button>
          <button class="btn btn--ok" type="button" :disabled="!canVerify" @click="verify">Verify Ownership</button>
        </div>
        <div v-if="showPaste" class="field__row">
          <input
            v-model="pastedAddress"
            class="field__input field__input--mono"
            maxlength="44"
            placeholder="paste Solana address…"
          />
          <button class="btn" type="button" @click="savePasted">Save</button>
        </div>
        <small class="field__hint">{{ walletMessage || 'Verify signs a challenge in Phantom to prove control.' }}</small>
      </section>
    </div>
  </OverlayShell>
</template>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.profile__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.profile__record {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.profile__icon {
  width: 1em;
  height: 1em;
}

.profile__division {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 700;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field__label {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.field__row {
  display: flex;
  gap: 0.5rem;
}

.field__input {
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: rgba(10, 13, 17, 0.6);
  color: var(--color-text);
}

.field__input--mono {
  font-family: monospace;
  font-size: 16px;
}

.field__input:disabled {
  opacity: 0.55;
}

.field__hint {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.wallet__status {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.wallet__addr {
  font-family: monospace;
  font-size: 0.85rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
}

.tag__icon {
  width: 0.85rem;
  height: 0.85rem;
}

.tag--linked {
  background: rgba(64, 200, 128, 0.18);
  color: var(--color-success);
}

.tag--warn {
  background: rgba(255, 180, 60, 0.18);
  color: var(--color-warn);
}

.btn {
  height: 40px;
  padding: 0 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: rgba(10, 13, 17, 0.6);
  color: var(--color-text);
  font-weight: 600;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn--ok {
  border-color: rgba(64, 200, 128, 0.5);
  color: var(--color-success);
}
</style>
