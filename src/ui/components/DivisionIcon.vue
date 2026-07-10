<script setup lang="ts">
import type { Component } from 'vue'
import type { DivisionIconKey } from '@/domain/config/divisions'
import IconLaurels from '~icons/game-icons/laurels'
import IconSparkles from '~icons/tabler/sparkles'
import IconDiamond from '~icons/tabler/diamond'
import IconCrossedSwords from '~icons/game-icons/crossed-swords'
import IconLaurelCrown from '~icons/game-icons/laurel-crown'

const ICONS: Record<DivisionIconKey, Component> = {
  bronze: IconLaurels,
  silver: IconLaurels,
  gold: IconLaurels,
  platinum: IconSparkles,
  diamond: IconDiamond,
  gladiator: IconCrossedSwords,
  emperor: IconLaurelCrown,
}

const props = defineProps<{
  iconKey: DivisionIconKey
}>()
</script>

<template>
  <component :is="ICONS[props.iconKey]" class="division-icon" />
</template>

<style scoped>
.division-icon {
  width: 1em;
  height: 1em;
  flex: none;
}
</style>
