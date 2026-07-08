import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DataSource = 'server' | 'offline'

export const useSessionStore = defineStore('session', () => {
  const online = ref(false)
  const dataSource = ref<DataSource>('offline')
  const tutorialDone = ref(false)

  function setOnline(value: boolean): void {
    online.value = value
  }

  function setDataSource(source: DataSource): void {
    dataSource.value = source
  }

  function setTutorialDone(done: boolean): void {
    tutorialDone.value = done
  }

  return { online, dataSource, tutorialDone, setOnline, setDataSource, setTutorialDone }
})
