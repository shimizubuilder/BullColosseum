<script setup lang="ts">
import { useSceneStore } from '@/stores/useSceneStore'

defineProps<{ title: string; subtitle?: string }>()

const scene = useSceneStore()
</script>

<template>
  <div class="overlay" @click.self="scene.closeOverlay()">
    <div class="overlay__panel">
      <header class="overlay__head">
        <div>
          <h2>{{ title }}</h2>
          <p v-if="subtitle" class="overlay__subtitle">{{ subtitle }}</p>
        </div>
        <button class="overlay__close" type="button" aria-label="Close" @click="scene.closeOverlay()">✕</button>
      </header>
      <div class="overlay__body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  pointer-events: auto;
  background: rgba(6, 8, 11, 0.72);
  backdrop-filter: blur(3px);
  overflow-y: auto;
}

.overlay__panel {
  width: min(460px, 100%);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(27, 33, 41, 0.96), rgba(15, 18, 22, 0.98));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
}

.overlay__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.overlay__head h2 {
  margin: 0;
  font-size: 1.15rem;
  letter-spacing: 0.06em;
}

.overlay__subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.overlay__close {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-muted);
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.overlay__close:hover {
  color: var(--color-text);
  border-color: var(--color-accent);
}

.overlay__body {
  padding: 1.25rem;
}
</style>
