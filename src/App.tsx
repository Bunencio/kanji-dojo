import { useCallback, useState } from 'react'
import { DEFAULT_CONFIG, difficultyById, type GameConfig } from './lib/config'
import { deckById } from './data/decks'
import { gameById } from './games/registry'
import type { GameResult } from './games/types'
import { useTheme } from './hooks/useTheme'
import { useProgress } from './hooks/useProgress'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { HomeScreen } from './screens/HomeScreen'
import { ResultsScreen } from './screens/ResultsScreen'

type View = 'home' | 'play' | 'results'

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const progress = useProgress()
  const [config, setConfig] = useLocalStorageState<GameConfig>('config', DEFAULT_CONFIG)

  const [view, setView] = useState<View>('home')
  const [gameId, setGameId] = useState<string | null>(null)
  const [result, setResult] = useState<GameResult | null>(null)
  // Bump to force a fresh game instance (new shuffled session) on start / replay.
  const [sessionKey, setSessionKey] = useState(0)

  const patchConfig = useCallback(
    (patch: Partial<GameConfig>) => setConfig((prev) => ({ ...prev, ...patch })),
    [setConfig],
  )

  const start = useCallback((id: string) => {
    setGameId(id)
    setResult(null)
    setSessionKey((k) => k + 1)
    setView('play')
  }, [])

  const finish = useCallback((res: GameResult) => {
    setResult(res)
    setView('results')
  }, [])

  const replay = useCallback(() => {
    setResult(null)
    setSessionKey((k) => k + 1)
    setView('play')
  }, [])

  const goHome = useCallback(() => setView('home'), [])

  const game = gameId ? gameById(gameId) : undefined

  if (view === 'play' && game) {
    const Game = game.component
    return (
      <Game
        key={sessionKey}
        deck={deckById(config.collectionId, config.deckId)}
        field={config.field}
        difficulty={difficultyById(config.difficultyId)}
        length={config.length}
        weakFirst={config.weakFirst}
        progress={progress}
        onExit={goHome}
        onFinish={finish}
      />
    )
  }

  if (view === 'results' && result && game) {
    return <ResultsScreen result={result} gameName={game.name} onReplay={replay} onHome={goHome} />
  }

  return (
    <HomeScreen
      config={config}
      setConfig={patchConfig}
      progress={progress}
      theme={theme}
      onToggleTheme={toggleTheme}
      onStart={start}
    />
  )
}
