import { useEffect, useMemo, useState } from 'react'
import type { GameResult } from '@/games/types'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { speak } from '@/lib/speech'
import { fanfare } from '@/lib/sound'
import styles from './ResultsScreen.module.css'

interface ResultsScreenProps {
  result: GameResult
  gameName: string
  onReplay: () => void
  onHome: () => void
}

function grade(pct: number): { title: string; jp: string } {
  if (pct >= 95) return { title: 'Flawless', jp: '完璧' }
  if (pct >= 80) return { title: 'Great work', jp: '上手' }
  if (pct >= 60) return { title: 'Getting there', jp: '頑張れ' }
  if (pct >= 40) return { title: 'Keep practicing', jp: '練習' }
  return { title: "Let's review", jp: '復習' }
}

export function ResultsScreen({ result, gameName, onReplay, onHome }: ResultsScreenProps) {
  const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0
  const { title, jp } = grade(pct)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fanfare()
  }, [])

  const missed = useMemo(() => result.log.filter((l) => !l.correct), [result.log])
  const list = showAll ? result.log : missed
  const circumference = 2 * Math.PI * 52

  return (
    <div className={styles.page}>
      <p className={styles.kicker}>{gameName} · complete</p>

      <div className={styles.scoreCard}>
        <div className={styles.ring}>
          <svg viewBox="0 0 120 120" className={styles.ringSvg}>
            <circle className={styles.ringTrack} cx="60" cy="60" r="52" />
            <circle
              className={styles.ringFill}
              cx="60"
              cy="60"
              r="52"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
            />
          </svg>
          <div className={styles.ringText}>
            <span className={styles.pct}>{pct}%</span>
            <span className={styles.frac}>
              {result.correct}/{result.total}
            </span>
          </div>
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.jp} lang="ja">
          {jp}
        </p>
        {result.extra && (
          <div className={styles.extra}>
            <Icon name="flame" size={15} />
            {result.extra.label}: <strong>{result.extra.value}</strong>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" size="lg" block onClick={onHome}>
          <Icon name="home" size={18} /> Menu
        </Button>
        <Button size="lg" block onClick={onReplay}>
          <Icon name="refresh" size={18} /> Play again
        </Button>
      </div>

      {result.log.length > 0 && (
        <section className={styles.review}>
          <div className={styles.reviewHead}>
            <h3 className={styles.reviewTitle}>
              {missed.length === 0 ? 'Perfect — nothing missed' : `Review · ${missed.length} missed`}
            </h3>
            {missed.length > 0 && (
              <button className={styles.toggle} onClick={() => setShowAll((s) => !s)}>
                {showAll ? 'Missed only' : 'Show all'}
              </button>
            )}
          </div>

          <ul className={styles.rows}>
            {list.map((item, i) => (
              <li key={`${item.kanji.id}-${i}`} className={styles.row}>
                <span className={styles.rowKanji} lang="ja">
                  {item.kanji.kanji}
                </span>
                <span className={styles.rowInfo}>
                  <span className={styles.rowReadings} lang="ja">
                    {item.kanji.readings.join('・')}
                  </span>
                  <span className={styles.rowMeaning}>{item.kanji.meaning}</span>
                </span>
                <button
                  className={styles.rowSpeak}
                  onClick={() => speak(item.kanji.readings[0] ?? item.kanji.kanji)}
                  aria-label="Play reading"
                >
                  <Icon name="volume" size={16} />
                </button>
                <span className={`${styles.mark} ${item.correct ? styles.ok : styles.no}`}>
                  <Icon name={item.correct ? 'check' : 'x'} size={15} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
