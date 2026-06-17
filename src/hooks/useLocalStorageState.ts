import { useCallback, useEffect, useRef, useState } from 'react'
import { loadJSON, saveJSON } from '@/lib/storage'

/** useState that transparently persists to localStorage under a namespaced key. */
export function useLocalStorageState<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => loadJSON<T>(key, initial))
  const keyRef = useRef(key)
  keyRef.current = key

  useEffect(() => {
    saveJSON(keyRef.current, state)
  }, [state])

  const set = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => (typeof value === 'function' ? (value as (p: T) => T)(prev) : value))
  }, [])

  return [state, set]
}
