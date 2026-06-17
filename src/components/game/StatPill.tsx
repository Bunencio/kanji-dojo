import type { ReactNode } from 'react'
import styles from './StatPill.module.css'

interface StatPillProps {
  icon?: ReactNode
  children: ReactNode
  tone?: 'default' | 'accent' | 'danger' | 'warning'
}

export function StatPill({ icon, children, tone = 'default' }: StatPillProps) {
  return (
    <span className={`${styles.pill} ${styles[tone]}`}>
      {icon}
      <span className={styles.value}>{children}</span>
    </span>
  )
}
