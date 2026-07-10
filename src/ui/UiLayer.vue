<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useSceneStore } from '@/stores/useSceneStore'
import { useDuelStore } from '@/stores/useDuelStore'
import { useSpectateStore } from '@/stores/useSpectateStore'
import LoginScreen from './screens/LoginScreen.vue'
import WorldHud from './hud/WorldHud.vue'
import WorldPrompt from './hud/WorldPrompt.vue'
import ChatPanel from './hud/ChatPanel.vue'
import TouchControls from './hud/TouchControls.vue'
import DuelHint from './hud/DuelHint.vue'
import SpectateHud from './hud/SpectateHud.vue'
import ResultCard from './hud/ResultCard.vue'

const scene = useSceneStore()
const duel = useDuelStore()
const spectate = useSpectateStore()
const showLogin = computed(() => scene.current === 'boot' || scene.current === 'login')
const showWorld = computed(() => scene.current === 'world' || scene.current === 'farm')
const showSpectate = computed(() => scene.current === 'duel' && duel.context === 'spectate' && spectate.active)

const overlays = {
  stable: defineAsyncComponent(() => import('./screens/StableScreen.vue')),
  shop: defineAsyncComponent(() => import('./screens/ShopScreen.vue')),
  vault: defineAsyncComponent(() => import('./screens/VaultScreen.vue')),
  leaderboard: defineAsyncComponent(() => import('./screens/LeaderboardScreen.vue')),
  profile: defineAsyncComponent(() => import('./screens/ProfileScreen.vue')),
  quests: defineAsyncComponent(() => import('./screens/QuestsScreen.vue')),
  guide: defineAsyncComponent(() => import('./screens/GuideScreen.vue')),
  pen: defineAsyncComponent(() => import('./screens/PenScreen.vue')),
  colosseum: defineAsyncComponent(() => import('./screens/ArenaLobbyScreen.vue')),
  king: defineAsyncComponent(() => import('./screens/KingScreen.vue')),
  tournament: defineAsyncComponent(() => import('./screens/TournamentScreen.vue')),
}
const overlayComponent = computed(() =>
  scene.overlay ? (overlays[scene.overlay as keyof typeof overlays] ?? null) : null,
)
</script>

<template>
  <div class="ui-layer">
    <LoginScreen v-if="showLogin" />
    <template v-else-if="showWorld">
      <WorldHud />
      <WorldPrompt />
      <ChatPanel />
      <TouchControls />
      <component :is="overlayComponent" v-if="overlayComponent" />
    </template>
    <DuelHint v-if="scene.current === 'duel'" />
    <SpectateHud v-if="showSpectate" />
    <ResultCard />
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
