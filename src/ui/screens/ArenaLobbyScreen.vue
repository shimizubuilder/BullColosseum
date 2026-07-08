<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSceneStore } from '@/stores/useSceneStore'
import { useDuelStore } from '@/stores/useDuelStore'
import { TIERS } from '@/domain/config/tiers'
import OverlayShell from '@/ui/components/OverlayShell.vue'

const player = usePlayerStore()
const scene = useSceneStore()
const duel = useDuelStore()

const bullName = computed(() => player.player?.activeBull.name ?? 'Your Bull')
const tierName = computed(() => TIERS[player.tier]?.name ?? '')
const rating = computed(() => player.player?.record.rating ?? 0)

function fight(): void {
  scene.closeOverlay()
  duel.request('ranked')
}
</script>

<template>
  <OverlayShell title="Colosseum" :subtitle="`${bullName} · ${tierName} · ▲ ${rating}`">
    <div class="lobby">
      <button class="lobby__card lobby__card--fight" type="button" @click="fight">
        <span class="lobby__icon">⚔️</span>
        <span class="lobby__text">
          <b>Ranked Duel</b>
          <small>Charge into a rated match. Win to climb divisions.</small>
        </span>
      </button>
      <button class="lobby__card" type="button" @click="scene.openOverlay('king')">
        <span class="lobby__icon">👑</span>
        <span class="lobby__text">
          <b>King of the Arena</b>
          <small>Only one King rules the lobby. Challenge to take the throne.</small>
        </span>
      </button>
    </div>
  </OverlayShell>
</template>

<style scoped>
.lobby {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.lobby__card {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: rgba(10, 13, 17, 0.5);
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.lobby__card:hover {
  border-color: var(--color-accent);
  background: rgba(229, 72, 77, 0.1);
}

.lobby__card--fight {
  border-color: rgba(229, 72, 77, 0.5);
  background: rgba(229, 72, 77, 0.12);
}

.lobby__icon {
  font-size: 1.6rem;
}

.lobby__text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.lobby__text b {
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}

.lobby__text small {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}
</style>
