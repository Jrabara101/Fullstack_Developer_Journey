import React from 'react'
import {
  Clock,
  Type,
  Code2,
  Volume2,
  VolumeX,
  Palette,
  Zap,
  Command,
  HelpCircle,
  Activity
} from 'lucide-react'
import type {
  TestMode,
  TimeLimit,
  WordQuota,
  SyntaxCategory,
  SoundMode,
  ThemeName,
  ErrorMode,
  PacerMode
} from '../types/typing'

interface HeaderPillProps {
  mode: TestMode
  setMode: (mode: TestMode) => void
  timeLimit: TimeLimit
  setTimeLimit: (time: TimeLimit) => void
  wordQuota: WordQuota
  setWordQuota: (quota: WordQuota) => void
  syntaxCategory: SyntaxCategory
  setSyntaxCategory: (cat: SyntaxCategory) => void
  soundMode: SoundMode
  setSoundMode: (sound: SoundMode) => void
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  errorMode: ErrorMode
  setErrorMode: (errorMode: ErrorMode) => void
  pacer: PacerMode
  setPacer: (pacer: PacerMode) => void
  onOpenCommandPalette: () => void
  onOpenHelp: () => void
}

export const HeaderPill: React.FC<HeaderPillProps> = ({
  mode,
  setMode,
  timeLimit,
  setTimeLimit,
  wordQuota,
  setWordQuota,
  syntaxCategory,
  setSyntaxCategory,
  soundMode,
  setSoundMode,
  theme,
  setTheme,
  errorMode,
  setErrorMode,
  pacer,
  setPacer,
  onOpenCommandPalette,
  onOpenHelp
}) => {
  const timeOptions: TimeLimit[] = [15, 30, 60, 120]
  const wordOptions: WordQuota[] = [10, 25, 50, 100]
  const syntaxOptions: { id: SyntaxCategory; label: string }[] = [
    { id: 'react', label: 'React' },
    { id: 'typescript', label: 'TS' },
    { id: 'javascript', label: 'JS' },
    { id: 'python', label: 'Python' },
    { id: 'sql', label: 'SQL' },
    { id: 'bash', label: 'Bash' },
  ]
  const themes: { id: ThemeName; label: string; color: string }[] = [
    { id: 'obsidian', label: 'Obsidian', color: '#fbbf24' },
    { id: 'cyberpunk', label: 'Cyber', color: '#06b6d4' },
    { id: 'tokyo', label: 'Tokyo', color: '#bb9af7' },
    { id: 'matrix', label: 'Matrix', color: '#10b981' },
    { id: 'espresso', label: 'Espresso', color: '#f59e0b' },
  ]

  const nextSoundMode = () => {
    const modes: SoundMode[] = ['thock', 'clicky', 'typewriter', 'off']
    const nextIdx = (modes.indexOf(soundMode) + 1) % modes.length
    setSoundMode(modes[nextIdx])
  }

  const nextErrorMode = () => {
    const modes: ErrorMode[] = ['confidence', 'strict', 'sudden-death']
    const nextIdx = (modes.indexOf(errorMode) + 1) % modes.length
    setErrorMode(modes[nextIdx])
  }

  const nextPacer = () => {
    const pacers: PacerMode[] = ['off', 60, 80, 100, 120, 'pb']
    const nextIdx = (pacers.indexOf(pacer) + 1) % pacers.length
    setPacer(pacers[nextIdx])
  }

  return (
    <header className="relative z-20 flex w-full justify-center px-4 pt-4 pb-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-2 text-xs backdrop-blur-xl shadow-xl transition-all duration-200 hover:border-zinc-700/80">
        
        {/* Left Section: Mode Selector */}
        <div className="flex items-center gap-1 border-r border-zinc-800/80 pr-3">
          <button
            onClick={() => setMode('time')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition-all ${
              mode === 'time'
                ? 'bg-zinc-800 text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Time</span>
          </button>

          <button
            onClick={() => setMode('words')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition-all ${
              mode === 'words'
                ? 'bg-zinc-800 text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Type className="h-3.5 w-3.5" />
            <span>Words</span>
          </button>

          <button
            onClick={() => setMode('code')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition-all ${
              mode === 'code'
                ? 'bg-zinc-800 text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Syntax</span>
          </button>
        </div>

        {/* Middle Section: Mode Specific Options */}
        <div className="flex items-center gap-1 border-r border-zinc-800/80 pr-3 font-mono">
          {mode === 'time' && (
            <div className="flex items-center gap-1">
              {timeOptions.map(t => (
                <button
                  key={t}
                  onClick={() => setTimeLimit(t)}
                  className={`rounded-md px-2 py-1 transition-colors ${
                    timeLimit === t
                      ? 'bg-amber-400/10 text-amber-400 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          )}

          {mode === 'words' && (
            <div className="flex items-center gap-1">
              {wordOptions.map(w => (
                <button
                  key={w}
                  onClick={() => setWordQuota(w)}
                  className={`rounded-md px-2 py-1 transition-colors ${
                    wordQuota === w
                      ? 'bg-amber-400/10 text-amber-400 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          )}

          {mode === 'code' && (
            <div className="flex items-center gap-1">
              {syntaxOptions.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSyntaxCategory(s.id)}
                  className={`rounded-md px-2 py-1 text-[11px] transition-colors ${
                    syntaxCategory === s.id
                      ? 'bg-amber-400/10 text-amber-400 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Toggles & Shortcuts */}
        <div className="flex items-center gap-1.5">
          {/* Error mode toggle */}
          <button
            onClick={nextErrorMode}
            title="Error Mode (Click to cycle)"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
          >
            <Zap className={`h-3.5 w-3.5 ${errorMode === 'sudden-death' ? 'text-rose-500' : errorMode === 'strict' ? 'text-amber-400' : 'text-zinc-500'}`} />
            <span className="capitalize">{errorMode === 'sudden-death' ? 'Sudden Death' : errorMode}</span>
          </button>

          {/* Ghost Pacer toggle */}
          <button
            onClick={nextPacer}
            title="Ghost Pacer (Click to cycle target speed)"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors font-mono"
          >
            <Activity className={`h-3.5 w-3.5 ${pacer !== 'off' ? 'text-amber-400' : 'text-zinc-600'}`} />
            <span>{pacer === 'off' ? 'Pacer: Off' : pacer === 'pb' ? 'PB Pacer' : `${pacer} WPM`}</span>
          </button>

          {/* Sound Mode button */}
          <button
            onClick={nextSoundMode}
            title="Mechanical Audio (Click to cycle switch sounds)"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
          >
            {soundMode === 'off' ? (
              <VolumeX className="h-3.5 w-3.5 text-zinc-600" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span className="capitalize font-mono">{soundMode}</span>
          </button>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1 border-l border-zinc-800/80 pl-2">
            <Palette className="h-3.5 w-3.5 text-zinc-500 mr-0.5" />
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                className={`h-4 w-4 rounded-full border transition-all ${
                  theme === t.id
                    ? 'scale-110 border-white ring-2 ring-white/30'
                    : 'border-zinc-700 opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: t.color }}
              />
            ))}
          </div>

          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            title="Open Command Palette (Ctrl+K or Cmd+K)"
            className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-1 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100 transition-all font-mono ml-1"
          >
            <Command className="h-3 w-3" />
            <span>K</span>
          </button>

          {/* Help trigger */}
          <button
            onClick={onOpenHelp}
            title="Zen Typing Guide & Shortcuts"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </header>
  )
}
