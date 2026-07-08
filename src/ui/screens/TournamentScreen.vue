<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useTournamentStore } from '@/stores/useTournamentStore'
import { useLeaderboardStore } from '@/stores/useLeaderboardStore'
import { TOURNAMENT } from '@/domain/config/balance'
import type { BracketMatch, TournamentMode } from '@/domain/combat/tournament'
import OverlayShell from '@/ui/components/OverlayShell.vue'

const player = usePlayerStore()
const tournament = useTournamentStore()
const leaderboard = useLeaderboardStore()

const ROUND_TITLES = ['Quarterfinal', 'Semifinal', 'Final']
const MODE_KEYS = Object.keys(TOURNAMENT.modes) as TournamentMode[]

const entryCost = computed(() => TOURNAMENT.modes[tournament.mode].entry)
const gold = computed(() => player.player?.currency.gold ?? 0)
const canJoin = computed(
  () => !tournament.playerIn && !tournament.running && !tournament.finished && gold.value >= entryCost.value,
)
const bracketLocked = computed(() => (tournament.playerIn && !tournament.finished) || tournament.running)

function entries() {
  return leaderboard.entries.map((entry) => ({ username: entry.username, rating: entry.rating }))
}

async function selectMode(mode: TournamentMode): Promise<void> {
  if (bracketLocked.value) {
    return
  }
  if (leaderboard.entries.length === 0) {
    await leaderboard.load()
  }
  tournament.open(mode, entries())
}

function join(): void {
  const account = player.player
  if (!account) {
    return
  }
  tournament.join(account.account.username, account.record.rating)
}

function slotClass(match: BracketMatch, fighter: BracketMatch['a']): string {
  if (!fighter) {
    return ''
  }
  const classes: string[] = []
  if (fighter.isMe) {
    classes.push('is-me')
  }
  if (match.winner) {
    classes.push(match.winner === fighter ? 'is-win' : 'is-lose')
  }
  return classes.join(' ')
}

onMounted(() => {
  void selectMode('practice')
})
</script>

<template>
  <OverlayShell title="Tournament" :subtitle="`${TOURNAMENT.size} fighters · single elimination`">
    <div class="tn">
      <div class="tn__modes">
        <button
          v-for="key in MODE_KEYS"
          :key="key"
          type="button"
          class="tn__mode"
          :class="{ 'is-active': tournament.mode === key }"
          :disabled="bracketLocked"
          @click="selectMode(key)"
        >
          {{ TOURNAMENT.modes[key].label }}
        </button>
      </div>

      <div class="tn__bar">
        <span class="tn__pool">Prize pool <b>{{ tournament.pool }}</b> ◈</span>
        <span class="tn__gold">◈ {{ gold }}</span>
      </div>

      <div class="tn__bracket">
        <div v-for="(round, ri) in tournament.rounds" :key="ri" class="tn__col">
          <div class="tn__col-title">{{ ROUND_TITLES[ri] ?? '' }}</div>
          <div v-for="(match, mi) in round" :key="mi" class="tn__match">
            <div class="tn__slot" :class="slotClass(match, match.a)">
              <span>{{ match.a?.name ?? '—' }}</span><small>{{ match.a?.rating ?? '' }}</small>
            </div>
            <div class="tn__slot" :class="slotClass(match, match.b)">
              <span>{{ match.b?.name ?? '—' }}</span><small>{{ match.b?.rating ?? '' }}</small>
            </div>
          </div>
        </div>
      </div>

      <p v-if="tournament.finished" class="tn__champ">
        <template v-if="tournament.champion?.isMe">👑 You won the tournament! +{{ tournament.pool }} ◈ +1 ◆</template>
        <template v-else>👑 Champion: {{ tournament.champion?.name ?? '?' }}</template>
      </p>

      <div class="tn__actions">
        <button type="button" class="tn__btn" :disabled="!canJoin" @click="join">
          {{ tournament.playerIn ? '✓ Joined' : `➕ Join (${entryCost} ◈)` }}
        </button>
        <button
          type="button"
          class="tn__btn tn__btn--go"
          :disabled="tournament.running || tournament.finished"
          @click="tournament.run()"
        >
          ▶ Start
        </button>
        <button type="button" class="tn__btn" :disabled="bracketLocked" @click="selectMode(tournament.mode)">↻ New</button>
      </div>
    </div>
  </OverlayShell>
</template>

<style scoped>
.tn {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tn__modes {
  display: flex;
  gap: 0.4rem;
}

.tn__mode {
  flex: 1;
  padding: 0.45rem;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: rgba(10, 13, 17, 0.5);
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.tn__mode.is-active {
  border-color: var(--color-accent);
  background: rgba(229, 72, 77, 0.14);
  color: var(--color-text);
}

.tn__mode:disabled {
  opacity: 0.5;
  cursor: default;
}

.tn__bar {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.tn__pool b {
  color: #ffcf4a;
}

.tn__gold {
  color: #ffcf4a;
}

.tn__bracket {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.tn__col {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 0.5rem;
  min-width: 120px;
}

.tn__col-title {
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.tn__match {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 3px;
  border-radius: 8px;
  background: rgba(10, 13, 17, 0.55);
}

.tn__slot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.72rem;
}

.tn__slot span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tn__slot small {
  color: var(--color-text-muted);
}

.tn__slot.is-win {
  border-color: rgba(64, 200, 128, 0.6);
  color: #56d6a0;
}

.tn__slot.is-lose {
  opacity: 0.45;
}

.tn__slot.is-me {
  background: rgba(229, 72, 77, 0.14);
}

.tn__champ {
  margin: 0;
  padding: 0.6rem;
  border-radius: 10px;
  background: rgba(255, 207, 74, 0.12);
  color: #ffcf4a;
  font-weight: 700;
  text-align: center;
  font-size: 0.85rem;
}

.tn__actions {
  display: flex;
  gap: 0.4rem;
}

.tn__btn {
  flex: 1;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: rgba(10, 13, 17, 0.5);
  color: var(--color-text);
  font-weight: 700;
  cursor: pointer;
}

.tn__btn--go {
  border-color: rgba(229, 72, 77, 0.5);
  background: rgba(229, 72, 77, 0.14);
}

.tn__btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
