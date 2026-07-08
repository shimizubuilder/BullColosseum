import { CURRENT_SCHEMA_VERSION, saveEnvelopeSchema, type PersistedState } from './saveSchema'
import { migrateLegacyV2 } from './migrations'

const SAVE_KEY = 'chargearena_v3'
const LEGACY_SAVE_KEY = 'chargearena_v2'
const LEGACY_TUTORIAL_KEY = 'chargearena_tut'

export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function browserStorage(): KeyValueStore {
  return {
    getItem: (key) => (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
    setItem: (key, value) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value)
      }
    },
    removeItem: (key) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key)
      }
    },
  }
}

function tryParse(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function writeSave(storage: KeyValueStore, state: PersistedState): void {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify({ schemaVersion: CURRENT_SCHEMA_VERSION, data: state }))
  } catch {
    /* storage unavailable or over quota — offline persistence is best-effort */
  }
}

export function loadSave(storage: KeyValueStore): PersistedState | null {
  const currentRaw = storage.getItem(SAVE_KEY)
  if (currentRaw) {
    const parsed = saveEnvelopeSchema.safeParse(tryParse(currentRaw))
    if (parsed.success) {
      return parsed.data.data as unknown as PersistedState
    }
  }

  const legacyRaw = storage.getItem(LEGACY_SAVE_KEY)
  if (legacyRaw) {
    const tutorialDone = storage.getItem(LEGACY_TUTORIAL_KEY) === '1'
    const migrated = migrateLegacyV2(tryParse(legacyRaw), tutorialDone)
    if (migrated) {
      writeSave(storage, migrated)
      return migrated
    }
  }

  return null
}
