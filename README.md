# Kanji Dojo · 漢字道場

An interactive, mobile-friendly app for drilling **JLPT N3 kanji and vocabulary**
through **six different game modes** — so you can try several study styles and
keep the ones that actually make the kanji stick.

Built with **Vite + React + TypeScript + CSS Modules**. No backend, no tracking;
your progress is saved locally in the browser.

---

## ✨ What's inside

### Two content collections
| Collection | Items | What you study |
|-----------|------:|----------------|
| **Kanji** 漢字 | 336 | single N3 kanji → readings (on'yomi カタカナ / kun'yomi ひらがな) + English meaning |
| **Vocabulary** 語彙 | 835 | N3 words → full reading + English translation |

Each collection is split into focused **study sets of 24** (plus "All"), so you can
grind one chapter at a time instead of facing the whole deck.

### Six game modes
| Mode | What it trains |
|------|----------------|
| **Multiple Choice** 選択 | See the kanji/word, pick the reading or meaning |
| **Typing** 入力 | Recall and *type* the reading (any kana accepted) or the meaning — strongest recall |
| **Recognition** 逆引き | Reverse: see a reading/meaning, pick the matching kanji/word |
| **Time Attack** 時間制限 | Fast multiple choice with a per-question timer + streak counter |
| **Flashcards** 暗記カード | Flip a card, self-grade "Got it" / "Review again" |
| **Matching** 神経衰弱 | Pair kanji with their readings/meanings on a board |

### Every mode supports
- **Reading / Meaning / Mixed** test direction
- **Difficulty** (3 / 4 / 6 choices, timer speed)
- **Session length** (10 / 20 / 30 / whole deck)
- **"Focus weak kanji first"** — prioritizes unseen and frequently-missed items
- **Score, progress bar, per-question correct/incorrect feedback**, and an
  end-of-session **results screen** with a review list of everything you missed
- **Mastery tracking** per kanji (saved in `localStorage`)
- **Japanese audio** (browser text-to-speech) on the reveal/flashcard/results
- **Dark / light theme**, responsive layout, keyboard shortcuts (1–9 to answer)

---

## 🚀 Run it

```bash
npm install
npm run dev          # start the dev server (opens http://localhost:5173)
```

### 📱 Use it on your phone
The dev server is exposed on your local network. When it starts it prints a
**Network:** URL, e.g. `http://172.16.21.193:5173/`. On a phone connected to the
**same Wi-Fi**, open that URL in the browser. In Safari/Chrome use **Share → Add
to Home Screen** to install it as a fullscreen app (manifest + icon included).
The layout is mobile-first (large tap targets, safe-area insets, no zoom-on-type).

Other scripts:

```bash
npm run build        # type-check + production build to dist/
npm run preview      # serve the production build
npm run typecheck    # TypeScript only
npm run data:build   # regenerate src/data/kanji.ts & vocab.ts from the source files
node scripts/smoke.mjs   # logic test of the question engine (after data:build + esbuild bundle)
```

---

## ➕ How to add more kanji / vocabulary

The datasets in `src/data/kanji.ts` and `src/data/vocab.ts` are **generated** —
don't hand-edit them. Each entry has this shape:

```ts
interface Kanji {
  id: number
  kanji: string        // the kanji or the vocabulary word, e.g. "日本語"
  readings: string[]   // ["にほんご"]  (on'yomi katakana / kun'yomi hiragana for single kanji)
  meaning: string      // "Japanese language"  — shown in the UI
  meanings: string[]   // ["japanese language"] — extra answers accepted in Typing mode
  level: JlptLevel     // "N5" | "N4" | "N3" | "N2" | "N1"
}
```

### Option A — add to the source files and regenerate (recommended)
The data is built from three files in `scripts/`:

- `readings.json` — `[{ id, kanji, readings[] }]` (single kanji)
- `meanings.json` — `[{ id, kanji, meaning, meanings[] }]` (built by `scripts/kanji-meanings.mjs`)
- `vocab.json` — `[{ id, word, reading, meaning }]` (vocabulary)

Add your rows to the relevant file(s), then:

```bash
node scripts/kanji-meanings.mjs   # only if you added single kanji + glosses
npm run data:build                # regenerates src/data/kanji.ts and src/data/vocab.ts
```

`data:build` automatically slices new items into study sets and merges duplicate
vocabulary words (shared word string → one card with all readings/meanings).

### Option B — just edit the generated array
For a quick one-off, you can append a literal entry to the `KANJI` or `VOCAB`
array in `src/data/*.ts`. Keep `id` unique. New items appear in the decks
immediately on reload.

### Adding a whole new level (e.g. N5)
Set `level` on the new entries and they'll carry that label. The deck builder is
data-driven, so larger datasets are sliced into sets automatically.

---

## 🧩 Architecture

Data, logic, and UI are cleanly separated so the app is easy to extend.

```
src/
├── data/            # datasets + types + collections/decks (generated data)
├── lib/             # pure logic: kana normalization, question engine,
│                    #   progress/mastery, config, storage, speech, random
├── hooks/           # useQuizSession, useProgress, useTheme, useLocalStorageState
├── components/
│   ├── ui/          # reusable primitives: Button, SegmentedControl, Toggle, Icon…
│   └── game/        # shared game chrome: GameShell, Prompt, ChoiceGrid, Reveal…
├── games/           # one file per game + registry.tsx (the pluggable game list)
├── screens/         # HomeScreen (gallery + setup), ResultsScreen
└── App.tsx          # navigation, config, theme, progress wiring
```

### Add a new game mode
1. Create `src/games/MyGame.tsx` implementing the `GameProps` contract
   (`deck`, `field`, `difficulty`, `length`, `weakFirst`, `progress`, `onExit`, `onFinish`).
   Reuse `useQuizSession` + the shared `GameShell` / `Prompt` / `ChoiceGrid` / `Reveal`.
2. Register it in `src/games/registry.tsx` (add a `GameMeta` entry).

That's it — it shows up in the home gallery and inherits all the shared
settings, scoring, and results automatically.

---

## 📦 Data source

Built from the *Sou Matome N3* kanji & vocabulary decks (the original `.tsv`
files are kept in the project root). Single-kanji English glosses follow standard
kanji-dictionary conventions; vocabulary translations come from the source deck.
