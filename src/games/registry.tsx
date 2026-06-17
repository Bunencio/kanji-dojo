import { ChoiceQuizGame } from './ChoiceQuizGame'
import { TypingGame } from './TypingGame'
import { TimeAttackGame } from './TimeAttackGame'
import { FlashcardsGame } from './FlashcardsGame'
import { MatchingGame } from './MatchingGame'
import { ListeningGame } from './ListeningGame'
import { SurvivalGame } from './SurvivalGame'
import { ReviewGame } from './ReviewGame'
import type { GameMeta, GameProps } from './types'

/* Forward (kanji → reading/meaning) and reverse (reading/meaning → kanji)
   multiple-choice are the same component with a fixed direction. */
function MultipleChoice(props: GameProps) {
  return <ChoiceQuizGame {...props} gameId="multiple-choice" title="Multiple Choice" direction="recall" />
}
function Recognition(props: GameProps) {
  return <ChoiceQuizGame {...props} gameId="recognition" title="Recognition" direction="recognize" />
}

export const GAMES: GameMeta[] = [
  {
    id: 'review',
    name: 'Smart Review',
    jp: '復習',
    tagline: 'Spaced repetition — study what’s due',
    description:
      'The fastest way to remember: reviews items right as you’re about to forget them, plus a few new ones. Mixed reading & meaning.',
    icon: 'zap',
    usesField: false,
    usesDifficulty: true,
    featured: true,
    component: ReviewGame,
  },
  {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    jp: '選択',
    tagline: 'See the kanji, pick the answer',
    description: 'Classic quiz: a kanji appears and you choose its reading or meaning from options.',
    icon: 'list',
    usesField: true,
    usesDifficulty: true,
    component: MultipleChoice,
  },
  {
    id: 'typing',
    name: 'Typing',
    jp: '入力',
    tagline: 'Recall and type it out',
    description: 'No options — type the reading (any kana) or the English meaning. Strongest recall.',
    icon: 'keyboard',
    usesField: true,
    usesDifficulty: false,
    component: TypingGame,
  },
  {
    id: 'recognition',
    name: 'Recognition',
    jp: '逆引き',
    tagline: 'See the reading, find the kanji',
    description: 'Reverse direction: a reading or meaning is shown and you pick the matching kanji.',
    icon: 'target',
    usesField: true,
    usesDifficulty: true,
    component: Recognition,
  },
  {
    id: 'time-attack',
    name: 'Time Attack',
    jp: '時間制限',
    tagline: 'Beat the clock, build a streak',
    description: 'Fast multiple choice with a per-question timer. Chase your best streak under pressure.',
    icon: 'flame',
    usesField: true,
    usesDifficulty: true,
    component: TimeAttackGame,
  },
  {
    id: 'flashcards',
    name: 'Flashcards',
    jp: '暗記カード',
    tagline: 'Flip and self-grade',
    description: 'Self-paced cards. Flip to reveal readings + meaning, then mark whether you knew it.',
    icon: 'layers',
    usesField: false,
    usesDifficulty: false,
    component: FlashcardsGame,
  },
  {
    id: 'matching',
    name: 'Matching',
    jp: '神経衰弱',
    tagline: 'Pair kanji with answers',
    description: 'Match each kanji to its reading or meaning on a board. Great for fast pattern building.',
    icon: 'grid',
    usesField: true,
    usesDifficulty: false,
    component: MatchingGame,
  },
  {
    id: 'listening',
    name: 'Listening',
    jp: '聞き取り',
    tagline: 'Hear it, pick the kanji',
    description: 'Train your ear: the reading is spoken aloud and you choose the matching kanji or word.',
    icon: 'ear',
    usesField: false,
    usesDifficulty: true,
    component: ListeningGame,
  },
  {
    id: 'survival',
    name: 'Survival',
    jp: 'サバイバル',
    tagline: 'Endless — 3 lives, chase a streak',
    description: 'Never-ending rapid quiz. Three lives, build the biggest combo you can. Maximum reps, fast.',
    icon: 'heart',
    usesField: true,
    usesDifficulty: true,
    component: SurvivalGame,
  },
]

export function gameById(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id)
}
