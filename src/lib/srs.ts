/* Spaced-repetition scheduling (SM-2-lite / Leitner hybrid).
 *
 * Each item carries a `due` time and a growing `interval`. Answer it correctly
 * and the next review is pushed further out; miss it and it comes back in
 * minutes. Reviewing items right as they come due is the fastest known way to
 * move them into long-term memory. Keyed by item uid ("<collection>:<id>").
 */

import type { Kanji } from '@/data/types'
import { itemUid } from '@/data/decks'
import { shuffle } from './random'

export interface SrsState {
  /** Consecutive successful reviews. */
  reps: number
  /** Current interval in days. */
  interval: number
  /** Ease factor (1.3–3.0); shrinks on lapses. */
  ease: number
  /** Epoch ms when the item is next due. */
  due: number
  /** Times forgotten after being learned. */
  lapses: number
  /** Epoch ms of last review. */
  last: number
}

export type SrsMap = Record<string, SrsState>

const DAY = 86_400_000
const MIN = 60_000

/** Compute the next SRS state from a review outcome. */
export function reviewState(prev: SrsState | undefined, correct: boolean, now: number): SrsState {
  const base: SrsState = prev ?? { reps: 0, interval: 0, ease: 2.5, due: now, lapses: 0, last: 0 }

  // Ignore rapid repeat-reviews (e.g. Survival looping) so intervals don't run away.
  if (prev && now - prev.last < MIN) return { ...base, last: now }

  if (!correct) {
    return {
      reps: 0,
      interval: 0,
      ease: Math.max(1.3, base.ease - 0.2),
      due: now + 10 * MIN, // relearn shortly
      lapses: base.lapses + 1,
      last: now,
    }
  }

  const reps = base.reps + 1
  let interval: number
  if (reps === 1) interval = 1
  else if (reps === 2) interval = 3
  else interval = Math.max(1, Math.round(base.interval * base.ease))

  return { reps, interval, ease: base.ease, due: now + interval * DAY, lapses: base.lapses, last: now }
}

export const isNew = (s: SrsState | undefined): boolean => !s
export const isDue = (s: SrsState | undefined, now: number): boolean => !!s && s.due <= now

/** 0–5 mastery from interval length (0 = new, 5 = ≥3 weeks). */
export function srsLevel(s: SrsState | undefined): number {
  if (!s) return 0
  if (s.interval >= 21) return 5
  if (s.interval >= 7) return 4
  if (s.interval >= 3) return 3
  if (s.interval >= 1) return 2
  return 1
}

/** Number of items in `items` currently due for review. */
export function dueCount(items: readonly Kanji[], collectionId: string, srs: SrsMap, now: number): number {
  let n = 0
  for (const k of items) if (isDue(srs[itemUid(collectionId, k.id)], now)) n++
  return n
}

/** Number of items never studied yet. */
export function newCount(items: readonly Kanji[], collectionId: string, srs: SrsMap): number {
  let n = 0
  for (const k of items) if (isNew(srs[itemUid(collectionId, k.id)])) n++
  return n
}

/**
 * Build a Smart Review queue: all due items (most overdue first) plus a few new
 * items to learn, interleaved. `newAllowance` caps how many brand-new items are
 * introduced; `limit` caps the whole session (0 = no cap).
 */
export function buildReviewQueue(
  items: readonly Kanji[],
  collectionId: string,
  srs: SrsMap,
  now: number,
  limit: number,
  newAllowance = 8,
): Kanji[] {
  const due: Kanji[] = []
  const fresh: Kanji[] = []
  for (const k of items) {
    const s = srs[itemUid(collectionId, k.id)]
    if (isDue(s, now)) due.push(k)
    else if (isNew(s)) fresh.push(k)
  }
  due.sort((a, b) => srs[itemUid(collectionId, a.id)].due - srs[itemUid(collectionId, b.id)].due)

  const room = limit === 0 ? Infinity : Math.max(0, limit - due.length)
  const newItems = shuffle(fresh).slice(0, Math.min(newAllowance, room))
  const queue = shuffle([...due, ...newItems])
  return limit === 0 ? queue : queue.slice(0, limit)
}
