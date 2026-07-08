import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWorldStore = defineStore('world', () => {
  const prompt = ref<string | null>(null)

  function setPrompt(value: string | null): void {
    prompt.value = value
  }

  return { prompt, setPrompt }
})
