<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSceneStore } from '@/stores/useSceneStore'
import { useKingStore } from '@/stores/useKingStore'
import { useDuelStore } from '@/stores/useDuelStore'
import { TIERS } from '@/domain/config/tiers'
import OverlayShell from '@/ui/components/OverlayShell.vue'
import CurrencyAmount from '@/ui/components/CurrencyAmount.vue'
import IconLaurelCrown from '~icons/game-icons/laurel-crown'
import IconCrossedSwords from '~icons/game-icons/crossed-swords'

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
        <IconLaurelCrown class="king__crown" />
        <div class="king__name">{{ king.state.username }}</div>
        <div class="king__meta">Tier {{ tierName }} · held for {{ holdText() }}</div>
        <div class="king__bounty">Bounty accrued: <CurrencyAmount kind="gold" :amount="king.bounty" /></div>
      </div>
      <div v-else class="king__card">
        <IconLaurelCrown class="king__crown" />
        <div class="king__meta">No King yet. Become the first ruler of the Colosseum!</div>
      </div>

      <p class="king__hint">
        <template v-if="king.isMine">You hold the throne. The bounty is paid to you when you are dethroned.</template>
        <template v-else>Beat the King in the Colosseum to take the crown. Your name then shows in the lobby.</template>
      </p>

      <button class="king__challenge" type="button" :disabled="king.isMine" @click="challenge">
        <template v-if="king.isMine"><IconLaurelCrown class="king__btn-icon" /> You are holding the throne</template>
        <template v-else-if="king.state"><IconCrossedSwords class="king__btn-icon" /> Challenge King</template>
        <template v-else><IconLaurelCrown class="king__btn-icon" /> Become King</template>
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
  width: 2.6rem;
  height: 2.6rem;
  color: var(--color-gold);
}

.king__name {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-gold);
}

.king__meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-align: center;
}

.king__bounty {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.25rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(10, 13, 17, 0.7);
  font-size: 0.8rem;
}

.king__hint {
  margin: 0;
  font-size: 0.76rem;
  color: var(--color-text-muted);
  text-align: center;
}

.king__challenge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  height: 46px;
  border: 1px solid rgba(255, 207, 74, 0.5);
  border-radius: 11px;
  background: rgba(255, 207, 74, 0.14);
  color: var(--color-gold);
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
}

.king__btn-icon {
  width: 1.1rem;
  height: 1.1rem;
}

@media (hover: hover) {
  .king__challenge:hover:not(:disabled) {
    background: rgba(255, 207, 74, 0.24);
  }
}

.king__challenge:active:not(:disabled) {
  background: rgba(255, 207, 74, 0.24);
}

.king__challenge:disabled {
  border-color: var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  cursor: default;
}
</style>
