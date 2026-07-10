<script setup lang="ts">
import { useWorldStore } from '@/stores/useWorldStore'

const world = useWorldStore()
</script>

<template>
  <Transition name="prompt">
    <div v-if="world.prompt" class="prompt">
      <span>{{ world.prompt }}</span>
      <span class="prompt__key"><kbd>E</kbd> /</span>
      <small>tap</small>
    </div>
  </Transition>
</template>

<style scoped>
.prompt {
  position: fixed;
  bottom: calc(6rem + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: calc(100vw - 2rem);
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: rgba(12, 9, 20, 0.85);
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 600;
  pointer-events: none;
  z-index: 2;
}

.prompt__key {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

@media (pointer: coarse) {
  .prompt__key {
    display: none;
  }
}

kbd {
  padding: 0.1rem 0.45rem;
  border: 1px solid var(--color-accent);
  border-radius: 6px;
  background: rgba(229, 72, 77, 0.15);
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 700;
}

.prompt small {
  color: var(--color-text-muted);
  font-size: 0.72rem;
}

.prompt-enter-active,
.prompt-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.prompt-enter-from,
.prompt-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
