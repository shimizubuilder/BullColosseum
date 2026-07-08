<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useChatStore } from '@/stores/useChatStore'
import { AVATARS, type AvatarId } from '@/domain/config/avatars'

const chat = useChatStore()
const draft = ref('')
const log = useTemplateRef<HTMLDivElement>('log')

const POLL_INTERVAL_MS = 2500
let timer: ReturnType<typeof setInterval> | null = null

function usernameColor(avatar: string): string {
  return (AVATARS[avatar as AvatarId] ?? AVATARS.ansem).outfit
}

function scrollToBottom(): void {
  const element = log.value
  if (element) {
    element.scrollTop = element.scrollHeight
  }
}

async function submit(): Promise<void> {
  const text = draft.value
  draft.value = ''
  await chat.send(text)
}

watch(
  () => chat.messages.length,
  () => nextTick(scrollToBottom),
)

onMounted(() => {
  void chat.poll()
  timer = setInterval(() => void chat.poll(), POLL_INTERVAL_MS)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <section class="chat" :class="{ 'is-minimized': chat.minimized }">
    <header class="chat__head" @click="chat.toggleMinimized()">
      <b>GLOBAL CHAT</b>
      <span class="chat__mode" :class="`chat__mode--${chat.mode}`">{{ chat.mode }}</span>
      <button class="chat__toggle" type="button" aria-label="Toggle chat">{{ chat.minimized ? '▲' : '▼' }}</button>
    </header>
    <div v-show="!chat.minimized" class="chat__body">
      <div ref="log" class="chat__log">
        <p v-for="(entry, index) in chat.messages" :key="entry.id ?? `local-${index}`" class="chat__line">
          <span class="chat__user" :style="{ color: usernameColor(entry.avatar) }">{{ entry.username }}:</span>
          <span class="chat__text">{{ entry.message }}</span>
        </p>
      </div>
      <form class="chat__form" @submit.prevent="submit">
        <input v-model="draft" class="chat__input" maxlength="140" placeholder="Say something…" />
        <button class="chat__send" type="submit">➤</button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.chat {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  width: min(320px, 34vw);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: rgba(12, 9, 20, 0.86);
  pointer-events: auto;
  z-index: 3;
  overflow: hidden;
}

.chat__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.7rem;
  cursor: pointer;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}

.chat__mode {
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  font-size: 0.62rem;
  text-transform: uppercase;
}

.chat__mode--online {
  background: rgba(64, 200, 128, 0.18);
  color: #56d6a0;
}

.chat__mode--offline {
  background: rgba(229, 72, 77, 0.18);
  color: var(--color-accent);
}

.chat__toggle {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
}

.chat__log {
  height: 150px;
  overflow-y: auto;
  padding: 0.5rem 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.chat__line {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.35;
  word-break: break-word;
}

.chat__user {
  font-weight: 700;
  margin-right: 0.3rem;
}

.chat__text {
  color: var(--color-text);
}

.chat__form {
  display: flex;
  gap: 0.4rem;
  padding: 0.5rem 0.7rem;
  border-top: 1px solid var(--color-border);
}

.chat__input {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: rgba(10, 13, 17, 0.6);
  color: var(--color-text);
  font-size: 0.8rem;
}

.chat__send {
  width: 36px;
  border: none;
  border-radius: 8px;
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
}
</style>
