<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'

const player = usePlayerStore()

const username = computed(() => player.player?.account.username ?? '')
const gold = computed(() => player.player?.currency.gold ?? 0)
const chargeToken = computed(() => player.player?.currency.chargeToken ?? 0)
const rating = computed(() => player.player?.record.rating ?? 0)
</script>

<template>
  <header v-if="player.player" class="hud">
    <span class="hud__brand">CHARGE ARENA</span>
    <div class="hud__stats">
      <span class="badge">{{ username }}</span>
      <span class="badge badge--gold">◈ {{ gold }}</span>
      <span class="badge badge--token">◆ {{ chargeToken }}</span>
      <span class="badge">▲ {{ rating }}</span>
      <span class="badge" :style="{ color: player.division.color }">
        {{ player.division.icon }} {{ player.division.name }}
      </span>
    </div>
  </header>
</template>

<style scoped>
.hud {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 1rem;
  pointer-events: auto;
  background: linear-gradient(180deg, rgba(15, 18, 22, 0.92), rgba(15, 18, 22, 0));
}

.hud__brand {
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-accent);
}

.hud__stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: rgba(10, 13, 17, 0.7);
  font-size: 0.8rem;
  font-weight: 600;
}

.badge--gold {
  color: #ffcf4a;
}

.badge--token {
  color: var(--color-accent);
}
</style>
