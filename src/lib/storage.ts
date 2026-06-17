/* Tiny, typed, namespaced localStorage wrapper with safe fallbacks. */

const PREFIX = 'kanji-dojo:'

function available(): Storage | null {
  try {
    const k = PREFIX + '__test__'
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return window.localStorage
  } catch {
    return null
  }
}

const store = typeof window !== 'undefined' ? available() : null

export function loadJSON<T>(key: string, fallback: T): T {
  if (!store) return fallback
  try {
    const raw = store.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): void {
  if (!store) return
  try {
    store.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* quota / disabled — ignore, app still works in-memory */
  }
}

export function removeKey(key: string): void {
  if (!store) return
  try {
    store.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}
