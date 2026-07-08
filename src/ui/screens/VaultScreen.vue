<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { vaultConversion } from '@/domain/economy'
import OverlayShell from '@/ui/components/OverlayShell.vue'

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
        <span class="pill">◈ {{ gold }}</span>
        <span class="pill pill--token">◆ {{ token }}</span>
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
        <span>Convert <b>{{ conversion.spentGold }} ◈</b></span>
        <span>Receive <b class="accent">{{ conversion.mintedTokens }} ◆</b></span>
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
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
  color: #ffcf4a;
}

.pill--token {
  color: var(--color-accent);
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

.accent {
  color: var(--color-accent);
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

.convert:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
