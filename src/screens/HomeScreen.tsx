import { useMemo, useState } from 'react'
import type { GameConfig } from '@/lib/config'
import { DIFFICULTIES, SESSION_LENGTHS, STUDY_FIELDS, lengthLabel } from '@/lib/config'
import { COLLECTIONS, collectionById, deckById } from '@/data/decks'
import { summarize } from '@/lib/progress'
import { dueCount, newCount } from '@/lib/srs'
import { effectiveStreak, todayCount } from '@/lib/daily'
import { isSoundEnabled, setSoundEnabled } from '@/lib/sound'
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
  const now = Date.now()

  const summary = useMemo(() => summarize(progress.map, progress.srs, deck), [progress.map, progress.srs, deck])
  const due = useMemo(() => dueCount(deck.kanji, deck.collectionId, progress.srs, now), [progress.srs, deck, now])
  const fresh = useMemo(() => newCount(deck.kanji, deck.collectionId, progress.srs), [progress.srs, deck])

  const streak = effectiveStreak(progress.daily, now)
  const today = todayCount(progress.daily, now)
  const goal = progress.daily.goal
  const masteredPct = deck.kanji.length ? Math.round((summary.mastered / deck.kanji.length) * 100) : 0

  const [soundOn, setSoundOn] = useState(isSoundEnabled())
  const featured = GAMES.filter((g) => g.featured)
  const gallery = GAMES.filter((g) => !g.featured)

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
        <div className={styles.headerActions}>
          <button
            className={styles.iconBtn}
            onClick={() => {
              const v = !soundOn
              setSoundOn(v)
              setSoundEnabled(v)
            }}
            aria-label={soundOn ? 'Mute sounds' : 'Unmute sounds'}
            aria-pressed={soundOn}
          >
            <Icon name={soundOn ? 'volume' : 'volume-x'} size={18} />
          </button>
          <button className={styles.iconBtn} onClick={onToggleTheme} aria-label="Toggle theme">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
        </div>
      </header>

      {/* Daily streak + goal */}
      <section className={styles.daily} aria-label="Daily progress">
        <div className={styles.dailyCard}>
          <span className={`${styles.flame} ${streak > 0 ? styles.flameOn : ''}`}>
            <Icon name="flame" size={20} />
          </span>
          <div className={styles.dailyText}>
            <span className={styles.dailyValue}>{streak}</span>
            <span className={styles.dailyLabel}>day streak</span>
          </div>
        </div>
        <div className={styles.dailyCard}>
          <Ring value={today} max={goal} />
          <div className={styles.dailyText}>
            <span className={styles.dailyValue}>
              {today}
              <span className={styles.dailyOf}>/{goal}</span>
            </span>
            <span className={styles.dailyLabel}>reviews today</span>
          </div>
        </div>
      </section>

      {/* Featured: Smart Review */}
      {featured.map((game) => (
        <button key={game.id} className={styles.review} onClick={() => onStart(game.id)}>
          <span className={styles.reviewIcon}>
            <Icon name="zap" size={24} />
          </span>
          <span className={styles.reviewBody}>
            <span className={styles.reviewName}>{game.name}</span>
            <span className={styles.reviewMeta}>
              {due > 0 ? (
                <strong>{due} due now</strong>
              ) : (
                <span>nothing due — </span>
              )}
              {fresh > 0 && <span> · {fresh} new to learn</span>}
              {due === 0 && fresh === 0 && <span>all caught up 🎉</span>}
            </span>
          </span>
          <span className={styles.reviewGo}>
            <Icon name="arrow-right" size={20} />
          </span>
        </button>
      ))}

      {/* Deck progress */}
      <section className={styles.hero} aria-label="Deck progress">
        <div className={styles.heroTop}>
          <div>
            <p className={styles.heroLabel}>
              {collection.label} · {deck.label}
            </p>
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
          <Stat
            value={summary.totalSeen ? `${Math.round(summary.accuracy * 100)}%` : '—'}
            sub="accuracy"
          />
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
            hint="Prioritize unseen and frequently-missed items"
          />
        </div>
      </section>

      {/* Game gallery */}
      <section aria-label="Games">
        <h2 className={styles.gamesHeading}>
          Choose a game <span className={styles.gamesCount}>{gallery.length} modes</span>
        </h2>
        <div className={styles.gallery}>
          {gallery.map((game) => (
            <GameCard key={game.id} game={game} onClick={() => onStart(game.id)} />
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Daily Smart Review is the fastest path — a few minutes a day beats one long cram.</p>
      </footer>
    </div>
  )
}

function Ring({ value, max }: { value: number; max: number }) {
  const pct = max <= 0 ? 0 : Math.min(1, value / max)
  const r = 16
  const c = 2 * Math.PI * r
  return (
    <svg className={styles.ring} viewBox="0 0 40 40" aria-hidden="true">
      <circle className={styles.ringTrack} cx="20" cy="20" r={r} />
      <circle
        className={styles.ringFill}
        cx="20"
        cy="20"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
      />
    </svg>
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
