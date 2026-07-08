<script setup lang="ts">
import { computed } from 'vue'
import { useSceneStore } from '@/stores/useSceneStore'
import LoginScreen from './screens/LoginScreen.vue'
import WorldHud from './hud/WorldHud.vue'
import WorldPrompt from './hud/WorldPrompt.vue'
import ChatPanel from './hud/ChatPanel.vue'
import StableScreen from './screens/StableScreen.vue'
import ShopScreen from './screens/ShopScreen.vue'
import VaultScreen from './screens/VaultScreen.vue'
import LeaderboardScreen from './screens/LeaderboardScreen.vue'
import ProfileScreen from './screens/ProfileScreen.vue'
import QuestsScreen from './screens/QuestsScreen.vue'
import GuideScreen from './screens/GuideScreen.vue'
import KandangScreen from './screens/KandangScreen.vue'

const scene = useSceneStore()
const showLogin = computed(() => scene.current === 'boot' || scene.current === 'login')

const overlays = {
  stable: StableScreen,
  shop: ShopScreen,
  vault: VaultScreen,
  leaderboard: LeaderboardScreen,
  profile: ProfileScreen,
  quests: QuestsScreen,
  guide: GuideScreen,
  kandang: KandangScreen,
}
const overlayComponent = computed(() =>
  scene.overlay ? (overlays[scene.overlay as keyof typeof overlays] ?? null) : null,
)
</script>

<template>
  <div class="ui-layer">
    <LoginScreen v-if="showLogin" />
    <template v-else>
      <WorldHud />
      <WorldPrompt />
      <ChatPanel />
      <component :is="overlayComponent" v-if="overlayComponent" />
    </template>
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
