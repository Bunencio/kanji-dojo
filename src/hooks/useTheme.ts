import { useEffect } from 'react'
import { useLocalStorageState } from './useLocalStorageState'

export type Theme = 'dark' | 'light'

/** Persisted dark/light theme, applied to <html data-theme>. Defaults to dark. */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useLocalStorageState<Theme>('theme', 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return [theme, toggle]
}
