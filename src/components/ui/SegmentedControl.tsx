import styles from './SegmentedControl.module.css'

export interface SegOption<T extends string | number> {
  value: T
  label: string
  caption?: string
}

interface SegmentedControlProps<T extends string | number> {
  options: SegOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  /** Wrap to a grid instead of a single scrolling row. */
  wrap?: boolean
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  wrap = false,
}: SegmentedControlProps<T>) {
  return (
    <div className={wrap ? styles.grid : styles.row} role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={String(opt.value)}
            type="button"
            className={`${styles.seg} ${active ? styles.active : ''}`}
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
          >
            <span className={styles.label}>{opt.label}</span>
            {opt.caption && <span className={styles.caption}>{opt.caption}</span>}
          </button>
        )
      })}
    </div>
  )
}
