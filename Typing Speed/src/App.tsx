import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  TestMode,
  TimeLimit,
  WordQuota,
  SyntaxCategory,
  SoundMode,
  ThemeName,
  ErrorMode,
  PacerMode,
  TestMetrics,
  PersonalBestRecord
} from './types/typing'
import { useTypingEngine } from './hooks/useTypingEngine'
import { useSoundEffects } from './hooks/useSoundEffects'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Spotlight } from './components/reactbits/Spotlight'
import { DecryptedText } from './components/reactbits/DecryptedText'
import { ShinyText } from './components/reactbits/ShinyText'
import { HeaderPill } from './components/HeaderPill'
import { TypingCanvas } from './components/TypingCanvas'
import { FooterHUD } from './components/FooterHUD'
import { ResultsModal } from './components/ResultsModal'
import { CommandPalette } from './components/CommandPalette'
import { HelpModal } from './components/HelpModal'
import { Badge } from './components/ui/badge'
import { Terminal, Trophy } from 'lucide-react'

export function App() {
  // Application Settings & State
  const [theme, setTheme] = useLocalStorage<ThemeName>('zentype-theme', 'obsidian')
  const [soundMode, setSoundMode] = useLocalStorage<SoundMode>('zentype-sound', 'thock')
  const [errorMode, setErrorMode] = useLocalStorage<ErrorMode>('zentype-error-mode', 'confidence')
  const [pacer, setPacer] = useLocalStorage<PacerMode>('zentype-pacer', 'off')
  const [mode, setMode] = useState<TestMode>('time')
  const [timeLimit, setTimeLimit] = useState<TimeLimit>(30)
  const [wordQuota, setWordQuota] = useState<WordQuota>(25)
  const [syntaxCategory, setSyntaxCategory] = useState<SyntaxCategory>('react')

  // Modals state
  const [isResultsOpen, setIsResultsOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [lastMetrics, setLastMetrics] = useState<TestMetrics | null>(null)

  // Personal Best records
  const [pbRecords, setPbRecords] = useLocalStorage<Record<string, PersonalBestRecord>>('zentype-pb', {})

  // Sound Engine
  const { playKeySound } = useSoundEffects(soundMode, 0.5)

  // Current PB key
  const pbKey = useMemo(() => {
    if (mode === 'time') return `time-${timeLimit}`
    if (mode === 'words') return `words-${wordQuota}`
    return `code-${syntaxCategory}`
  }, [mode, timeLimit, wordQuota, syntaxCategory])

  const currentPB = pbRecords[pbKey] || null

  // Mode label for display
  const modeLabel = useMemo(() => {
    if (mode === 'time') return `Time ${timeLimit}s`
    if (mode === 'words') return `Words ${wordQuota}`
    return `Syntax: ${syntaxCategory}`
  }, [mode, timeLimit, wordQuota, syntaxCategory])

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Handle test completion
  const handleTestComplete = useCallback((metrics: TestMetrics) => {
    setLastMetrics(metrics)
    setIsResultsOpen(true)

    // Check & save personal best
    setPbRecords(prev => {
      const existing = prev[pbKey]
      if (!existing || metrics.wpm > existing.wpm) {
        return {
          ...prev,
          [pbKey]: {
            wpm: metrics.wpm,
            accuracy: metrics.accuracy,
            date: new Date().toISOString()
          }
        }
      }
      return prev
    })
  }, [pbKey, setPbRecords])

  // Typing Engine
  const {
    status,
    words,
    currentWordIndex,
    currentInput,
    timeRemaining,
    timeElapsed,
    liveWpm,
    liveAccuracy,
    codeTitle,
    resetTest,
    handleKeyDown,
  } = useTypingEngine({
    mode,
    timeLimit,
    wordQuota,
    syntaxCategory,
    errorMode,
    onKeyStroke: (isSpace, isError) => {
      playKeySound(isSpace, isError)
    },
    onTestComplete: handleTestComplete,
  })

  // Global keyboard shortcuts (Ctrl+K, Tab+Enter, Esc)
  useEffect(() => {
    let tabPressed = false
    let tabTimeout: number | null = null

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Command palette: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(prev => !prev)
        return
      }

      // If a modal is open, let modal handle its own keys
      if (isResultsOpen || isCommandPaletteOpen || isHelpOpen) {
        if (e.key === 'Escape') {
          setIsResultsOpen(false)
          setIsCommandPaletteOpen(false)
          setIsHelpOpen(false)
        }
        return
      }

      // Escape key resets test
      if (e.key === 'Escape') {
        e.preventDefault()
        resetTest(false)
        return
      }

      // Tab + Enter shortcut
      if (e.key === 'Tab') {
        e.preventDefault()
        tabPressed = true
        if (tabTimeout) clearTimeout(tabTimeout)
        tabTimeout = window.setTimeout(() => {
          tabPressed = false
        }, 600)
        return
      }

      if (e.key === 'Enter' && tabPressed) {
        e.preventDefault()
        tabPressed = false
        resetTest(false)
        return
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
      if (tabTimeout) clearTimeout(tabTimeout)
    }
  }, [resetTest, isResultsOpen, isCommandPaletteOpen, isHelpOpen])

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-theme-bg text-theme-text font-sans">
      {/* React Bits Ambient Spotlight & Subtle Grid */}
      <Spotlight />

      {/* Top Header Navigation Pill */}
      <div className="flex flex-col items-center gap-1">
        {/* Brand Title with React Bits DecryptedText */}
        <div className="flex items-center gap-2 pt-4 select-none">
          <Terminal className="h-4 w-4 text-amber-400" />
          <DecryptedText
            text="ZENTYPE // FLOW SPEED"
            speed={35}
            className="text-xs font-bold tracking-widest text-zinc-300 hover:text-amber-400 transition-colors"
          />
          {currentPB && (
            <div className="flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-0.5 border border-zinc-800 text-[10px] font-mono text-zinc-400">
              <Trophy className="h-2.5 w-2.5 text-amber-400" />
              <span>pb: <ShinyText className="font-semibold text-amber-400">{currentPB.wpm}</ShinyText></span>
            </div>
          )}
        </div>

        {/* Floating Configuration Pill */}
        <HeaderPill
          mode={mode}
          setMode={setMode}
          timeLimit={timeLimit}
          setTimeLimit={setTimeLimit}
          wordQuota={wordQuota}
          setWordQuota={setWordQuota}
          syntaxCategory={syntaxCategory}
          setSyntaxCategory={setSyntaxCategory}
          soundMode={soundMode}
          setSoundMode={setSoundMode}
          theme={theme}
          setTheme={setTheme}
          errorMode={errorMode}
          setErrorMode={setErrorMode}
          pacer={pacer}
          setPacer={setPacer}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      </div>

      {/* Middle Typing Stage */}
      <main className="relative z-10 my-auto flex w-full flex-1 flex-col items-center justify-center">
        {/* If Code Mode: Snippet Title Indicator */}
        {mode === 'code' && codeTitle && (
          <div className="mb-2">
            <Badge variant="outline" className="font-mono text-[11px] text-zinc-400 border-zinc-800">
              {codeTitle}
            </Badge>
          </div>
        )}

        {/* The Typing Canvas */}
        <TypingCanvas
          words={words}
          currentWordIndex={currentWordIndex}
          currentInput={currentInput}
          status={status}
          timeElapsed={timeElapsed}
          pacer={pacer}
          personalBestWpm={currentPB?.wpm}
          onKeyDown={handleKeyDown}
          onCanvasClick={() => {}}
        />
      </main>

      {/* Footer Live HUD */}
      <FooterHUD
        status={status}
        mode={mode}
        timeRemaining={timeRemaining}
        timeElapsed={timeElapsed}
        currentWordIndex={currentWordIndex}
        wordQuota={wordQuota}
        totalWords={words.length}
        liveWpm={liveWpm}
        liveAccuracy={liveAccuracy}
        onReset={() => resetTest(false)}
      />

      {/* Results Modal */}
      <ResultsModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        onRestart={() => {
          setIsResultsOpen(false)
          resetTest(false)
        }}
        metrics={lastMetrics}
        personalBest={currentPB}
        modeLabel={modeLabel}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setMode={setMode}
        setTimeLimit={setTimeLimit}
        setWordQuota={setWordQuota}
        setSyntaxCategory={setSyntaxCategory}
        setSoundMode={setSoundMode}
        setTheme={setTheme}
        setErrorMode={setErrorMode}
        setPacer={setPacer}
        onRestart={() => resetTest(false)}
      />

      {/* Help / Guide Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  )
}

export default App
