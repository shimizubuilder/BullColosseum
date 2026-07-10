<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { vaultConversion } from '@/domain/economy'
import OverlayShell from '@/ui/components/OverlayShell.vue'
import CurrencyAmount from '@/ui/components/CurrencyAmount.vue'

const player = usePlayerStore()

const fraction = ref(0.5)
const presets = [0.25, 0.5, 0.75, 1]

const gold = computed(() => player.player?.currency.gold ?? 0)
const token = computed(() => player.player?.currency.chargeToken ?? 0)
const conversion = computed(() => vaultConversion(gold.value, fraction.value))
const canConvert = computed(() => conversion.value.mintedTokens > 0)
</script>

<template>
  <OverlayShell title="Gold Vault" subtitle="Convert Gold to $CHARGE · 5% burned">
    <div class="vault">
      <div class="vault__balance">
        <span class="pill"><CurrencyAmount kind="gold" :amount="gold" /></span>
        <span class="pill"><CurrencyAmount kind="token" :amount="token" /></span>
      </div>

      <div class="vault__presets">
        <button
          v-for="value in presets"
          :key="value"
          type="button"
          class="preset"
          :class="{ 'is-active': fraction === value }"
          @click="fraction = value"
        >
          {{ Math.round(value * 100) }}%
        </button>
      </div>

      <input v-model.number="fraction" class="slider" type="range" min="0.05" max="1" step="0.05" />

      <div class="vault__result">
        <span>Convert <b><CurrencyAmount kind="gold" :amount="conversion.spentGold" /></b></span>
        <span>Receive <b><CurrencyAmount kind="token" :amount="conversion.mintedTokens" /></b></span>
      </div>

      <button class="convert" type="button" :disabled="!canConvert" @click="player.convertVault(fraction)">
        Convert
      </button>
    </div>
  </OverlayShell>
</template>

<style scoped>
.vault {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vault__balance {
  display: flex;
  gap: 0.5rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
}

.vault__presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.preset {
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: rgba(10, 13, 17, 0.5);
  color: var(--color-text-muted);
  cursor: pointer;
}

.preset.is-active {
  border-color: var(--color-accent);
  color: var(--color-text);
}

@media (hover: hover) {
  .preset:hover {
    border-color: var(--color-accent);
    color: var(--color-text);
  }
}

.preset:active {
  border-color: var(--color-accent);
  color: var(--color-text);
}

.slider {
  width: 100%;
  accent-color: var(--color-accent);
}

.vault__result {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.convert {
  height: 46px;
  border: none;
  border-radius: 11px;
  background: linear-gradient(180deg, var(--color-accent-strong), var(--color-accent));
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
}

@media (hover: hover) {
  .convert:hover:not(:disabled) {
    filter: brightness(1.08);
  }
}

.convert:active:not(:disabled) {
  filter: brightness(0.94);
}

.convert:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
