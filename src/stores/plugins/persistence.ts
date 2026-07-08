import { watch } from 'vue'
import { browserStorage, loadSave, writeSave, type KeyValueStore } from '@/services/offline/LocalSaveStore'
import { createSaveCoordinator } from '@/services/offline/SaveCoordinator'
import { usePlayerStore } from '../usePlayerStore'
import { useSessionStore } from '../useSessionStore'
import { useQuestStore } from '../useQuestStore'

export function setupPersistence(storage: KeyValueStore = browserStorage()): void {
  const player = usePlayerStore()
  const session = useSessionStore()
  const quest = useQuestStore()

  const saved = loadSave(storage)
  if (saved) {
    if (saved.player) {
      player.setPlayer(saved.player)
    }
    session.setTutorialDone(saved.tutorialDone)
    if (saved.quests) {
      quest.hydrate(saved.quests)
    }
  }

  const coordinator = createSaveCoordinator((state) => writeSave(storage, state))

  watch(
    () => [player.player, session.tutorialDone, quest.dailyList, quest.resetDate] as const,
    () => {
      coordinator.schedule({
        player: player.player,
        tutorialDone: session.tutorialDone,
        quests: quest.snapshot(),
      })
    },
    { deep: true },
  )
}
