/* Content collections and study decks.
 *
 * There are two collections of study items (both share the `Kanji` shape):
 *   - "kanji" : the 336 individual N3 kanji (readings + meaning)
 *   - "vocab" : the 856 N3 vocabulary words (word + reading + meaning)
 *
 * Each collection is sliced into focused study sets, derived from the data so
 * adding entries extends the decks automatically.
 */

import type { Kanji } from './types'
import { KANJI } from './kanji'
import { VOCAB } from './vocab'

export interface Deck {
  id: string
  /** Owning collection id — part of each item's global key. */
  collectionId: string
  label: string
  caption: string
  kanji: Kanji[]
}

/** Global key for a study item, unique across collections. */
export function itemUid(collectionId: string, id: number): string {
  return `${collectionId}:${id}`
}

export interface Collection {
  id: string
  label: string
  jp: string
  caption: string
  count: number
  decks: Deck[]
}

/** Items per focused study set. */
export const SET_SIZE = 24

function buildDecks(all: Kanji[], allLabel: string, collectionId: string): Deck[] {
  const allDeck: Deck = {
    id: 'all',
    collectionId,
    label: allLabel,
    caption: `Full deck · ${all.length}`,
    kanji: all,
  }
  const sets: Deck[] = []
  for (let i = 0; i < all.length; i += SET_SIZE) {
    const slice = all.slice(i, i + SET_SIZE)
    const n = sets.length + 1
    sets.push({
      id: `set-${n}`,
      collectionId,
      label: `Set ${n}`,
      caption: `${i + 1}–${i + slice.length}`,
      kanji: slice,
    })
  }
  return [allDeck, ...sets]
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'kanji',
    label: 'Kanji',
    jp: '漢字',
    caption: 'Single characters · readings & meaning',
    count: KANJI.length,
    decks: buildDecks(KANJI, 'All kanji', 'kanji'),
  },
  {
    id: 'vocab',
    label: 'Vocabulary',
    jp: '語彙',
    caption: 'Words · reading & translation',
    count: VOCAB.length,
    decks: buildDecks(VOCAB, 'All words', 'vocab'),
  },
]

export function collectionById(id: string): Collection {
  return COLLECTIONS.find((c) => c.id === id) ?? COLLECTIONS[0]
}

export function deckById(collectionId: string, deckId: string): Deck {
  const collection = collectionById(collectionId)
  return collection.decks.find((d) => d.id === deckId) ?? collection.decks[0]
}
