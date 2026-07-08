<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { currentDateKey, useQuestStore } from '@/stores/useQuestStore'
import { formatQuestDescription, isQuestClaimable, type Quest } from '@/domain/quests'
import OverlayShell from '@/ui/components/OverlayShell.vue'

const quest = useQuestStore()

const subtitle = computed(() =>
  quest.claimable > 0 ? `${quest.claimable} reward${quest.claimable > 1 ? 's' : ''} ready` : 'Resets daily',
)

function rewardLabel(item: Quest): string {
  const gold = `${item.reward.gold} ◈`
  return item.reward.token ? `${gold} · ${item.reward.token} ◆` : gold
}

function barWidth(item: Quest): string {
  return `${Math.min(100, (100 * item.progress) / item.target)}%`
}

onMounted(() => {
  quest.ensureDaily(currentDateKey())
})
</script>

<template>
  <OverlayShell title="Quest Board" :subtitle="subtitle">
    <ul class="quests">
      <li v-for="item in quest.dailyList" :key="item.id" class="quest" :class="{ 'is-done': item.claimed }">
        <div class="quest__info">
          <b class="quest__desc">{{ formatQuestDescription(item) }}</b>
          <div class="quest__bar"><i :style="{ width: barWidth(item) }" /></div>
          <small>{{ item.progress }} / {{ item.target }} · {{ rewardLabel(item) }}</small>
        </div>
        <button
          class="quest__claim"
          type="button"
          :disabled="!isQuestClaimable(item)"
          @click="quest.claim(item.id)"
        >
          {{ item.claimed ? '✓' : 'Claim' }}
        </button>
      </li>
    </ul>
  </OverlayShell>
</template>

<style scoped>
.quests {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.quest {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 11px;
  background: rgba(10, 13, 17, 0.5);
}

.quest.is-done {
  opacity: 0.6;
}

.quest__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.quest__desc {
  font-size: 0.85rem;
}

.quest__bar {
  height: 7px;
  border-radius: 999px;
  background: rgba(10, 13, 17, 0.8);
  overflow: hidden;
}

.quest__bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
}

.quest__info small {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.quest__claim {
  height: 38px;
  padding: 0 0.9rem;
  border: 1px solid rgba(64, 200, 128, 0.5);
  border-radius: 9px;
  background: rgba(64, 200, 128, 0.14);
  color: #56d6a0;
  font-weight: 700;
  cursor: pointer;
}

.quest__claim:disabled {
  border-color: var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  cursor: default;
}
</style>
