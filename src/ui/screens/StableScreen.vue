<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { ELEMENTS } from '@/domain/config/elements'
import { TIERS } from '@/domain/config/tiers'
import { trainingCost } from '@/domain/economy'
import OverlayShell from '@/ui/components/OverlayShell.vue'

const player = usePlayerStore()

const bull = computed(() => player.player?.activeBull ?? null)
const stats = computed(() => player.stats)
const tierName = computed(() => (stats.value ? TIERS[stats.value.tier].name : ''))
const element = computed(() => (bull.value ? ELEMENTS[bull.value.element] : null))
const cost = computed(() => (bull.value ? trainingCost(bull.value.level) : 0))
const canTrain = computed(() => Boolean(bull.value) && (player.player?.currency.gold ?? 0) >= cost.value)

const statRows: { label: string; key: 'power' | 'defense' | 'speed' | 'stamina' }[] = [
  { label: 'Power', key: 'power' },
  { label: 'Defense', key: 'defense' },
  { label: 'Speed', key: 'speed' },
  { label: 'Stamina', key: 'stamina' },
]

function barWidth(value: number): string {
  return `${Math.min(100, Math.max(4, value * 2.2))}%`
}
</script>

<template>
  <OverlayShell title="Stable" :subtitle="tierName">
    <div v-if="bull && stats" class="stable">
      <div class="stable__head">
        <span class="stable__dot" :style="{ background: element?.primaryColor }" />
        <b>{{ element?.name }} · {{ bull.name }}</b>
        <span class="stable__level">Lv {{ bull.level }}</span>
      </div>

      <div class="xp">
        <div class="xp__bar"><i :style="{ width: `${(100 * bull.xp) / player.xpToNext}%` }" /></div>
        <small>{{ bull.xp }} / {{ player.xpToNext }} XP</small>
      </div>

      <ul class="stats">
        <li v-for="row in statRows" :key="row.key">
          <span class="stats__label">{{ row.label }}</span>
          <div class="stats__bar"><i :style="{ width: barWidth(stats[row.key]) }" /></div>
          <b>{{ stats[row.key] }}</b>
        </li>
      </ul>

      <button class="train" type="button" :disabled="!canTrain" @click="player.trainBull()">
        Train · {{ cost }} ◈
      </button>
    </div>
  </OverlayShell>
</template>

<style scoped>
.stable {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stable__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.stable__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.stable__level {
  margin-left: auto;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.xp {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.xp__bar,
.stats__bar {
  height: 8px;
  border-radius: 999px;
  background: rgba(10, 13, 17, 0.8);
  overflow: hidden;
}

.xp__bar i,
.stats__bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
}

.xp small {
  color: var(--color-text-muted);
  font-size: 0.72rem;
}

.stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.stats li {
  display: grid;
  grid-template-columns: 72px 1fr 28px;
  align-items: center;
  gap: 0.6rem;
}

.stats__label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.stats b {
  text-align: right;
  font-size: 0.85rem;
}

.train {
  height: 46px;
  border: none;
  border-radius: 11px;
  background: linear-gradient(180deg, var(--color-accent-strong), var(--color-accent));
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.train:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
