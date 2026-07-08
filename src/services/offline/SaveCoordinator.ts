import type { PersistedState } from './saveSchema'

export interface SaveCoordinator {
  schedule(state: PersistedState): void
  flush(): void
}

export function createSaveCoordinator(
  persist: (state: PersistedState) => void,
  delayMs = 400,
): SaveCoordinator {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: PersistedState | null = null

  const commit = (): void => {
    timer = null
    if (pending) {
      const snapshot = pending
      pending = null
      persist(snapshot)
    }
  }

  return {
    schedule(state) {
      pending = state
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(commit, delayMs)
    },
    flush() {
      if (timer) {
        clearTimeout(timer)
      }
      commit()
    },
  }
}
