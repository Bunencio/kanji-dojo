import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  value: number
  max: number
  /** Visual tone of the fill. */
  tone?: 'accent' | 'success'
}

export function ProgressBar({ value, max, tone = 'accent' }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={styles.track} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className={`${styles.fill} ${styles[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
