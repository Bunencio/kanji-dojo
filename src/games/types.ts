import type { ComponentType } from 'react'
import type { Kanji } from '@/data/types'
import type { Deck } from '@/data/decks'
import type { Difficulty, StudyField } from '@/lib/config'
import type { ProgressApi } from '@/hooks/useProgress'

export interface GameResult {
  gameId: string
  correct: number
  total: number
  /** Per-question outcome, for the results review list. */
  log: { kanji: Kanji; correct: boolean }[]
  /** Optional headline metric some games add (e.g. best streak). */
  extra?: { label: string; value: string }
}

/** Props every game component receives. */
export interface GameProps {
  deck: Deck
  field: StudyField
  difficulty: Difficulty
  /** Questions/cards this session; 0 means the whole deck. */
  length: number
  /** Order weak/unseen kanji first. */
  weakFirst: boolean
  progress: ProgressApi
  onExit: () => void
  onFinish: (result: GameResult) => void
}

/** Static metadata describing a game for the home gallery and registry. */
export interface GameMeta {
  id: string
  name: string
  jp: string
  tagline: string
  description: string
  icon: string
  /** Whether the field selector (reading/meaning/mixed) applies. */
  usesField: boolean
  /** Whether the difficulty selector applies. */
  usesDifficulty: boolean
  /** Featured modes render as a prominent card above the gallery. */
  featured?: boolean
  component: ComponentType<GameProps>
}
