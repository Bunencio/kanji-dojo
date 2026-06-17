import type { Choice } from '@/lib/quiz'
import styles from './ChoiceGrid.module.css'

interface ChoiceGridProps {
  choices: Choice[]
  /** Key of the choice the user picked, or null before answering. */
  selectedKey: string | null
  answered: boolean
  onPick: (choice: Choice) => void
  /** Render labels as large kanji glyphs (recognition mode). */
  glyph?: boolean
}

export function ChoiceGrid({ choices, selectedKey, answered, onPick, glyph = false }: ChoiceGridProps) {
  return (
    <div className={`${styles.grid} ${glyph ? styles.glyphGrid : ''}`}>
      {choices.map((choice) => {
        const isSelected = choice.key === selectedKey
        let state = ''
        if (answered) {
          if (choice.correct) state = styles.correct
          else if (isSelected) state = styles.wrong
          else state = styles.dim
        }
        return (
          <button
            key={choice.key}
            type="button"
            className={`${styles.choice} ${glyph ? styles.glyph : ''} ${state}`}
            disabled={answered}
            onClick={() => onPick(choice)}
            lang="ja"
          >
            {choice.label}
          </button>
        )
      })}
    </div>
  )
}
