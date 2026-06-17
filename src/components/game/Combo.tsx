import { Icon } from '@/components/ui/Icon'
import styles from './Combo.module.css'

/** Animated combo badge; appears once the streak reaches 2. */
export function Combo({ count }: { count: number }) {
  if (count < 2) return <div className={styles.placeholder} aria-hidden="true" />
  const hot = count >= 5
  return (
    <div className={`${styles.combo} ${hot ? styles.hot : ''}`} key={count} role="status">
      <Icon name="flame" size={16} />
      <span>
        {count} combo{count >= 10 ? '!' : ''}
      </span>
    </div>
  )
}
