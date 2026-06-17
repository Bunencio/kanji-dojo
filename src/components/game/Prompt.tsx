import styles from './Prompt.module.css'

interface PromptProps {
  caption: string
  main: string
  /** Render the main text as a large kanji glyph. */
  glyph: boolean
  /** Subtle state ring after answering. */
  state?: 'idle' | 'correct' | 'wrong'
}

export function Prompt({ caption, main, glyph, state = 'idle' }: PromptProps) {
  // A single character renders as a large glyph; multi-character words scale down.
  const isWord = [...main].length > 1
  const cls = glyph ? (isWord ? styles.word : styles.glyph) : styles.text
  return (
    <div className={`${styles.card} ${styles[state]}`}>
      <span className={styles.caption}>{caption}</span>
      <span className={cls} lang="ja">
        {main}
      </span>
    </div>
  )
}
