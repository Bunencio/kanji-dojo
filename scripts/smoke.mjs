/* Logic smoke test for the question engine. Exercises every mode/direction on
   both collections, including the smallest deck and hardest option count. */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { buildQuestion, checkTyped } from '/tmp/quiz.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const read = (f) => JSON.parse(readFileSync(join(here, f), 'utf8'))

const readings = read('readings.json')
const meanings = read('meanings.json')
const vocab = read('vocab.json')
const mById = new Map(meanings.map((m) => [m.id, m]))

const KANJI = readings.map((r) => {
  const m = mById.get(r.id)
  return { id: r.id, kanji: r.kanji, readings: r.readings, meaning: m.meaning, meanings: m.meanings, level: 'N3' }
})
// Merge duplicate words exactly as build-data.mjs does.
const tokens = (m) => m.split(/[/,;]|・/).map((s) => s.trim()).filter(Boolean)
const vMerged = new Map()
for (const v of vocab) {
  const e = vMerged.get(v.word)
  if (e) {
    if (!e.readings.includes(v.reading)) e.readings.push(v.reading)
    for (const t of tokens(v.meaning)) if (!e.senses.some((s) => s.toLowerCase() === t.toLowerCase())) e.senses.push(t)
  } else {
    vMerged.set(v.word, { id: v.id, word: v.word, readings: [v.reading], senses: tokens(v.meaning) })
  }
}
const VOCAB = [...vMerged.values()].map((v, i) => ({
  id: i + 1,
  kanji: v.word,
  readings: v.readings,
  meaning: v.senses.join(' / '),
  meanings: Array.from(new Set(v.senses.map((s) => s.toLowerCase()))),
  level: 'N3',
}))

let checks = 0
let failures = 0
function expect(cond, msg) {
  checks++
  if (!cond) {
    failures++
    console.error('  ✗ ' + msg)
  }
}

function exercise(name, pool) {
  // smallest realistic deck = first 24, plus whole deck
  const decks = { 'set(24)': pool.slice(0, 24), all: pool }
  for (const [deckName, deck] of Object.entries(decks)) {
    for (const field of ['reading', 'meaning']) {
      for (const direction of ['recall', 'recognize']) {
        for (const optionCount of [3, 4, 6]) {
          for (let i = 0; i < deck.length; i++) {
            const q = buildQuestion(deck[i], deck, { testField: field, direction, optionCount })
            const ctx = `${name}/${deckName}/${field}/${direction}/${optionCount} #${deck[i].kanji}`
            const correct = q.choices.filter((c) => c.correct)
            expect(correct.length === 1, `${ctx}: exactly one correct (got ${correct.length})`)
            expect(q.choices.length >= 2, `${ctx}: >=2 choices (got ${q.choices.length})`)
            const labels = new Set(q.choices.map((c) => c.label))
            expect(labels.size === q.choices.length, `${ctx}: choices unique`)
            expect(q.accepted.length > 0, `${ctx}: has accepted answers`)
            // typed-answer acceptance for recall
            if (direction === 'recall') {
              const typed = field === 'reading' ? deck[i].readings[0] : deck[i].meaning
              expect(checkTyped(q, typed), `${ctx}: accepts canonical typed answer "${typed}"`)
            }
          }
        }
      }
    }
  }
  console.log(`✓ ${name}: exercised ${decks['set(24)'].length} + ${pool.length} items`)
}

console.log('Running question-engine smoke test...')
exercise('kanji', KANJI)
exercise('vocab', VOCAB)

console.log(`\n${checks} assertions, ${failures} failures`)
process.exit(failures ? 1 : 0)
