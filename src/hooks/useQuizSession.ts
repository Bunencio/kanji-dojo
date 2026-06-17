import { useCallback, useMemo, useRef, useState } from 'react'
import type { Kanji } from '@/data/types'
import type { ProgressMap } from '@/lib/progress'
import { orderForStudy } from '@/lib/progress'
import { shuffle } from '@/lib/random'
import { buildQuestion, type Direction, type Question } from '@/lib/quiz'
import { resolveField, type StudyField } from '@/lib/config'

export interface QuizSessionConfig {
  pool: Kanji[]
  collectionId: string
  field: StudyField
  direction: Direction
  optionCount: number
  /** 0 = whole pool. */
  length: number
  weakFirst: boolean
  progressMap: ProgressMap
  /** Explicit, pre-ordered target list (e.g. a Smart Review queue). Overrides ordering/length. */
  targets?: Kanji[]
}

export interface QuizSession {
  question: Question
  index: number
  total: number
  isLast: boolean
  correctCount: number
  /** Record the outcome of the current question. */
  answer: (correct: boolean) => void
  /** Advance to the next question (caller decides when). */
  next: () => void
  log: { kanji: Kanji; correct: boolean }[]
}

/**
 * Drives a sequence of generated questions over a kanji pool. The target order
 * is fixed at session start; each question's distractors are generated lazily
 * and memoized so re-renders stay stable.
 */
export function useQuizSession(config: QuizSessionConfig): QuizSession {
  const { pool, collectionId, field, direction, optionCount, length, weakFirst, progressMap } = config

  // Fix the target order once, at mount.
  const targets = useMemo(() => {
    if (config.targets) return config.targets
    const base = weakFirst ? orderForStudy(pool, progressMap, collectionId, true) : shuffle(pool)
    const n = length === 0 ? base.length : Math.min(length, base.length)
    return base.slice(0, n)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const logRef = useRef<{ kanji: Kanji; correct: boolean }[]>([])

  // Build (and cache) the question for the current index.
  const cache = useRef<Map<number, Question>>(new Map())
  const question = useMemo(() => {
    const cached = cache.current.get(index)
    if (cached) return cached
    const target = targets[index]
    const q = buildQuestion(target, pool, {
      testField: resolveField(field, index),
      direction,
      optionCount,
    })
    cache.current.set(index, q)
    return q
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, targets])

  const answer = useCallback(
    (correct: boolean) => {
      logRef.current.push({ kanji: question.target, correct })
      if (correct) setCorrectCount((c) => c + 1)
    },
    [question],
  )

  const next = useCallback(() => setIndex((i) => i + 1), [])

  return {
    question,
    index,
    total: targets.length,
    isLast: index >= targets.length - 1,
    correctCount,
    answer,
    next,
    log: logRef.current,
  }
}
