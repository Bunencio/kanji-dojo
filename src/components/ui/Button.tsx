import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  children: ReactNode
}

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block = false, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(styles.btn, styles[variant], styles[size], block && styles.block, className)}
      {...rest}
    >
      {children}
    </button>
  )
})
