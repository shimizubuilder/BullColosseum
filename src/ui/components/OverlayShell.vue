<script setup lang="ts">
import { useSceneStore } from '@/stores/useSceneStore'
import IconX from '~icons/tabler/x'

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
        <button class="overlay__close" type="button" aria-label="Close" @click="scene.closeOverlay()">
          <IconX class="overlay__close-icon" />
        </button>
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
  display: flex;
  align-items: safe center;
  justify-content: center;
  padding: calc(1.5rem + env(safe-area-inset-top)) calc(1.5rem + env(safe-area-inset-right))
    calc(1.5rem + env(safe-area-inset-bottom)) calc(1.5rem + env(safe-area-inset-left));
  pointer-events: auto;
  background: rgba(6, 8, 11, 0.72);
  backdrop-filter: blur(3px);
  overflow-y: auto;
}

.overlay__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(460px, 100%);
  max-height: 100%;
  border: 1px solid var(--color-border-bronze);
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(27, 33, 41, 0.96), rgba(15, 18, 22, 0.98));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
}

.overlay__panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-gold-soft), transparent);
}

.overlay__head {
  display: flex;
  flex: none;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid var(--color-border-bronze);
}

.overlay__head h2 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-gold-soft);
}

.overlay__subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.overlay__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.overlay__close-icon {
  width: 1rem;
  height: 1rem;
}

.overlay__close:active {
  color: var(--color-text);
  border-color: var(--color-accent);
}

@media (hover: hover) {
  .overlay__close:hover {
    color: var(--color-text);
    border-color: var(--color-accent);
  }
}

.overlay__body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 1.25rem;
  overflow-y: auto;
}
</style>
