import { useEffect, useRef } from 'react'
import type { Kanji } from '@/data/types'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { speak } from '@/lib/speech'
import { examplesFor } from '@/lib/examples'
import styles from './Reveal.module.css'

interface RevealProps {
  kanji: Kanji
  correct: boolean
  onNext: () => void
  isLast: boolean
}

export function Reveal({ kanji, correct, onNext, isLast }: RevealProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const examples = examplesFor(kanji.kanji)

  // Autofocus Next so Enter / Space advances immediately.
  useEffect(() => {
    btnRef.current?.focus()
  }, [])

  return (
    <div className={`${styles.panel} ${correct ? styles.ok : styles.no}`} role="status" aria-live="polite">
      <div className={styles.head}>
        <span className={`${styles.badge} ${correct ? styles.okBadge : styles.noBadge}`}>
          <Icon name={correct ? 'check' : 'x'} size={16} />
          {correct ? 'Correct' : 'Answer'}
        </span>
        <button
          className={styles.speak}
          onClick={() => speak(kanji.readings[0] ?? kanji.kanji)}
          aria-label="Play reading"
          type="button"
        >
          <Icon name="volume" size={18} />
        </button>
      </div>

      <div className={styles.answer}>
        <span className={styles.glyph} lang="ja">
          {kanji.kanji}
        </span>
        <div className={styles.info}>
          <span className={styles.readings} lang="ja">
            {kanji.readings.join('・')}
          </span>
          <span className={styles.meaning}>{kanji.meaning}</span>
        </div>
      </div>

      {examples.length > 0 && (
        <div className={styles.examples}>
          <span className={styles.exHead}>Example words</span>
          <ul className={styles.exList}>
            {examples.map((ex) => (
              <li key={ex.id} className={styles.exItem}>
                <button
                  className={styles.exSpeak}
                  onClick={() => speak(ex.readings[0] ?? ex.kanji)}
                  aria-label={`Play ${ex.kanji}`}
                  type="button"
                >
                  <ruby className={styles.exWord} lang="ja">
                    {ex.kanji}
                    <rt>{ex.readings[0]}</rt>
                  </ruby>
                </button>
                <span className={styles.exMeaning}>{ex.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button ref={btnRef} block size="lg" onClick={onNext}>
        {isLast ? 'See results' : 'Next'}
        <Icon name="arrow-right" size={18} />
      </Button>
    </div>
  )
}
