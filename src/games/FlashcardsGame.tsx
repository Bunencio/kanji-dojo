import { useMemo, useRef, useState } from 'react'
import type { Kanji } from '@/data/types'
import { itemUid } from '@/data/decks'
import { GameShell } from '@/components/game/GameShell'
import { StatPill } from '@/components/game/StatPill'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { orderForStudy } from '@/lib/progress'
import { shuffle } from '@/lib/random'
import { speak } from '@/lib/speech'
import type { GameProps } from './types'
import styles from './FlashcardsGame.module.css'

const GAME_ID = 'flashcards'

export function FlashcardsGame({ deck, length, weakFirst, progress, onExit, onFinish }: GameProps) {
  const targets = useMemo<Kanji[]>(() => {
    const base = weakFirst
      ? orderForStudy(deck.kanji, progress.map, deck.collectionId, true)
      : shuffle(deck.kanji)
    const n = length === 0 ? base.length : Math.min(length, base.length)
    return base.slice(0, n)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const log = useRef<{ kanji: Kanji; correct: boolean }[]>([])

  const card = targets[index]
  const isLast = index >= targets.length - 1

  function grade(correct: boolean) {
    log.current.push({ kanji: card, correct })
    progress.record(itemUid(deck.collectionId, card.id), correct)
    if (correct) setKnown((k) => k + 1)
    if (isLast) {
      onFinish({ gameId: GAME_ID, correct: known + (correct ? 1 : 0), total: targets.length, log: log.current })
      return
    }
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  return (
    <GameShell
      title="Flashcards"
      onQuit={onExit}
      progressValue={index}
      progressMax={targets.length}
      status={
        <StatPill tone="accent" icon={<Icon name="check" size={14} />}>
          {known}
        </StatPill>
      }
    >
      <div className={styles.wrap}>
        <button
          className={`${styles.card} ${flipped ? styles.flipped : ''}`}
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? 'Show kanji' : 'Reveal answer'}
        >
          <div className={styles.inner}>
            <div className={styles.front}>
              <span className={[...card.kanji].length > 1 ? styles.word : styles.glyph} lang="ja">
                {card.kanji}
              </span>
              <span className={styles.tap}>Tap to reveal</span>
            </div>
            <div className={styles.back}>
              <span className={styles.readings} lang="ja">
                {card.readings.join('・')}
              </span>
              <span className={styles.meaning}>{card.meaning}</span>
              <span
                role="button"
                tabIndex={0}
                className={styles.speak}
                onClick={(e) => {
                  e.stopPropagation()
                  speak(card.readings[0] ?? card.kanji)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    speak(card.readings[0] ?? card.kanji)
                  }
                }}
              >
                <Icon name="volume" size={18} /> Listen
              </span>
            </div>
          </div>
        </button>

        <div className={styles.actions}>
          {flipped ? (
            <>
              <Button variant="secondary" size="lg" block onClick={() => grade(false)}>
                <Icon name="refresh" size={18} /> Review again
              </Button>
              <Button size="lg" block onClick={() => grade(true)}>
                <Icon name="check" size={18} /> Got it
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="lg" block onClick={() => setFlipped(true)}>
              Reveal answer
            </Button>
          )}
        </div>
      </div>
    </GameShell>
  )
}
