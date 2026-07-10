<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { GEAR, type GearDefinition } from '@/domain/config/gear'
import OverlayShell from '@/ui/components/OverlayShell.vue'
import CurrencyAmount from '@/ui/components/CurrencyAmount.vue'

const player = usePlayerStore()

const items = GEAR

function isOwned(id: GearDefinition['id']): boolean {
  return player.player?.activeBull.gear.includes(id) ?? false
}

function balanceFor(gear: GearDefinition): number {
  return gear.currency === 'token'
    ? (player.player?.currency.chargeToken ?? 0)
    : (player.player?.currency.gold ?? 0)
}

function canAfford(gear: GearDefinition): boolean {
  return balanceFor(gear) >= gear.cost
}

const gold = computed(() => player.player?.currency.gold ?? 0)
const token = computed(() => player.player?.currency.chargeToken ?? 0)
</script>

<template>
  <OverlayShell title="Gear Shop" :subtitle="`${gold} Gold · ${token} $CHARGE`">
    <ul class="shop">
      <li v-for="gear in items" :key="gear.id" class="item">
        <div class="item__info">
          <h4>
            {{ gear.name }}
            <span v-if="gear.currency === 'token'" class="tag">TOKEN</span>
          </h4>
          <p>{{ gear.description }}</p>
        </div>
        <button
          class="item__buy"
          type="button"
          :disabled="isOwned(gear.id) || !canAfford(gear)"
          @click="player.buyGear(gear.id)"
        >
          <template v-if="isOwned(gear.id)">Owned</template>
          <CurrencyAmount v-else :kind="gear.currency === 'token' ? 'token' : 'gold'" :amount="gear.cost" />
        </button>
      </li>
    </ul>
  </OverlayShell>
</template>

<style scoped>
.shop {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 11px;
  background: rgba(10, 13, 17, 0.5);
}

.item__info {
  flex: 1;
  min-width: 0;
}

.item__info h4 {
  margin: 0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item__info p {
  margin: 0.2rem 0 0;
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.tag {
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  padding: 0.1rem 0.4rem;
  border-radius: 5px;
  background: color-mix(in srgb, var(--color-accent) 24%, transparent);
  color: var(--color-accent);
}

.item__buy {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  height: 38px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: rgba(229, 72, 77, 0.12);
  color: var(--color-text);
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

@media (hover: hover) {
  .item__buy:hover:not(:disabled) {
    border-color: var(--color-accent);
  }
}

.item__buy:active:not(:disabled) {
  border-color: var(--color-accent);
}

.item__buy:disabled {
  opacity: 0.45;
  cursor: default;
}
</style>
