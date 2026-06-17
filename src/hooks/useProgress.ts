import { useCallback } from 'react'
import { recordResult, type ProgressMap } from '@/lib/progress'
import { useLocalStorageState } from './useLocalStorageState'

export interface ProgressApi {
  map: ProgressMap
  record: (kanjiId: number, correct: boolean) => void
  reset: () => void
}

/** Owns the persisted per-kanji mastery map. */
export function useProgress(): ProgressApi {
  const [map, setMap] = useLocalStorageState<ProgressMap>('progress', {})

  const record = useCallback(
    (kanjiId: number, correct: boolean) => {
      setMap((prev) => recordResult(prev, kanjiId, correct, Date.now()))
    },
    [setMap],
  )

  const reset = useCallback(() => setMap({}), [setMap])

  return { map, record, reset }
}
