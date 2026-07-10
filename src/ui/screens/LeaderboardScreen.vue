<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useLeaderboardStore } from '@/stores/useLeaderboardStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { TIERS } from '@/domain/config/tiers'
import OverlayShell from '@/ui/components/OverlayShell.vue'
import IconTrendingUp from '~icons/tabler/trending-up'

const leaderboard = useLeaderboardStore()
const player = usePlayerStore()

const selfName = computed(() => player.player?.account.username ?? '')
const subtitle = computed(() => (leaderboard.source === 'server' ? 'Live rankings' : 'Offline rankings'))

function tierName(tier: number): string {
  return TIERS[tier]?.name ?? TIERS[0].name
}

onMounted(() => {
  void leaderboard.load()
})
</script>

<template>
  <OverlayShell title="Rankings" :subtitle="subtitle">
    <p v-if="leaderboard.loading" class="lb__status">Loading rankings…</p>
    <ol v-else class="lb">
      <li
        v-for="entry in leaderboard.entries"
        :key="entry.rank ?? entry.username"
        class="lb__row"
        :class="{ 'is-self': entry.username === selfName }"
      >
        <span class="lb__rank">{{ entry.rank }}</span>
        <div class="lb__who">
          <b>{{ entry.username }}</b>
          <small>{{ tierName(entry.tier) }} · {{ entry.wins }}W {{ entry.losses }}L</small>
        </div>
        <span class="lb__rating"><IconTrendingUp class="lb__rating-icon" /> {{ entry.rating }}</span>
      </li>
    </ol>
  </OverlayShell>
</template>

<style scoped>
.lb__status {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.lb {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.lb__row {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: rgba(10, 13, 17, 0.5);
}

.lb__row.is-self {
  border-color: var(--color-accent);
  background: rgba(229, 72, 77, 0.12);
}

.lb__rank {
  text-align: center;
  font-weight: 700;
  color: var(--color-text-muted);
}

.lb__who {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.lb__who b {
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lb__who small {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.lb__rating {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--color-accent);
}

.lb__rating-icon {
  width: 0.9rem;
  height: 0.9rem;
}
</style>
