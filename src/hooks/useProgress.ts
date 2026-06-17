import { useCallback } from 'react'
import { recordResult, type ProgressMap } from '@/lib/progress'
import { reviewState, type SrsMap } from '@/lib/srs'
import { defaultDaily, recordStudy, type DailyState } from '@/lib/daily'
import { useLocalStorageState } from './useLocalStorageState'

export interface ProgressApi {
  /** Per-item accuracy stats, keyed by uid. */
  map: ProgressMap
  /** Per-item spaced-repetition schedule, keyed by uid. */
  srs: SrsMap
  /** Daily streak + goal. */
  daily: DailyState
  /** Record one answer: updates stats, SRS schedule and daily streak. */
  record: (uid: string, correct: boolean) => void
  setGoal: (goal: number) => void
  reset: () => void
}

/** The single persisted study store (stats + SRS + daily). */
export function useProgress(): ProgressApi {
  const [map, setMap] = useLocalStorageState<ProgressMap>('progress', {})
  const [srs, setSrs] = useLocalStorageState<SrsMap>('srs', {})
  const [daily, setDaily] = useLocalStorageState<DailyState>('daily', defaultDaily())

  const record = useCallback(
    (uid: string, correct: boolean) => {
      const now = Date.now()
      setMap((prev) => recordResult(prev, uid, correct, now))
      setSrs((prev) => ({ ...prev, [uid]: reviewState(prev[uid], correct, now) }))
      setDaily((prev) => recordStudy(prev, now))
    },
    [setMap, setSrs, setDaily],
  )

  const setGoal = useCallback((goal: number) => setDaily((prev) => ({ ...prev, goal })), [setDaily])

  const reset = useCallback(() => {
    setMap({})
    setSrs({})
    setDaily(defaultDaily())
  }, [setMap, setSrs, setDaily])

  return { map, srs, daily, record, setGoal, reset }
}
