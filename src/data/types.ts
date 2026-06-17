/** JLPT difficulty level of a kanji. */
export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

/**
 * A study entry — either a single kanji or a vocabulary word. Both share this
 * shape so every game works on either collection.
 *
 * `readings` keep their authentic script: single-kanji on'yomi in katakana
 * (e.g. チュウ), kun'yomi in hiragana (e.g. むこう); vocabulary words carry one
 * full-word reading. Answer-checking normalizes script, so a learner may type
 * either kana when answering.
 */
export interface Kanji {
  /** Stable id (also defines study order within the source deck). */
  id: number
  /** The kanji character, or the vocabulary word. */
  kanji: string
  /** Accepted readings, most representative first. */
  readings: string[]
  /** Concise English gloss for display, e.g. "direction, facing". */
  meaning: string
  /** Lowercase answers accepted in typed Meaning mode, e.g. ["direction","facing"]. */
  meanings: string[]
  /** JLPT level. */
  level: JlptLevel
}
