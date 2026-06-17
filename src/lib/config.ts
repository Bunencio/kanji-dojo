/* Shared, user-facing configuration options for the quiz games. */

import type { TestField } from './quiz'

/** Whether a session tests readings, meanings, or a random mix. */
export type StudyField = TestField | 'mixed'

export const STUDY_FIELDS: { id: StudyField; label: string; caption: string }[] = [
  { id: 'reading', label: 'Reading', caption: 'Kanji → hiragana / katakana' },
  { id: 'meaning', label: 'Meaning', caption: 'Kanji → English' },
  { id: 'mixed', label: 'Mixed', caption: 'Both, shuffled together' },
]

export type DifficultyId = 'easy' | 'normal' | 'hard'

export interface Difficulty {
  id: DifficultyId
  label: string
  /** Number of options in multiple-choice games. */
  optionCount: number
  /** Seconds per question in Time Attack (and timed modes). */
  secondsPerQuestion: number
  caption: string
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', label: 'Easy', optionCount: 3, secondsPerQuestion: 12, caption: '3 choices · relaxed' },
  { id: 'normal', label: 'Normal', optionCount: 4, secondsPerQuestion: 8, caption: '4 choices · balanced' },
  { id: 'hard', label: 'Hard', optionCount: 6, secondsPerQuestion: 6, caption: '6 choices · fast' },
]

export const SESSION_LENGTHS = [10, 20, 30, 0] as const // 0 = whole deck
export const lengthLabel = (n: number) => (n === 0 ? 'Whole deck' : `${n} questions`)

export function difficultyById(id: DifficultyId): Difficulty {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1]
}

/** Resolve a per-question test field, honoring "mixed". */
export function resolveField(field: StudyField, index: number): TestField {
  if (field === 'mixed') return index % 2 === 0 ? 'reading' : 'meaning'
  return field
}

/** Persisted, game-agnostic session configuration chosen on the home screen. */
export interface GameConfig {
  collectionId: string
  deckId: string
  field: StudyField
  difficultyId: DifficultyId
  length: number
  weakFirst: boolean
}

export const DEFAULT_CONFIG: GameConfig = {
  collectionId: 'kanji',
  deckId: 'all',
  field: 'reading',
  difficultyId: 'normal',
  length: 10,
  weakFirst: false,
}
