<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import IconRotate from '~icons/tabler/rotate-2'

const portrait = ref(false)
let query: MediaQueryList | null = null

function sync(): void {
  portrait.value = query?.matches ?? false
}

onMounted(() => {
  query = window.matchMedia('(orientation: portrait)')
  sync()
  query.addEventListener('change', sync)
})

onUnmounted(() => query?.removeEventListener('change', sync))
</script>

<template>
  <Transition name="hint">
    <div v-if="portrait" class="hint"><IconRotate class="hint__icon" /> Rotate your device for a bigger arena</div>
  </Transition>
</template>

<style scoped>
.hint {
  position: fixed;
  top: calc(0.75rem + env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-width: calc(100vw - 2rem);
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: rgba(12, 9, 20, 0.85);
  color: var(--color-text);
  font-size: 0.78rem;
  font-weight: 600;
  text-align: center;
  pointer-events: none;
  z-index: 4;
}

@media (hover: hover) {
  .hint {
    display: none;
  }
}

.hint__icon {
  width: 1rem;
  height: 1rem;
  flex: none;
}

.hint-enter-active,
.hint-leave-active {
  transition: opacity 0.2s ease;
}

.hint-enter-from,
.hint-leave-to {
  opacity: 0;
}
</style>
