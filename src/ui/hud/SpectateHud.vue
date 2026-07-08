<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSceneStore } from '@/stores/useSceneStore'
import { useSpectateStore } from '@/stores/useSpectateStore'

const player = usePlayerStore()
const scene = useSceneStore()
const spectate = useSpectateStore()

const gold = computed(() => player.player?.currency.gold ?? 0)
const nameA = computed(() => spectate.pair?.[0]?.username ?? '—')
const nameB = computed(() => spectate.pair?.[1]?.username ?? '—')
const ratingA = computed(() => spectate.pair?.[0]?.rating ?? 0)
const ratingB = computed(() => spectate.pair?.[1]?.rating ?? 0)

function exit(): void {
  spectate.exit()
  scene.goto('world')
}
</script>

<template>
  <div class="spec">
    <div class="spec__top">
      <span class="spec__viewers">🔴 {{ spectate.viewers }} watching</span>
      <button class="spec__exit" type="button" @click="exit">Leave ✕</button>
    </div>

    <div class="spec__vs">
      <span>🅰 {{ nameA }} <small>{{ ratingA }}</small></span>
      <span class="spec__x">⚔</span>
      <span><small>{{ ratingB }}</small> {{ nameB }} 🅱</span>
    </div>

    <div class="spec__bet">
      <button class="spec__stake" type="button" :disabled="spectate.placed" @click="spectate.cycleStake()">
        Stake {{ spectate.stake }} ◈
      </button>
      <button class="spec__side" type="button" :disabled="spectate.placed || gold < spectate.stake" @click="spectate.placeBet('a')">
        🅰 {{ nameA }}
      </button>
      <button class="spec__side" type="button" :disabled="spectate.placed || gold < spectate.stake" @click="spectate.placeBet('b')">
        {{ nameB }} 🅱
      </button>
    </div>

    <p class="spec__msg">{{ spectate.message || 'Place a bet before the charge ends · 1.9× payout' }}</p>
  </div>
</template>

<style scoped>
.spec {
  position: fixed;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  width: min(560px, calc(100% - 2rem));
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: rgba(15, 18, 22, 0.9);
  pointer-events: auto;
}

.spec__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.spec__viewers {
  color: #ff8a8a;
  font-weight: 700;
}

.spec__exit {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-muted);
  padding: 0.25rem 0.55rem;
  cursor: pointer;
}

.spec__vs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  font-size: 0.85rem;
  font-weight: 700;
}

.spec__vs small {
  color: var(--color-text-muted);
  font-weight: 500;
}

.spec__x {
  color: var(--color-accent);
}

.spec__bet {
  display: flex;
  gap: 0.4rem;
}

.spec__stake,
.spec__side {
  flex: 1;
  height: 38px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: rgba(10, 13, 17, 0.5);
  color: var(--color-text);
  font-weight: 700;
  font-size: 0.75rem;
  cursor: pointer;
}

.spec__stake {
  flex: 0 0 34%;
  color: #ffcf4a;
}

.spec__side:disabled,
.spec__stake:disabled {
  opacity: 0.5;
  cursor: default;
}

.spec__msg {
  margin: 0;
  text-align: center;
  font-size: 0.72rem;
  color: var(--color-text-muted);
}
</style>
