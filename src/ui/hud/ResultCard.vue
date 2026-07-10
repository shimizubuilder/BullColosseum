<script setup lang="ts">
import { useDuelStore } from '@/stores/useDuelStore'
import CurrencyAmount from '@/ui/components/CurrencyAmount.vue'

const duel = useDuelStore()

function signed(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}
</script>

<template>
  <div v-if="duel.result" class="result">
    <div class="result__card">
      <h2 class="result__title" :class="duel.result.won ? 'is-win' : 'is-loss'">
        {{ duel.result.won ? 'VICTORY' : 'DEFEAT' }}
      </h2>
      <p class="result__vs">vs {{ duel.result.opponentName }}</p>
      <ul class="result__rewards">
        <li><span>Rating</span><b>{{ signed(duel.result.ratingDelta) }}</b></li>
        <li><span>Gold</span><b><CurrencyAmount kind="gold" :amount="signed(duel.result.reward.gold)" /></b></li>
        <li><span>XP</span><b>+{{ duel.result.reward.xp }}</b></li>
        <li v-if="duel.result.reward.token">
          <span>Token</span><b><CurrencyAmount kind="token" :amount="`+${duel.result.reward.token}`" /></b>
        </li>
      </ul>
      <button class="result__continue" type="button" @click="duel.clearResult()">Continue</button>
    </div>
  </div>
</template>

<style scoped>
.result {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  background: rgba(6, 8, 11, 0.78);
  pointer-events: auto;
}

.result__card {
  position: relative;
  width: min(360px, 92vw);
  padding: 1.6rem 1.4rem;
  border: 1px solid var(--color-border-bronze);
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(27, 33, 41, 0.98), rgba(15, 18, 22, 0.98));
  text-align: center;
}

.result__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-gold-soft), transparent);
}

.result__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 2rem;
  letter-spacing: 0.1em;
}

.result__title.is-win {
  color: var(--color-gold);
}

.result__title.is-loss {
  color: var(--color-accent);
}

.result__vs {
  margin: 0.25rem 0 1rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.result__rewards {
  list-style: none;
  margin: 0 0 1.2rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.result__rewards li {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.result__rewards b {
  color: var(--color-text);
}

.result__continue {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 11px;
  background: linear-gradient(180deg, var(--color-accent-strong), var(--color-accent));
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
}
</style>
