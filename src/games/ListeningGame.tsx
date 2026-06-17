import { useEffect, useState } from 'react'
import { itemUid } from '@/data/decks'
import type { Choice } from '@/lib/quiz'
import { GameShell } from '@/components/game/GameShell'
import { ChoiceGrid } from '@/components/game/ChoiceGrid'
import { Reveal } from '@/components/game/Reveal'
import { StatPill } from '@/components/game/StatPill'
import { Icon } from '@/components/ui/Icon'
import { useQuizSession } from '@/hooks/useQuizSession'
import { canSpeak, speak } from '@/lib/speech'
import { ping } from '@/lib/sound'
import type { GameProps } from './types'
import shared from './quiz-shared.module.css'
import styles from './ListeningGame.module.css'

const GAME_ID = 'listening'

export function ListeningGame({ deck, difficulty, length, weakFirst, progress, onExit, onFinish }: GameProps) {
  // Always recognition by ear: hear the reading, pick the kanji/word.
  const session = useQuizSession({
    pool: deck.kanji,
    collectionId: deck.collectionId,
    field: 'reading',
    direction: 'recognize',
    optionCount: difficulty.optionCount,
    length,
    weakFirst,
    progressMap: progress.map,
  })

  const [answered, setAnswered] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [lastCorrect, setLastCorrect] = useState(false)

  const { question } = session

  // Auto-play the reading when a new question appears.
  useEffect(() => {
    speak(question.promptMain)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.index])

  function pick(choice: Choice) {
    if (answered) return
    setSelectedKey(choice.key)
    setAnswered(true)
    setLastCorrect(choice.correct)
    ping(choice.correct)
    session.answer(choice.correct)
    progress.record(itemUid(deck.collectionId, question.target.id), choice.correct)
  }

  function advance() {
    if (session.isLast) {
      onFinish({ gameId: GAME_ID, correct: session.correctCount, total: session.total, log: session.log })
      return
    }
    setAnswered(false)
    setSelectedKey(null)
    session.next()
  }

  return (
    <GameShell
      title="Listening"
      onQuit={onExit}
      progressValue={session.index + (answered ? 1 : 0)}
      progressMax={session.total}
      status={
        <StatPill tone="accent" icon={<Icon name="sparkles" size={14} />}>
          {session.correctCount}
        </StatPill>
      }
    >
      <div className={shared.stack}>
        <div className={styles.audioCard}>
          <span className={styles.caption}>Listen and choose the kanji</span>
          <button
            className={styles.playBtn}
            onClick={() => speak(question.promptMain)}
            aria-label="Play audio again"
          >
            <Icon name="volume" size={40} />
          </button>
          <span className={styles.replay}>Tap to replay</span>
          {!canSpeak() && (
            <span className={styles.fallback} lang="ja">
              (no audio voice — reading: {question.promptMain})
            </span>
          )}
        </div>
        <div className={shared.spacer} />
        <ChoiceGrid choices={question.choices} selectedKey={selectedKey} answered={answered} onPick={pick} glyph />
        {answered && (
          <Reveal kanji={question.target} correct={lastCorrect} onNext={advance} isLast={session.isLast} />
        )}
      </div>
    </GameShell>
  )
}
