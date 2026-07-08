<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSceneStore, type OverlayId } from '@/stores/useSceneStore'

const player = usePlayerStore()
const scene = useSceneStore()

const username = computed(() => player.player?.account.username ?? '')
const gold = computed(() => player.player?.currency.gold ?? 0)
const chargeToken = computed(() => player.player?.currency.chargeToken ?? 0)
const rating = computed(() => player.player?.record.rating ?? 0)

const docks: { id: OverlayId; label: string; icon: string }[] = [
  { id: 'stable', label: 'Stable', icon: '🐂' },
  { id: 'shop', label: 'Shop', icon: '🛒' },
  { id: 'vault', label: 'Vault', icon: '🏦' },
  { id: 'leaderboard', label: 'Ranks', icon: '🏆' },
  { id: 'quests', label: 'Quests', icon: '📋' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'guide', label: 'Guide', icon: '📖' },
]
</script>

<template>
  <template v-if="player.player">
    <header class="hud">
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

    <nav class="dock">
      <button
        v-for="dock in docks"
        :key="dock.id"
        type="button"
        class="dock__btn"
        @click="scene.openOverlay(dock.id)"
      >
        <span class="dock__icon">{{ dock.icon }}</span>
        <small>{{ dock.label }}</small>
      </button>
    </nav>
  </template>
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

.dock {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: rgba(15, 18, 22, 0.85);
  pointer-events: auto;
}

.dock__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  width: 62px;
  padding: 0.45rem 0.25rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.dock__btn:hover {
  background: rgba(229, 72, 77, 0.12);
  color: var(--color-text);
}

.dock__icon {
  font-size: 1.25rem;
}

.dock__btn small {
  font-size: 0.66rem;
  letter-spacing: 0.02em;
}
</style>
