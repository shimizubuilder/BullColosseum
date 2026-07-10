<script setup lang="ts">
import IconGold from '~icons/game-icons/two-coins'
import IconToken from '~icons/game-icons/cut-diamond'

defineProps<{
  kind: 'gold' | 'token'
  amount: number | string
}>()
</script>

<template>
  <span class="currency" :class="`currency--${kind}`">
    <IconGold v-if="kind === 'gold'" class="currency__icon" />
    <IconToken v-else class="currency__icon" />
    <span>{{ amount }}</span>
  </span>
</template>

<style scoped>
.currency {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
}

.currency--gold {
  color: var(--color-gold);
}

.currency--token {
  color: var(--color-accent);
}

.currency__icon {
  width: 1em;
  height: 1em;
  flex: none;
}
</style>
