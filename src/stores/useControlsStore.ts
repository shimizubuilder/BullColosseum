import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useControlsStore = defineStore('controls', () => {
  const moveX = ref(0)
  const moveY = ref(0)
  const interactSeq = ref(0)

  function setMove(x: number, y: number): void {
    moveX.value = x
    moveY.value = y
  }

  function stopMove(): void {
    moveX.value = 0
    moveY.value = 0
  }

  function interact(): void {
    interactSeq.value += 1
  }

  return { moveX, moveY, interactSeq, setMove, stopMove, interact }
})
