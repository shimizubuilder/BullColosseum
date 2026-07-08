<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { GameApp } from '@/engine/GameApp'
import { renderIsoPlaceholder } from '@/engine/dev/isoPlaceholder'

const root = useTemplateRef<HTMLDivElement>('root')
let game: GameApp | null = null

onMounted(async () => {
  const container = root.value
  if (!container) {
    return
  }

  game = await GameApp.create()
  game.mount(container)
  renderIsoPlaceholder(game.pixi.stage, game.pixi.screen.width, game.pixi.screen.height)
})

onBeforeUnmount(() => {
  game?.destroy()
  game = null
})
</script>

<template>
  <div ref="root" class="game-stage" />
</template>

<style scoped>
.game-stage {
  position: fixed;
  inset: 0;
  z-index: 0;
}
</style>
