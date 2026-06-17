import { useEffect, useRef, useState } from 'react'
import { itemUid } from '@/data/decks'
import { GameShell } from '@/components/game/GameShell'
import { Prompt } from '@/components/game/Prompt'
import { Reveal } from '@/components/game/Reveal'
import { StatPill } from '@/components/game/StatPill'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useQuizSession } from '@/hooks/useQuizSession'
import { checkTyped } from '@/lib/quiz'
import { ping } from '@/lib/sound'
import type { GameProps } from './types'
import shared from './quiz-shared.module.css'
import styles from './TypingGame.module.css'

const GAME_ID = 'typing'

export function TypingGame({
  deck,
  field,
  difficulty,
  length,
  weakFirst,
  progress,
  onExit,
  onFinish,
}: GameProps) {
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

  const [value, setValue] = useState('')
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { question } = session
  const isReading = question.testField === 'reading'

  useEffect(() => {
    if (!answered) inputRef.current?.focus()
  }, [answered, question])

  function submit() {
    if (answered || !value.trim()) return
    const correct = checkTyped(question, value)
    setLastCorrect(correct)
    setAnswered(true)
    ping(correct)
    session.answer(correct)
    progress.record(itemUid(deck.collectionId, question.target.id), correct)
  }

  function advance() {
    if (session.isLast) {
      onFinish({ gameId: GAME_ID, correct: session.correctCount, total: session.total, log: session.log })
      return
    }
    setValue('')
    setAnswered(false)
    session.next()
  }

  return (
    <GameShell
      title="Typing"
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
        <Prompt
          caption={question.promptCaption}
          main={question.promptMain}
          glyph
          state={answered ? (lastCorrect ? 'correct' : 'wrong') : 'idle'}
        />
        <div className={shared.spacer} />

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            ref={inputRef}
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={isReading ? 'type the reading (kana)' : 'type the meaning'}
            lang={isReading ? 'ja' : 'en'}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            inputMode={isReading ? 'text' : undefined}
            disabled={answered}
            aria-label="Your answer"
          />
          {!answered && (
            <Button type="submit" size="lg" disabled={!value.trim()}>
              Check
            </Button>
          )}
        </form>
        <p className={shared.hint}>
          {isReading ? 'Hiragana or katakana both accepted.' : 'Close synonyms are accepted.'}
        </p>

        {answered && (
          <Reveal kanji={question.target} correct={lastCorrect} onNext={advance} isLast={session.isLast} />
        )}
      </div>
    </GameShell>
  )
}
