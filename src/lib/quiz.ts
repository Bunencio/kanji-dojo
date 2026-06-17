/* Question generation shared by the quiz-style games (multiple choice, typing,
   time attack, recognition). Pure functions — no React, no globals. */

import type { Kanji } from '@/data/types'
import { normalizeMeaning, normalizeReading } from './kana'
import { pickOne, sample, shuffle } from './random'

/** Which side of the card is being tested. */
export type TestField = 'reading' | 'meaning'

/**
 * Recall: see the kanji, produce the reading/meaning (the core study direction).
 * Recognize: see the reading/meaning, pick the kanji (recognition practice).
 */
export type Direction = 'recall' | 'recognize'

export interface Choice {
  key: string
  label: string
  correct: boolean
}

export interface Question {
  key: string
  target: Kanji
  testField: TestField
  direction: Direction
  /** Large primary prompt (kanji glyph, a reading, or a meaning). */
  promptMain: string
  /** Small caption describing what the prompt is. */
  promptCaption: string
  /** Render the prompt as a kanji glyph (big serif) vs. plain text. */
  promptIsGlyph: boolean
  /** Options for multiple-choice / time-attack games. */
  choices: Choice[]
  /** Normalized answers accepted in typed mode. */
  accepted: string[]
  /** Canonical answer shown on reveal. */
  answerDisplay: string
  /** Script of the answer, for styling the reveal. */
  answerScript: 'kanji' | 'kana' | 'en'
}

/* ----------------------------- distractor pools ----------------------------- */

/** The full reading set of a kanji joined for display, e.g. "ニン・みとめる". */
export function readingSet(k: Kanji): string {
  return k.readings.join('・')
}

/**
 * Distractors are other kanji's COMPLETE reading sets, so the correct option
 * shows every reading (on'yomi + kun'yomi) — matching the answer reveal.
 * Candidates that share any reading with the target are excluded so the only
 * fully-correct option is the target's. Same-size sets are preferred so option
 * lengths stay uniform and don't hint at the answer.
 */
function readingSetDistractors(pool: readonly Kanji[], target: Kanji, n: number): string[] {
  const targetReadings = new Set(target.readings.map(normalizeReading))
  const targetKey = [...targetReadings].sort().join('|')
  const seenKeys = new Set<string>([targetKey])
  const same: string[] = []
  const other: string[] = []
  for (const k of pool) {
    if (k.id === target.id) continue
    if (k.readings.some((r) => targetReadings.has(normalizeReading(r)))) continue
    const key = k.readings.map(normalizeReading).sort().join('|')
    if (seenKeys.has(key)) continue
    seenKeys.add(key)
    ;(k.readings.length === target.readings.length ? same : other).push(readingSet(k))
  }
  return [...sample(same, n), ...sample(other, n)].slice(0, n)
}

function meaningDistractors(pool: readonly Kanji[], exclude: Set<string>, n: number): string[] {
  const seen = new Set<string>()
  const candidates: string[] = []
  for (const k of pool) {
    const norm = normalizeMeaning(k.meaning)
    if (exclude.has(norm) || seen.has(norm)) continue
    seen.add(norm)
    candidates.push(k.meaning)
  }
  return sample(candidates, n)
}

function kanjiDistractors(pool: readonly Kanji[], target: Kanji, sharedAnswer: Set<string>, n: number): Kanji[] {
  const candidates = pool.filter((k) => {
    if (k.id === target.id) return false
    // Skip homographs — a different entry written the same way would be a valid answer.
    if (k.kanji === target.kanji) return false
    // Avoid distractors that would also be a correct answer to the prompt.
    if (k.readings.some((r) => sharedAnswer.has(normalizeReading(r)))) return false
    if (sharedAnswer.has(normalizeMeaning(k.meaning))) return false
    return true
  })
  // Dedupe by visible label so two same-looking words never both appear.
  const seen = new Set<string>([target.kanji])
  const unique: Kanji[] = []
  for (const k of candidates) {
    if (seen.has(k.kanji)) continue
    seen.add(k.kanji)
    unique.push(k)
  }
  return sample(unique, n)
}

function toChoices(correct: string, distractors: string[]): Choice[] {
  const seen = new Set<string>([correct])
  const all: Choice[] = [{ key: 'correct', label: correct, correct: true }]
  distractors.forEach((d, i) => {
    if (seen.has(d)) return
    seen.add(d)
    all.push({ key: `d${i}`, label: d, correct: false })
  })
  return shuffle(all)
}

/* --------------------------------- builder --------------------------------- */

export interface BuildOptions {
  testField: TestField
  direction: Direction
  optionCount: number
}

let counter = 0

/** Build a single question for `target`, drawing distractors from `pool`. */
export function buildQuestion(target: Kanji, pool: readonly Kanji[], opts: BuildOptions): Question {
  const { testField, direction, optionCount } = opts
  const key = `q${counter++}-${target.id}`
  const distractorCount = Math.max(1, optionCount - 1)

  if (direction === 'recall') {
    if (testField === 'reading') {
      // The correct choice is the kanji's full reading set so on'yomi AND
      // kun'yomi are both shown, matching the reveal.
      const correct = readingSet(target)
      const choices = toChoices(correct, readingSetDistractors(pool, target, distractorCount))
      return {
        key,
        target,
        testField,
        direction,
        promptMain: target.kanji,
        promptCaption: 'What is the reading?',
        promptIsGlyph: true,
        choices,
        // Typed mode still accepts any single reading.
        accepted: target.readings.map(normalizeReading),
        answerDisplay: correct,
        answerScript: 'kana',
      }
    }
    // meaning
    const correct = target.meaning
    const exclude = new Set([normalizeMeaning(target.meaning)])
    const choices = toChoices(correct, meaningDistractors(pool, exclude, distractorCount))
    const accepted = new Set<string>()
    for (const m of target.meanings) accepted.add(normalizeMeaning(m))
    for (const part of target.meaning.split(/[,;/]/)) accepted.add(normalizeMeaning(part))
    // Also accept the full displayed gloss typed verbatim.
    accepted.add(normalizeMeaning(target.meaning))
    return {
      key,
      target,
      testField,
      direction,
      promptMain: target.kanji,
      promptCaption: 'What is the meaning?',
      promptIsGlyph: true,
      choices,
      accepted: [...accepted].filter(Boolean),
      answerDisplay: target.meaning,
      answerScript: 'en',
    }
  }

  // direction === 'recognize' → prompt is the reading/meaning, answer is the kanji
  const promptMain = testField === 'reading' ? pickOne(target.readings) : target.meaning
  const sharedAnswer = new Set(
    testField === 'reading' ? [normalizeReading(promptMain)] : [normalizeMeaning(target.meaning)],
  )
  const distractors = kanjiDistractors(pool, target, sharedAnswer, distractorCount)
  const choices = shuffle([
    { key: 'correct', label: target.kanji, correct: true },
    ...distractors.map((k) => ({ key: `d${k.id}`, label: k.kanji, correct: false })),
  ])
  return {
    key,
    target,
    testField,
    direction,
    promptMain,
    promptCaption: testField === 'reading' ? 'Which kanji has this reading?' : 'Which kanji means this?',
    promptIsGlyph: false,
    choices,
    accepted: [normalizeReading(target.kanji)],
    answerDisplay: target.kanji,
    answerScript: 'kanji',
  }
}

/* ------------------------------ answer checking ----------------------------- */

export function checkTyped(question: Question, raw: string): boolean {
  const value = question.testField === 'reading' ? normalizeReading(raw) : normalizeMeaning(raw)
  if (!value) return false
  return question.accepted.includes(value)
}
