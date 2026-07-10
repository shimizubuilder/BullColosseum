<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSceneStore } from '@/stores/useSceneStore'
import { useSpectateStore } from '@/stores/useSpectateStore'
import CurrencyAmount from '@/ui/components/CurrencyAmount.vue'
import IconCrossedSwords from '~icons/game-icons/crossed-swords'
import IconX from '~icons/tabler/x'

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
      <span class="spec__viewers"><span class="spec__dot" /> {{ spectate.viewers }} watching</span>
      <button class="spec__exit" type="button" @click="exit">Leave <IconX class="spec__exit-icon" /></button>
    </div>

    <div class="spec__vs">
      <span><span class="spec__chip">A</span> {{ nameA }} <small>{{ ratingA }}</small></span>
      <IconCrossedSwords class="spec__x" />
      <span><small>{{ ratingB }}</small> {{ nameB }} <span class="spec__chip">B</span></span>
    </div>

    <div class="spec__bet">
      <button class="spec__stake" type="button" :disabled="spectate.placed" @click="spectate.cycleStake()">
        Stake <CurrencyAmount kind="gold" :amount="spectate.stake" />
      </button>
      <button class="spec__side" type="button" :disabled="spectate.placed || gold < spectate.stake" @click="spectate.placeBet('a')">
        <span class="spec__chip">A</span> {{ nameA }}
      </button>
      <button class="spec__side" type="button" :disabled="spectate.placed || gold < spectate.stake" @click="spectate.placeBet('b')">
        {{ nameB }} <span class="spec__chip">B</span>
      </button>
    </div>

    <p class="spec__msg">{{ spectate.message || 'Place a bet before the charge ends · 1.9× payout' }}</p>
  </div>
</template>

<style scoped>
.spec {
  position: fixed;
  left: 50%;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: min(560px, calc(100vw - 2rem));
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
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-live);
  font-weight: 700;
}

.spec__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-live);
  animation: spec-pulse 1.4s ease-in-out infinite;
}

@keyframes spec-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

.spec__exit {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-muted);
  padding: 0.25rem 0.55rem;
  cursor: pointer;
}

.spec__exit-icon {
  width: 0.85rem;
  height: 0.85rem;
}

.spec__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.15rem;
  height: 1.15rem;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  background: rgba(10, 13, 17, 0.7);
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--color-gold);
}

.spec__vs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  font-size: 0.85rem;
  font-weight: 700;
}

.spec__vs > span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
}

.spec__vs small {
  color: var(--color-text-muted);
  font-weight: 500;
}

.spec__x {
  width: 1.1rem;
  height: 1.1rem;
  flex: none;
  color: var(--color-accent);
}

.spec__bet {
  display: flex;
  gap: 0.4rem;
}

.spec__stake,
.spec__side {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  min-width: 0;
  height: 38px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: rgba(10, 13, 17, 0.5);
  color: var(--color-text);
  font-weight: 700;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.spec__side:not(:disabled):active,
.spec__stake:not(:disabled):active {
  border-color: var(--color-accent);
}

.spec__stake {
  flex: 0 0 34%;
  color: var(--color-gold);
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
