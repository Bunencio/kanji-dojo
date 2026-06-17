import { useEffect, useMemo, useRef, useState } from 'react'
import type { Kanji } from '@/data/types'
import { itemUid } from '@/data/decks'
import { buildQuestion, type Choice } from '@/lib/quiz'
import { resolveField } from '@/lib/config'
import { shuffle } from '@/lib/random'
import { ping } from '@/lib/sound'
import { GameShell } from '@/components/game/GameShell'
import { Prompt } from '@/components/game/Prompt'
import { ChoiceGrid } from '@/components/game/ChoiceGrid'
import { Reveal } from '@/components/game/Reveal'
import { Combo } from '@/components/game/Combo'
import { StatPill } from '@/components/game/StatPill'
import { Icon } from '@/components/ui/Icon'
import type { GameProps } from './types'
import shared from './quiz-shared.module.css'

const GAME_ID = 'survival'
const START_LIVES = 3

export function SurvivalGame({ deck, field, difficulty, progress, onExit, onFinish }: GameProps) {
  const pool = deck.kanji
  const [queue, setQueue] = useState<Kanji[]>(() => shuffle(pool))
  const [pos, setPos] = useState(0)

  const [answered, setAnswered] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [lives, setLives] = useState(START_LIVES)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)

  const bestCombo = useRef(0)
  const total = useRef(0)
  const log = useRef<{ kanji: Kanji; correct: boolean }[]>([])
  const advanceTimer = useRef<number | null>(null)

  const target = queue[pos]
  const question = useMemo(
    () =>
      buildQuestion(target, pool, {
        testField: resolveField(field, pos),
        direction: 'recall',
        optionCount: difficulty.optionCount,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pos, queue],
  )

  useEffect(() => () => { if (advanceTimer.current) window.clearTimeout(advanceTimer.current) }, [])

  function nextQuestion() {
    const np = pos + 1
    if (np >= queue.length) {
      setQueue(shuffle(pool))
      setPos(0)
    } else {
      setPos(np)
    }
    setAnswered(false)
    setSelectedKey(null)
  }

  function finish() {
    onFinish({
      gameId: GAME_ID,
      correct: score,
      total: total.current,
      log: log.current,
      extra: { label: 'Best combo', value: `${bestCombo.current}` },
    })
  }

  function pick(choice: Choice) {
    if (answered) return
    total.current += 1
    log.current.push({ kanji: target, correct: choice.correct })
    progress.record(itemUid(deck.collectionId, target.id), choice.correct)
    ping(choice.correct)
    setSelectedKey(choice.key)
    setLastCorrect(choice.correct)
    setAnswered(true)

    if (choice.correct) {
      setScore((s) => s + 1)
      setCombo((c) => {
        const n = c + 1
        bestCombo.current = Math.max(bestCombo.current, n)
        return n
      })
      // Auto-advance quickly to keep the pace up.
      advanceTimer.current = window.setTimeout(nextQuestion, 480)
    } else {
      setCombo(0)
      setLives((l) => l - 1)
    }
  }

  const dead = lives <= 0
  const milestone = Math.max(10, Math.ceil((score + 1) / 10) * 10)

  return (
    <GameShell
      title="Survival"
      onQuit={onExit}
      progressValue={score}
      progressMax={milestone}
      status={
        <StatPill tone={lives === 1 ? 'danger' : 'default'} icon={<Icon name="heart" size={14} />}>
          {lives}
        </StatPill>
      }
    >
      <div className={shared.stack}>
        <Combo count={combo} />
        <Prompt
          caption={question.promptCaption}
          main={question.promptMain}
          glyph={question.promptIsGlyph}
          state={answered ? (lastCorrect ? 'correct' : 'wrong') : 'idle'}
        />
        <div className={shared.spacer} />
        <ChoiceGrid choices={question.choices} selectedKey={selectedKey} answered={answered} onPick={pick} />
        {answered && !lastCorrect && (
          <Reveal
            kanji={target}
            correct={false}
            onNext={dead ? finish : nextQuestion}
            isLast={dead}
          />
        )}
      </div>
    </GameShell>
  )
}
