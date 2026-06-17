import { useEffect, useRef, useState } from 'react'
import { itemUid } from '@/data/decks'
import type { Choice } from '@/lib/quiz'
import { ping } from '@/lib/sound'
import { GameShell } from '@/components/game/GameShell'
import { Prompt } from '@/components/game/Prompt'
import { ChoiceGrid } from '@/components/game/ChoiceGrid'
import { Reveal } from '@/components/game/Reveal'
import { StatPill } from '@/components/game/StatPill'
import { Icon } from '@/components/ui/Icon'
import { useQuizSession } from '@/hooks/useQuizSession'
import type { GameProps } from './types'
import shared from './quiz-shared.module.css'
import styles from './TimeAttackGame.module.css'

const GAME_ID = 'time-attack'

export function TimeAttackGame({
  deck,
  field,
  difficulty,
  length,
  weakFirst,
  progress,
  onExit,
  onFinish,
}: GameProps) {
  const limit = difficulty.secondsPerQuestion
  const session = useQuizSession({
    pool: deck.kanji,
    collectionId: deck.collectionId,
    field,
    direction: 'recall',
    optionCount: difficulty.optionCount,
    length,
    weakFirst,
    progressMap: progress.map,
  })

  const [answered, setAnswered] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [remaining, setRemaining] = useState(limit)
  const [streak, setStreak] = useState(0)
  const bestStreak = useRef(0)

  const { question } = session

  function resolve(correct: boolean, key: string | null) {
    setSelectedKey(key)
    setLastCorrect(correct)
    setAnswered(true)
    ping(correct)
    session.answer(correct)
    progress.record(itemUid(deck.collectionId, question.target.id), correct)
    setStreak((s) => {
      const next = correct ? s + 1 : 0
      bestStreak.current = Math.max(bestStreak.current, next)
      return next
    })
  }

  function pick(choice: Choice) {
    if (answered) return
    resolve(choice.correct, choice.key)
  }

  function advance() {
    if (session.isLast) {
      onFinish({
        gameId: GAME_ID,
        correct: session.correctCount,
        total: session.total,
        log: session.log,
        extra: { label: 'Best streak', value: `${bestStreak.current}` },
      })
      return
    }
    setAnswered(false)
    setSelectedKey(null)
    setRemaining(limit)
    session.next()
  }

  // Per-question countdown; running out of time counts as a miss.
  useEffect(() => {
    if (answered) return
    const deadline = performance.now() + limit * 1000
    let raf = 0
    const tick = () => {
      const r = (deadline - performance.now()) / 1000
      if (r <= 0) {
        setRemaining(0)
        resolve(false, null)
        return
      }
      setRemaining(r)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.index, answered])

  const low = remaining <= 3 && !answered

  return (
    <GameShell
      title="Time Attack"
      onQuit={onExit}
      progressValue={session.index + (answered ? 1 : 0)}
      progressMax={session.total}
      status={
        <StatPill tone={low ? 'danger' : 'default'} icon={<Icon name="clock" size={14} />}>
          {Math.ceil(remaining)}s
        </StatPill>
      }
    >
      <div className={shared.stack}>
        <div className={styles.timerRow}>
          <div className={styles.timerTrack}>
            <div
              className={`${styles.timerFill} ${low ? styles.timerLow : ''}`}
              style={{ width: `${(remaining / limit) * 100}%` }}
            />
          </div>
          <StatPill tone="accent" icon={<Icon name="flame" size={14} />}>
            {streak}
          </StatPill>
        </div>

        <Prompt
          caption={question.promptCaption}
          main={question.promptMain}
          glyph={question.promptIsGlyph}
          state={answered ? (lastCorrect ? 'correct' : 'wrong') : 'idle'}
        />
        <div className={shared.spacer} />
        <ChoiceGrid choices={question.choices} selectedKey={selectedKey} answered={answered} onPick={pick} />
        {answered && (
          <Reveal kanji={question.target} correct={lastCorrect} onNext={advance} isLast={session.isLast} />
        )}
      </div>
    </GameShell>
  )
}
