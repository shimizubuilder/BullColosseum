import { watch } from 'vue'
import { browserStorage, loadSave, writeSave, type KeyValueStore } from '@/services/offline/LocalSaveStore'
import { createSaveCoordinator } from '@/services/offline/SaveCoordinator'
import { usePlayerStore } from '../usePlayerStore'
import { useSessionStore } from '../useSessionStore'

export function setupPersistence(storage: KeyValueStore = browserStorage()): void {
  const player = usePlayerStore()
  const session = useSessionStore()

  const saved = loadSave(storage)
  if (saved) {
    if (saved.player) {
      player.setPlayer(saved.player)
    }
    session.setTutorialDone(saved.tutorialDone)
  }

  const coordinator = createSaveCoordinator((state) => writeSave(storage, state))

  watch(
    () => [player.player, session.tutorialDone] as const,
    () => {
      coordinator.schedule({ player: player.player, tutorialDone: session.tutorialDone })
    },
    { deep: true },
  )
}
