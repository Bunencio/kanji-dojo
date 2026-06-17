import { useEffect, useState } from 'react'
import type { Direction, Choice } from '@/lib/quiz'
import { GameShell } from '@/components/game/GameShell'
import { Prompt } from '@/components/game/Prompt'
import { ChoiceGrid } from '@/components/game/ChoiceGrid'
import { Reveal } from '@/components/game/Reveal'
import { StatPill } from '@/components/game/StatPill'
import { Icon } from '@/components/ui/Icon'
import { useQuizSession } from '@/hooks/useQuizSession'
import type { GameProps } from './types'
import shared from './quiz-shared.module.css'

interface ChoiceQuizGameProps extends GameProps {
  gameId: string
  title: string
  direction: Direction
}

export function ChoiceQuizGame({
  gameId,
  title,
  direction,
  deck,
  field,
  difficulty,
  length,
  weakFirst,
  progress,
  onExit,
  onFinish,
}: ChoiceQuizGameProps) {
  const session = useQuizSession({
    pool: deck.kanji,
    field,
    direction,
    optionCount: difficulty.optionCount,
    length,
    weakFirst,
    progressMap: progress.map,
  })

  const [answered, setAnswered] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [lastCorrect, setLastCorrect] = useState(false)

  const { question } = session

  function pick(choice: Choice) {
    if (answered) return
    setSelectedKey(choice.key)
    setAnswered(true)
    setLastCorrect(choice.correct)
    session.answer(choice.correct)
    progress.record(question.target.id, choice.correct)
  }

  function advance() {
    if (session.isLast) {
      onFinish({ gameId, correct: session.correctCount, total: session.total, log: session.log })
      return
    }
    setAnswered(false)
    setSelectedKey(null)
    session.next()
  }

  // Number-key shortcuts (1–9) for picking a choice on desktop.
  useEffect(() => {
    if (answered) return
    function onKey(e: KeyboardEvent) {
      const n = Number(e.key)
      if (Number.isInteger(n) && n >= 1 && n <= question.choices.length) {
        pick(question.choices[n - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, question])

  return (
    <GameShell
      title={title}
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
          glyph={question.promptIsGlyph}
          state={answered ? (lastCorrect ? 'correct' : 'wrong') : 'idle'}
        />
        <div className={shared.spacer} />
        <div className={shared.choices}>
          <ChoiceGrid
            choices={question.choices}
            selectedKey={selectedKey}
            answered={answered}
            onPick={pick}
            glyph={direction === 'recognize'}
          />
        </div>
        {answered && (
          <Reveal kanji={question.target} correct={lastCorrect} onNext={advance} isLast={session.isLast} />
        )}
      </div>
    </GameShell>
  )
}
