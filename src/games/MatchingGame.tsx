import { useEffect, useMemo, useRef, useState } from 'react'
import type { Kanji } from '@/data/types'
import { GameShell } from '@/components/game/GameShell'
import { StatPill } from '@/components/game/StatPill'
import { Icon } from '@/components/ui/Icon'
import { orderForStudy } from '@/lib/progress'
import { shuffle } from '@/lib/random'
import { resolveField } from '@/lib/config'
import type { GameProps } from './types'
import styles from './MatchingGame.module.css'

const GAME_ID = 'matching'
const PAIRS_PER_BOARD = 6

interface AnswerCard {
  id: number // owning kanji id
  label: string
}

export function MatchingGame({ deck, field, length, weakFirst, progress, onExit, onFinish }: GameProps) {
  const targets = useMemo<Kanji[]>(() => {
    const base = weakFirst ? orderForStudy(deck.kanji, progress.map, true) : shuffle(deck.kanji)
    const n = length === 0 ? base.length : Math.min(length, base.length)
    return base.slice(0, n)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const boards = useMemo<Kanji[][]>(() => {
    const out: Kanji[][] = []
    for (let i = 0; i < targets.length; i += PAIRS_PER_BOARD) out.push(targets.slice(i, i + PAIRS_PER_BOARD))
    return out
  }, [targets])

  const [boardIndex, setBoardIndex] = useState(0)
  const board = boards[boardIndex] ?? []

  // Stable shuffled columns per board.
  const left = useMemo(() => shuffle(board), [boardIndex]) // eslint-disable-line react-hooks/exhaustive-deps
  const right = useMemo<AnswerCard[]>(() => {
    const useReading = resolveField(field, boardIndex) === 'reading'
    return shuffle(board.map((k) => ({ id: k.id, label: useReading ? k.readings[0] : k.meaning })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardIndex])

  const [selLeft, setSelLeft] = useState<number | null>(null)
  const [selRight, setSelRight] = useState<number | null>(null)
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [wrong, setWrong] = useState<Set<number>>(new Set())

  const erred = useRef<Set<number>>(new Set())
  const correctCount = useRef(0)
  const log = useRef<{ kanji: Kanji; correct: boolean }[]>([])
  const wrongTimer = useRef<number | null>(null)
  const lastBoard = boardIndex >= boards.length - 1

  useEffect(() => () => { if (wrongTimer.current) window.clearTimeout(wrongTimer.current) }, [])

  function evaluate(l: number, r: number) {
    if (l === r) {
      const k = board.find((b) => b.id === l)!
      const ok = !erred.current.has(l)
      if (ok) correctCount.current += 1
      log.current.push({ kanji: k, correct: ok })
      progress.record(l, ok)
      const nextMatched = new Set(matched).add(l)
      setMatched(nextMatched)
      setSelLeft(null)
      setSelRight(null)
      if (nextMatched.size === board.length) finishBoard()
    } else {
      erred.current.add(l).add(r)
      setWrong(new Set([l, r]))
      wrongTimer.current = window.setTimeout(() => {
        setWrong(new Set())
        setSelLeft(null)
        setSelRight(null)
      }, 650)
    }
  }

  function finishBoard() {
    if (lastBoard) {
      window.setTimeout(() => {
        onFinish({ gameId: GAME_ID, correct: correctCount.current, total: targets.length, log: log.current })
      }, 350)
      return
    }
    window.setTimeout(() => {
      setMatched(new Set())
      setWrong(new Set())
      erred.current = new Set()
      setBoardIndex((i) => i + 1)
    }, 350)
  }

  function clickLeft(id: number) {
    if (matched.has(id) || wrong.size || selLeft === id) return
    setSelLeft(id)
    if (selRight != null) evaluate(id, selRight)
  }
  function clickRight(id: number) {
    if (matched.has(id) || wrong.size || selRight === id) return
    setSelRight(id)
    if (selLeft != null) evaluate(selLeft, id)
  }

  const totalMatched = boardIndex * PAIRS_PER_BOARD + matched.size

  return (
    <GameShell
      title="Matching"
      onQuit={onExit}
      progressValue={totalMatched}
      progressMax={targets.length}
      status={
        <StatPill tone="accent" icon={<Icon name="check" size={14} />}>
          {correctCount.current}
        </StatPill>
      }
    >
      <p className={styles.instruction}>Match each kanji to its {resolveField(field, boardIndex)}.</p>
      <div className={styles.board}>
        <div className={styles.col}>
          {left.map((k) => (
            <button
              key={k.id}
              className={cardClass(styles, k.id, selLeft, matched, wrong)}
              onClick={() => clickLeft(k.id)}
              disabled={matched.has(k.id)}
              lang="ja"
            >
              <span className={styles.kanji}>{k.kanji}</span>
            </button>
          ))}
        </div>
        <div className={styles.col}>
          {right.map((a) => (
            <button
              key={a.id}
              className={cardClass(styles, a.id, selRight, matched, wrong)}
              onClick={() => clickRight(a.id)}
              disabled={matched.has(a.id)}
              lang="ja"
            >
              <span className={styles.answer}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  )
}

function cardClass(
  styles: Record<string, string>,
  id: number,
  selected: number | null,
  matched: Set<number>,
  wrong: Set<number>,
): string {
  const c = [styles.cell]
  if (matched.has(id)) c.push(styles.matched)
  else if (wrong.has(id)) c.push(styles.wrong)
  else if (selected === id) c.push(styles.selected)
  return c.join(' ')
}
