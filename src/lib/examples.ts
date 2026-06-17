/* Example-word lookup: for a single kanji, find vocabulary words that contain
   it (with their reading), drawn from the vocab collection. */

import type { Kanji } from '@/data/types'
import { VOCAB } from '@/data/vocab'

const HAN = /\p{Script=Han}/u

// char → words containing it, built once. Only multi-character words qualify as
// "examples" (a single-char vocab entry is just the kanji itself).
const INDEX = new Map<string, Kanji[]>()
for (const word of VOCAB) {
  if ([...word.kanji].length < 2) continue
  const chars = new Set([...word.kanji].filter((c) => HAN.test(c)))
  for (const c of chars) {
    const list = INDEX.get(c)
    if (list) list.push(word)
    else INDEX.set(c, [word])
  }
}
// Shorter, simpler words first.
for (const list of INDEX.values()) {
  list.sort((a, b) => [...a.kanji].length - [...b.kanji].length || a.id - b.id)
}

/** Up to `limit` example words containing `kanji` (empty unless `kanji` is one character). */
export function examplesFor(kanji: string, limit = 3): Kanji[] {
  if ([...kanji].length !== 1) return []
  return (INDEX.get(kanji) ?? []).slice(0, limit)
}
