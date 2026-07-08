<script setup lang="ts">
import { computed } from 'vue'
import { useSceneStore } from '@/stores/useSceneStore'
import LoginScreen from './screens/LoginScreen.vue'
import WorldHud from './hud/WorldHud.vue'

const scene = useSceneStore()
const showLogin = computed(() => scene.current === 'boot' || scene.current === 'login')
</script>

<template>
  <div class="ui-layer">
    <LoginScreen v-if="showLogin" />
    <WorldHud v-else />
  </div>
</template>

<style scoped>
.ui-layer {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
</style>
