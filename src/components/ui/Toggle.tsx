import styles from './Toggle.module.css'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hint?: string
}

export function Toggle({ checked, onChange, label, hint }: ToggleProps) {
  return (
    <label className={styles.row}>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`${styles.switch} ${checked ? styles.on : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.knob} />
      </button>
    </label>
  )
}
