<script setup lang="ts">
import { computed } from 'vue'
import { useSceneStore } from '@/stores/useSceneStore'
import { useDuelStore } from '@/stores/useDuelStore'
import { useSpectateStore } from '@/stores/useSpectateStore'
import LoginScreen from './screens/LoginScreen.vue'
import WorldHud from './hud/WorldHud.vue'
import WorldPrompt from './hud/WorldPrompt.vue'
import ChatPanel from './hud/ChatPanel.vue'
import SpectateHud from './hud/SpectateHud.vue'
import StableScreen from './screens/StableScreen.vue'
import ShopScreen from './screens/ShopScreen.vue'
import VaultScreen from './screens/VaultScreen.vue'
import LeaderboardScreen from './screens/LeaderboardScreen.vue'
import ProfileScreen from './screens/ProfileScreen.vue'
import QuestsScreen from './screens/QuestsScreen.vue'
import GuideScreen from './screens/GuideScreen.vue'
import PenScreen from './screens/PenScreen.vue'
import ArenaLobbyScreen from './screens/ArenaLobbyScreen.vue'
import KingScreen from './screens/KingScreen.vue'
import TournamentScreen from './screens/TournamentScreen.vue'
import ResultCard from './hud/ResultCard.vue'

const scene = useSceneStore()
const duel = useDuelStore()
const spectate = useSpectateStore()
const showLogin = computed(() => scene.current === 'boot' || scene.current === 'login')
const showWorld = computed(() => scene.current === 'world' || scene.current === 'farm')
const showSpectate = computed(() => scene.current === 'duel' && duel.context === 'spectate' && spectate.active)

const overlays = {
  stable: StableScreen,
  shop: ShopScreen,
  vault: VaultScreen,
  leaderboard: LeaderboardScreen,
  profile: ProfileScreen,
  quests: QuestsScreen,
  guide: GuideScreen,
  pen: PenScreen,
  colosseum: ArenaLobbyScreen,
  king: KingScreen,
  tournament: TournamentScreen,
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
      <component :is="overlayComponent" v-if="overlayComponent" />
    </template>
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
