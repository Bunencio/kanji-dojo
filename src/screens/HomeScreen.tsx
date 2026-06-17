import { useMemo } from 'react'
import type { GameConfig } from '@/lib/config'
import { DIFFICULTIES, SESSION_LENGTHS, STUDY_FIELDS, lengthLabel } from '@/lib/config'
import { COLLECTIONS, collectionById, deckById } from '@/data/decks'
import { summarize } from '@/lib/progress'
import type { ProgressApi } from '@/hooks/useProgress'
import type { Theme } from '@/hooks/useTheme'
import { GAMES } from '@/games/registry'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Toggle } from '@/components/ui/Toggle'
import { Icon } from '@/components/ui/Icon'
import { GameCard } from '@/components/GameCard'
import styles from './HomeScreen.module.css'

interface HomeScreenProps {
  config: GameConfig
  setConfig: (patch: Partial<GameConfig>) => void
  progress: ProgressApi
  theme: Theme
  onToggleTheme: () => void
  onStart: (gameId: string) => void
}

export function HomeScreen({ config, setConfig, progress, theme, onToggleTheme, onStart }: HomeScreenProps) {
  const collection = collectionById(config.collectionId)
  const deck = deckById(config.collectionId, config.deckId)
  const summary = useMemo(() => summarize(progress.map, deck.kanji), [progress.map, deck])
  const accuracyPct = Math.round(summary.accuracy * 100)
  const masteredPct = deck.kanji.length ? Math.round((summary.mastered / deck.kanji.length) * 100) : 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo} lang="ja">
            道
          </span>
          <div>
            <h1 className={styles.title}>Kanji Dojo</h1>
            <p className={styles.subtitle} lang="ja">
              漢字道場 · JLPT N3
            </p>
          </div>
        </div>
        <button className={styles.themeBtn} onClick={onToggleTheme} aria-label="Toggle theme">
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
      </header>

      {/* Progress overview for the selected deck */}
      <section className={styles.hero} aria-label="Your progress">
        <div className={styles.heroTop}>
          <div>
            <p className={styles.heroLabel}>{deck.label}</p>
            <p className={styles.heroCaption}>{deck.caption}</p>
          </div>
          {summary.totalSeen > 0 && (
            <button className={styles.reset} onClick={() => progress.reset()}>
              Reset stats
            </button>
          )}
        </div>
        <div className={styles.stats}>
          <Stat value={`${summary.mastered}`} sub={`/ ${deck.kanji.length} mastered`} />
          <Stat value={`${summary.studied}`} sub="studied" />
          <Stat value={summary.totalSeen ? `${accuracyPct}%` : '—'} sub="accuracy" />
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: `${masteredPct}%` }} />
        </div>
      </section>

      {/* Session setup */}
      <section className={styles.setup} aria-label="Session setup">
        <Field label="Study">
          <SegmentedControl
            ariaLabel="Collection"
            value={config.collectionId}
            onChange={(collectionId) => setConfig({ collectionId, deckId: 'all' })}
            options={COLLECTIONS.map((c) => ({
              value: c.id,
              label: `${c.label} · ${c.jp}`,
              caption: `${c.count} items`,
            }))}
          />
        </Field>

        <Field label="Deck">
          <SegmentedControl
            ariaLabel="Deck"
            value={config.deckId}
            onChange={(deckId) => setConfig({ deckId })}
            options={collection.decks.map((d) => ({ value: d.id, label: d.label, caption: d.caption }))}
          />
        </Field>

        <div className={styles.grid2}>
          <Field label="Test">
            <SegmentedControl
              wrap
              ariaLabel="Test field"
              value={config.field}
              onChange={(field) => setConfig({ field })}
              options={STUDY_FIELDS.map((f) => ({ value: f.id, label: f.label }))}
            />
          </Field>
          <Field label="Difficulty">
            <SegmentedControl
              wrap
              ariaLabel="Difficulty"
              value={config.difficultyId}
              onChange={(difficultyId) => setConfig({ difficultyId })}
              options={DIFFICULTIES.map((d) => ({ value: d.id, label: d.label }))}
            />
          </Field>
        </div>

        <Field label="Session length">
          <SegmentedControl
            wrap
            ariaLabel="Session length"
            value={config.length}
            onChange={(length) => setConfig({ length })}
            options={SESSION_LENGTHS.map((n) => ({ value: n, label: lengthLabel(n) }))}
          />
        </Field>

        <div className={styles.toggleWrap}>
          <Toggle
            checked={config.weakFirst}
            onChange={(weakFirst) => setConfig({ weakFirst })}
            label="Focus weak kanji first"
            hint="Prioritize unseen and frequently-missed kanji"
          />
        </div>
      </section>

      {/* Game gallery */}
      <section aria-label="Games">
        <h2 className={styles.gamesHeading}>
          Choose a game <span className={styles.gamesCount}>{GAMES.length} modes</span>
        </h2>
        <div className={styles.gallery}>
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} onClick={() => onStart(game.id)} />
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>
          Tip: not sure which sticks? Try the same deck in two or three modes and compare your accuracy.
        </p>
      </footer>
    </div>
  )
}

function Stat({ value, sub }: { value: string; sub: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statSub}>{sub}</span>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </div>
  )
}
