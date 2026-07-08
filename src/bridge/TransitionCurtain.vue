<script setup lang="ts">
import { useSceneStore } from '@/stores/useSceneStore'

const scene = useSceneStore()
</script>

<template>
  <div class="curtain" :class="{ 'is-active': scene.isTransitioning }" aria-hidden="true" />
</template>

<style scoped>
.curtain {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: #05070a;
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease;
}

.curtain.is-active {
  opacity: 1;
  pointer-events: auto;
}
</style>
