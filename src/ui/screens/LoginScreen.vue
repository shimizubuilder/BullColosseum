<script setup lang="ts">
import { ref } from 'vue'
import { ELEMENTS, ELEMENT_IDS, type ElementId } from '@/domain/config/elements'
import { AVATARS, AVATAR_IDS, type AvatarId } from '@/domain/config/avatars'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { useSceneStore } from '@/stores/useSceneStore'
import IconLaurels from '~icons/game-icons/laurels'

const player = usePlayerStore()
const session = useSessionStore()
const scene = useSceneStore()

const username = ref('')
const bullName = ref('')
const element = ref<ElementId>('fire')
const avatar = ref<AvatarId>('ansem')
const submitting = ref(false)

async function enter(): Promise<void> {
  if (submitting.value) {
    return
  }
  submitting.value = true
  await player.register({
    username: username.value.trim().slice(0, 16) || 'Ansem',
    avatar: avatar.value,
    bullName: bullName.value.trim().slice(0, 14) || 'Toro',
    element: element.value,
  })
  scene.goto('world')
  submitting.value = false
}
</script>

<template>
  <section class="login">
    <div class="status" :class="{ 'is-online': session.online }">
      <span class="status__dot" />
      {{ session.online ? 'server online' : 'offline · local play' }}
    </div>

    <div class="panel">
      <header class="brand">
        <div class="brand__row">
          <IconLaurels class="brand__laurel" />
          <h1>CHARGE ARENA</h1>
          <IconLaurels class="brand__laurel brand__laurel--mirrored" />
        </div>
        <p>No Retreat. Only Charge.</p>
      </header>

      <label class="field">
        <span class="field__label">Handler name</span>
        <input v-model="username" class="field__input" maxlength="16" placeholder="Ansem" />
      </label>

      <label class="field">
        <span class="field__label">Bull name</span>
        <input v-model="bullName" class="field__input" maxlength="14" placeholder="Toro" />
      </label>

      <div class="field">
        <span class="field__label">Element</span>
        <div class="chips">
          <button
            v-for="id in ELEMENT_IDS"
            :key="id"
            type="button"
            class="chip"
            :class="{ 'is-selected': element === id }"
            :style="{ '--chip': ELEMENTS[id].primaryColor }"
            @click="element = id"
          >
            <span class="chip__dot" />
            <b>{{ ELEMENTS[id].name }}</b>
            <small>{{ ELEMENTS[id].description }}</small>
          </button>
        </div>
      </div>

      <div class="field">
        <span class="field__label">Avatar</span>
        <div class="avatars">
          <button
            v-for="id in AVATAR_IDS"
            :key="id"
            type="button"
            class="avatar"
            :class="{ 'is-selected': avatar === id }"
            :style="{ '--outfit': AVATARS[id].outfit }"
            @click="avatar = id"
          >
            <span class="avatar__swatch" />
            <small>{{ AVATARS[id].name }}</small>
          </button>
        </div>
      </div>

      <button class="enter" type="button" :disabled="submitting" @click="enter">
        {{ submitting ? 'Entering…' : 'Enter the Arena' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.login {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: safe center;
  justify-content: center;
  padding: calc(1.5rem + env(safe-area-inset-top)) calc(1.5rem + env(safe-area-inset-right))
    calc(1.5rem + env(safe-area-inset-bottom)) calc(1.5rem + env(safe-area-inset-left));
  pointer-events: auto;
  background:
    radial-gradient(120% 80% at 50% -10%, rgba(229, 72, 77, 0.14), transparent 60%),
    var(--color-bg);
  overflow-y: auto;
}

.status {
  position: absolute;
  top: calc(1rem + env(safe-area-inset-top));
  right: calc(1.25rem + env(safe-area-inset-right));
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-live);
  box-shadow: 0 0 8px currentColor;
}

.status.is-online .status__dot {
  background: #57d68a;
}

.panel {
  position: relative;
  width: min(420px, 100%);
  padding: 2rem 1.75rem;
  border: 1px solid var(--color-border-bronze);
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(27, 33, 41, 0.9), rgba(15, 18, 22, 0.92));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-gold-soft), transparent);
}

.brand {
  text-align: center;
  margin-bottom: 0.25rem;
}

.brand__row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.brand__laurel {
  width: 1.6rem;
  height: 1.6rem;
  flex: none;
  color: var(--color-gold-soft);
}

.brand__laurel--mirrored {
  transform: scaleX(-1);
}

.brand h1 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.8rem;
  letter-spacing: 0.14em;
  color: var(--color-accent);
  text-shadow: 0 0 18px rgba(229, 72, 77, 0.35);
}

.brand p {
  margin: 0.35rem 0 0;
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field__label {
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.field__input {
  height: 44px;
  padding: 0 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: rgba(10, 13, 17, 0.7);
  color: var(--color-text);
  font-size: 16px;
  outline: none;
  transition: border-color 0.15s ease;
}

.field__input:focus {
  border-color: var(--color-accent);
}

.chips {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: rgba(10, 13, 17, 0.5);
  color: var(--color-text);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.chip.is-selected {
  border-color: var(--chip);
  background: color-mix(in srgb, var(--chip) 16%, transparent);
}

.chip__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--chip);
  box-shadow: 0 0 8px var(--chip);
}

.chip b {
  font-size: 0.85rem;
}

.chip small {
  color: var(--color-text-muted);
  font-size: 0.7rem;
}

.avatars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(52px, 1fr));
  gap: 0.5rem;
}

.avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.25rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: rgba(10, 13, 17, 0.5);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.avatar.is-selected {
  border-color: var(--outfit);
  color: var(--color-text);
}

.avatar__swatch {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--outfit);
}

.avatar small {
  font-size: 0.66rem;
}

.enter {
  margin-top: 0.35rem;
  height: 50px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, var(--color-accent-strong), var(--color-accent));
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: filter 0.15s ease;
}

@media (hover: hover) {
  .enter:hover {
    filter: brightness(1.08);
  }
}

.enter:active {
  filter: brightness(0.94);
}

.enter:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
