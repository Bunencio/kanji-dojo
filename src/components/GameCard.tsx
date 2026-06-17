import type { GameMeta } from '@/games/types'
import { Icon } from '@/components/ui/Icon'
import styles from './GameCard.module.css'

interface GameCardProps {
  game: GameMeta
  onClick: () => void
}

export function GameCard({ game, onClick }: GameCardProps) {
  return (
    <button className={styles.card} onClick={onClick}>
      <span className={styles.icon}>
        {/* icon names map 1:1 to the Icon set */}
        <Icon name={game.icon as never} size={22} />
      </span>
      <span className={styles.body}>
        <span className={styles.titleRow}>
          <span className={styles.name}>{game.name}</span>
          <span className={styles.jp} lang="ja">
            {game.jp}
          </span>
        </span>
        <span className={styles.tagline}>{game.tagline}</span>
      </span>
      <span className={styles.go}>
        <Icon name="arrow-right" size={18} />
      </span>
    </button>
  )
}
