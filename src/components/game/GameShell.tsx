import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import styles from './GameShell.module.css'

interface GameShellProps {
  title: string
  onQuit: () => void
  progressValue: number
  progressMax: number
  /** Right-aligned status (score, lives, timer…). */
  status?: ReactNode
  children: ReactNode
}

export function GameShell({ title, onQuit, progressValue, progressMax, status, children }: GameShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <button className={styles.quit} onClick={onQuit} aria-label="Quit to menu">
          <Icon name="x" size={18} />
        </button>
        <div className={styles.center}>
          <div className={styles.titleRow}>
            <span className={styles.title}>{title}</span>
            <span className={styles.count}>
              {Math.min(progressValue, progressMax)} / {progressMax}
            </span>
          </div>
          <ProgressBar value={progressValue} max={progressMax} />
        </div>
        <div className={styles.status}>{status}</div>
      </header>
      <main className={styles.body}>{children}</main>
    </div>
  )
}
