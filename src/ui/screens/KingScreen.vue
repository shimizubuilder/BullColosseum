<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSceneStore } from '@/stores/useSceneStore'
import { useKingStore } from '@/stores/useKingStore'
import { useDuelStore } from '@/stores/useDuelStore'
import { TIERS } from '@/domain/config/tiers'
import OverlayShell from '@/ui/components/OverlayShell.vue'

const player = usePlayerStore()
const scene = useSceneStore()
const king = useKingStore()
const duel = useDuelStore()

const selfName = computed(() => player.player?.account.username ?? 'Player')
const tierName = computed(() => (king.state ? (TIERS[king.state.tier]?.name ?? '') : ''))

function holdText(): string {
  const seconds = king.holdSeconds
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

function challenge(): void {
  if (king.isMine) {
    return
  }
  scene.closeOverlay()
  duel.request('king')
}

onMounted(() => {
  void king.refresh(selfName.value)
})
</script>

<template>
  <OverlayShell title="King of the Arena" subtitle="One throne. One ruler.">
    <div class="king">
      <div v-if="king.state" class="king__card" :class="{ 'king__card--mine': king.isMine }">
        <div class="king__crown">👑</div>
        <div class="king__name">{{ king.state.username }}</div>
        <div class="king__meta">Tier {{ tierName }} · held for {{ holdText() }}</div>
        <div class="king__bounty">Bounty accrued: <b>{{ king.bounty }}</b> ◈</div>
      </div>
      <div v-else class="king__card">
        <div class="king__crown">👑</div>
        <div class="king__meta">No King yet. Become the first ruler of the Colosseum!</div>
      </div>

      <p class="king__hint">
        <template v-if="king.isMine">You hold the throne. The bounty is paid to you when you are dethroned.</template>
        <template v-else>Beat the King in the Colosseum to take the crown. Your name then shows in the lobby.</template>
      </p>

      <button class="king__challenge" type="button" :disabled="king.isMine" @click="challenge">
        {{ king.isMine ? '👑 You are holding the throne' : king.state ? '⚔ Challenge King' : '👑 Become King' }}
      </button>
    </div>
  </OverlayShell>
</template>

<style scoped>
.king {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.king__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 1.4rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: radial-gradient(circle at 50% 0%, rgba(255, 207, 74, 0.14), rgba(10, 13, 17, 0.5));
}

.king__card--mine {
  border-color: rgba(255, 207, 74, 0.5);
}

.king__crown {
  font-size: 2.4rem;
}

.king__name {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffcf4a;
}

.king__meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-align: center;
}

.king__bounty {
  margin-top: 0.25rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(10, 13, 17, 0.7);
  font-size: 0.8rem;
}

.king__bounty b {
  color: #ffcf4a;
}

.king__hint {
  margin: 0;
  font-size: 0.76rem;
  color: var(--color-text-muted);
  text-align: center;
}

.king__challenge {
  height: 46px;
  border: 1px solid rgba(255, 207, 74, 0.5);
  border-radius: 11px;
  background: rgba(255, 207, 74, 0.14);
  color: #ffcf4a;
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
}

.king__challenge:disabled {
  border-color: var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  cursor: default;
}
</style>
