import { useMemo } from 'react'
import { buildReviewQueue } from '@/lib/srs'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ChoiceQuizGame } from './ChoiceQuizGame'
import type { GameProps } from './types'
import styles from './ReviewGame.module.css'

/**
 * Smart Review runs the spaced-repetition queue: everything currently due
 * (most overdue first) plus a few new items, in mixed reading/meaning mode.
 */
export function ReviewGame(props: GameProps) {
  const { deck, progress, length, onExit } = props

  const queue = useMemo(
    () => buildReviewQueue(deck.kanji, deck.collectionId, progress.srs, Date.now(), length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  if (queue.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emoji} lang="ja">
          ✓
        </span>
        <h2 className={styles.title}>All caught up</h2>
        <p className={styles.text}>
          Nothing is due for review in this deck right now. Learn new items in another mode, or come back
          later as items become due.
        </p>
        <Button size="lg" onClick={onExit}>
          <Icon name="home" size={18} /> Back to menu
        </Button>
      </div>
    )
  }

  return (
    <ChoiceQuizGame
      {...props}
      gameId="review"
      title="Smart Review"
      direction="recall"
      field="mixed"
      targets={queue}
    />
  )
}
