/* Per-kanji mastery tracking. Pure helpers; persistence is handled by the
   useProgress hook. */

import type { Kanji } from '@/data/types'

export interface KanjiStat {
  seen: number
  correct: number
  /** Consecutive correct answers; resets to 0 on a miss. */
  streak: number
  /** Epoch ms of last review. */
  lastSeen: number
}

export type ProgressMap = Record<number, KanjiStat>

export const emptyStat = (): KanjiStat => ({ seen: 0, correct: 0, streak: 0, lastSeen: 0 })

/** Apply one review result, returning a new map (immutable update). */
export function recordResult(map: ProgressMap, kanjiId: number, correct: boolean, now: number): ProgressMap {
  const prev = map[kanjiId] ?? emptyStat()
  const next: KanjiStat = {
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
    streak: correct ? prev.streak + 1 : 0,
    lastSeen: now,
  }
  return { ...map, [kanjiId]: next }
}

/** Mastery on a 0–5 scale, driven by the current correct streak. */
export function masteryLevel(stat: KanjiStat | undefined): number {
  if (!stat || stat.seen === 0) return 0
  return Math.min(5, stat.streak)
}

export interface ProgressSummary {
  studied: number
  mastered: number
  totalSeen: number
  totalCorrect: number
  accuracy: number // 0–1
}

export function summarize(map: ProgressMap, deck: readonly Kanji[]): ProgressSummary {
  let studied = 0
  let mastered = 0
  let totalSeen = 0
  let totalCorrect = 0
  for (const k of deck) {
    const stat = map[k.id]
    if (!stat || stat.seen === 0) continue
    studied++
    totalSeen += stat.seen
    totalCorrect += stat.correct
    if (masteryLevel(stat) >= 5) mastered++
  }
  return {
    studied,
    mastered,
    totalSeen,
    totalCorrect,
    accuracy: totalSeen === 0 ? 0 : totalCorrect / totalSeen,
  }
}

/**
 * Order a deck for study. `weakFirst` prioritizes unseen and low-streak kanji
 * so practice naturally targets weak spots; otherwise the source order is kept.
 */
export function orderForStudy(deck: readonly Kanji[], map: ProgressMap, weakFirst: boolean): Kanji[] {
  if (!weakFirst) return deck.slice()
  return deck
    .map((k, i) => ({ k, i, score: weaknessScore(map[k.id]) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.k)
}

function weaknessScore(stat: KanjiStat | undefined): number {
  if (!stat || stat.seen === 0) return 100 // unseen → highest priority
  const accuracy = stat.correct / stat.seen
  return (1 - accuracy) * 50 + Math.max(0, 5 - stat.streak) * 5
}
