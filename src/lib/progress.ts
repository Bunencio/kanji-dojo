/* Per-item mastery stats. Pure helpers; persistence lives in useProgress.
   Items are keyed by their global uid ("<collection>:<id>") so kanji and
   vocabulary never collide. */

import type { Kanji } from '@/data/types'
import { itemUid, type Deck } from '@/data/decks'
import { srsLevel, type SrsMap } from './srs'

export interface KanjiStat {
  seen: number
  correct: number
  /** Consecutive correct answers; resets to 0 on a miss. */
  streak: number
  /** Epoch ms of last review. */
  lastSeen: number
}

export type ProgressMap = Record<string, KanjiStat>

export const emptyStat = (): KanjiStat => ({ seen: 0, correct: 0, streak: 0, lastSeen: 0 })

/** Apply one review result, returning a new map (immutable update). */
export function recordResult(map: ProgressMap, uid: string, correct: boolean, now: number): ProgressMap {
  const prev = map[uid] ?? emptyStat()
  const next: KanjiStat = {
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
    streak: correct ? prev.streak + 1 : 0,
    lastSeen: now,
  }
  return { ...map, [uid]: next }
}

export interface ProgressSummary {
  studied: number
  mastered: number
  totalSeen: number
  totalCorrect: number
  accuracy: number // 0–1
}

/** Summary for a deck, using SRS interval as the mastery signal. */
export function summarize(stats: ProgressMap, srs: SrsMap, deck: Deck): ProgressSummary {
  let studied = 0
  let mastered = 0
  let totalSeen = 0
  let totalCorrect = 0
  for (const k of deck.kanji) {
    const uid = itemUid(deck.collectionId, k.id)
    const stat = stats[uid]
    if (!stat || stat.seen === 0) continue
    studied++
    totalSeen += stat.seen
    totalCorrect += stat.correct
    if (srsLevel(srs[uid]) >= 5) mastered++
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
 * Order a pool for study. `weakFirst` prioritizes unseen and low-accuracy items
 * so practice naturally targets weak spots; otherwise the source order is kept.
 */
export function orderForStudy(
  pool: readonly Kanji[],
  stats: ProgressMap,
  collectionId: string,
  weakFirst: boolean,
): Kanji[] {
  if (!weakFirst) return pool.slice()
  return pool
    .map((k, i) => ({ k, i, score: weaknessScore(stats[itemUid(collectionId, k.id)]) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.k)
}

function weaknessScore(stat: KanjiStat | undefined): number {
  if (!stat || stat.seen === 0) return 100 // unseen → highest priority
  const accuracy = stat.correct / stat.seen
  return (1 - accuracy) * 50 + Math.max(0, 5 - stat.streak) * 5
}
