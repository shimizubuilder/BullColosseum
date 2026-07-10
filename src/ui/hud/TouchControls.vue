<script setup lang="ts">
import { onUnmounted, ref, useTemplateRef } from 'vue'
import { useControlsStore } from '@/stores/useControlsStore'
import { useWorldStore } from '@/stores/useWorldStore'
import IconHandClick from '~icons/tabler/hand-click'

const controls = useControlsStore()
const world = useWorldStore()

const base = useTemplateRef<HTMLDivElement>('base')
const knob = ref({ x: 0, y: 0 })
const active = ref(false)

let pointerId: number | null = null
let centerX = 0
let centerY = 0
let radius = 48

function begin(event: PointerEvent): void {
  const element = base.value
  if (!element) {
    return
  }
  const rect = element.getBoundingClientRect()
  centerX = rect.left + rect.width / 2
  centerY = rect.top + rect.height / 2
  radius = rect.width / 2
  pointerId = event.pointerId
  element.setPointerCapture(event.pointerId)
  active.value = true
  drag(event)
}

function drag(event: PointerEvent): void {
  if (pointerId !== event.pointerId) {
    return
  }
  let dx = event.clientX - centerX
  let dy = event.clientY - centerY
  const distance = Math.hypot(dx, dy)
  if (distance > radius) {
    dx = (dx / distance) * radius
    dy = (dy / distance) * radius
  }
  knob.value = { x: dx, y: dy }
  controls.setMove(dx / radius, dy / radius)
}

function release(event: PointerEvent): void {
  if (pointerId !== event.pointerId) {
    return
  }
  pointerId = null
  active.value = false
  knob.value = { x: 0, y: 0 }
  controls.stopMove()
}

onUnmounted(() => controls.stopMove())
</script>

<template>
  <div class="touch">
    <div
      ref="base"
      class="stick"
      :class="{ 'is-active': active }"
      @pointerdown="begin"
      @pointermove="drag"
      @pointerup="release"
      @pointercancel="release"
    >
      <span class="stick__knob" :style="{ transform: `translate(${knob.x}px, ${knob.y}px)` }" />
    </div>
    <button
      class="act"
      :class="{ 'is-ready': world.prompt }"
      type="button"
      aria-label="Interact"
      :disabled="!world.prompt"
      @pointerdown.prevent="controls.interact()"
    >
      <IconHandClick class="act__icon" />
    </button>
  </div>
</template>

<style scoped>
.touch {
  display: none;
}

@media (hover: none) and (pointer: coarse) {
  .touch {
    display: block;
  }
}

.stick {
  position: fixed;
  left: calc(1.25rem + env(safe-area-inset-left));
  bottom: calc(4.75rem + env(safe-area-inset-bottom));
  width: 118px;
  height: 118px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: rgba(15, 18, 22, 0.5);
  pointer-events: auto;
  touch-action: none;
}

.stick.is-active {
  background: rgba(15, 18, 22, 0.72);
}

.stick__knob {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 52px;
  height: 52px;
  margin: -26px 0 0 -26px;
  border-radius: 50%;
  background: rgba(229, 72, 77, 0.55);
  box-shadow: 0 0 14px rgba(229, 72, 77, 0.35);
}

.act {
  position: fixed;
  right: calc(1.25rem + env(safe-area-inset-right));
  bottom: calc(4.75rem + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: rgba(15, 18, 22, 0.5);
  color: var(--color-text-muted);
  pointer-events: auto;
  touch-action: none;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease;
}

.act.is-ready {
  border-color: var(--color-accent);
  background: rgba(229, 72, 77, 0.9);
  color: #fff;
}

.act:active {
  transform: scale(0.92);
}

.act:disabled {
  opacity: 0.45;
}

.act__icon {
  width: 2rem;
  height: 2rem;
  pointer-events: none;
}
</style>
