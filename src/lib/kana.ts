/* Kana helpers — script conversion and answer normalization. */

const KATAKANA_START = 0x30a1
const KATAKANA_END = 0x30f6
const KANA_SHIFT = 0x60 // distance between matching hiragana / katakana code points

/** Convert any katakana in a string to hiragana. */
export function toHiragana(input: string): string {
  let out = ''
  for (const ch of input) {
    const code = ch.codePointAt(0)!
    out += code >= KATAKANA_START && code <= KATAKANA_END ? String.fromCodePoint(code - KANA_SHIFT) : ch
  }
  return out
}

/** Convert any hiragana in a string to katakana. */
export function toKatakana(input: string): string {
  let out = ''
  for (const ch of input) {
    const code = ch.codePointAt(0)!
    out += code >= KATAKANA_START - KANA_SHIFT && code <= KATAKANA_END - KANA_SHIFT
      ? String.fromCodePoint(code + KANA_SHIFT)
      : ch
  }
  return out
}

/** True if the string contains only kana (hiragana/katakana), the prolonged mark, or spaces. */
export function isKana(input: string): boolean {
  return /^[\p{Script=Hiragana}\p{Script=Katakana}ー\s]*$/u.test(input)
}

/**
 * Normalize a reading for comparison: trim, drop spaces / the prolonged-sound
 * mark, fold full/half width and unify kana script to hiragana. This lets a
 * learner answer in either kana for on'yomi vs kun'yomi.
 */
export function normalizeReading(input: string): string {
  return toHiragana(input.normalize('NFKC').trim().replace(/[\sー・]/g, '').toLowerCase())
}

/** Normalize an English meaning for lenient comparison. */
export function normalizeMeaning(input: string): string {
  return input
    .normalize('NFKC')
    .toLowerCase()
    .replace(/^(to |the |a |an )/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
