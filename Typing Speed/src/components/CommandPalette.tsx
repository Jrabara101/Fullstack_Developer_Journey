import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Search,
  Clock,
  Type,
  Code2,
  Volume2,
  Palette,
  Zap,
  Activity,
  RotateCcw,
  Sparkles
} from 'lucide-react'
import { Dialog } from './ui/dialog'
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

interface CommandItem {
  id: string
  title: string
  category: string
  icon: React.ReactNode
  action: () => void
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  setMode: (mode: TestMode) => void
  setTimeLimit: (time: TimeLimit) => void
  setWordQuota: (quota: WordQuota) => void
  setSyntaxCategory: (cat: SyntaxCategory) => void
  setSoundMode: (sound: SoundMode) => void
  setTheme: (theme: ThemeName) => void
  setErrorMode: (errorMode: ErrorMode) => void
  setPacer: (pacer: PacerMode) => void
  onRestart: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setMode,
  setTimeLimit,
  setWordQuota,
  setSyntaxCategory,
  setSoundMode,
  setTheme,
  setErrorMode,
  setPacer,
  onRestart,
}) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const commands: CommandItem[] = useMemo(() => [
    // Modes
    {
      id: 'mode-time-15',
      title: 'Time Mode: 15 Seconds',
      category: 'Time Sprint',
      icon: <Clock className="h-4 w-4" />,
      action: () => { setMode('time'); setTimeLimit(15); onClose(); onRestart(); }
    },
    {
      id: 'mode-time-30',
      title: 'Time Mode: 30 Seconds',
      category: 'Time Sprint',
      icon: <Clock className="h-4 w-4" />,
      action: () => { setMode('time'); setTimeLimit(30); onClose(); onRestart(); }
    },
    {
      id: 'mode-time-60',
      title: 'Time Mode: 60 Seconds',
      category: 'Time Sprint',
      icon: <Clock className="h-4 w-4" />,
      action: () => { setMode('time'); setTimeLimit(60); onClose(); onRestart(); }
    },
    {
      id: 'mode-words-25',
      title: 'Words Quota: 25 Words',
      category: 'Word Quota',
      icon: <Type className="h-4 w-4" />,
      action: () => { setMode('words'); setWordQuota(25); onClose(); onRestart(); }
    },
    {
      id: 'mode-words-50',
      title: 'Words Quota: 50 Words',
      category: 'Word Quota',
      icon: <Type className="h-4 w-4" />,
      action: () => { setMode('words'); setWordQuota(50); onClose(); onRestart(); }
    },
    {
      id: 'syntax-react',
      title: 'Code Syntax: React Hooks',
      category: 'Developer Syntax',
      icon: <Code2 className="h-4 w-4 text-cyan-400" />,
      action: () => { setMode('code'); setSyntaxCategory('react'); onClose(); onRestart(); }
    },
    {
      id: 'syntax-ts',
      title: 'Code Syntax: TypeScript Types',
      category: 'Developer Syntax',
      icon: <Code2 className="h-4 w-4 text-blue-400" />,
      action: () => { setMode('code'); setSyntaxCategory('typescript'); onClose(); onRestart(); }
    },
    {
      id: 'syntax-python',
      title: 'Code Syntax: Python Algorithms',
      category: 'Developer Syntax',
      icon: <Code2 className="h-4 w-4 text-emerald-400" />,
      action: () => { setMode('code'); setSyntaxCategory('python'); onClose(); onRestart(); }
    },
    {
      id: 'syntax-sql',
      title: 'Code Syntax: SQL Queries',
      category: 'Developer Syntax',
      icon: <Code2 className="h-4 w-4 text-amber-400" />,
      action: () => { setMode('code'); setSyntaxCategory('sql'); onClose(); onRestart(); }
    },
    {
      id: 'syntax-bash',
      title: 'Code Syntax: Bash & DevOps',
      category: 'Developer Syntax',
      icon: <Code2 className="h-4 w-4 text-rose-400" />,
      action: () => { setMode('code'); setSyntaxCategory('bash'); onClose(); onRestart(); }
    },
    // Error Modes
    {
      id: 'error-confidence',
      title: 'Error Mode: Confidence (Flow & Soft Skip)',
      category: 'Error Mechanics',
      icon: <Zap className="h-4 w-4 text-zinc-400" />,
      action: () => { setErrorMode('confidence'); onClose(); }
    },
    {
      id: 'error-strict',
      title: 'Error Mode: Strict (Must Fix Error)',
      category: 'Error Mechanics',
      icon: <Zap className="h-4 w-4 text-amber-400" />,
      action: () => { setErrorMode('strict'); onClose(); }
    },
    {
      id: 'error-sudden-death',
      title: 'Error Mode: Sudden Death (Fail on 1st typo)',
      category: 'Error Mechanics',
      icon: <Zap className="h-4 w-4 text-rose-500" />,
      action: () => { setErrorMode('sudden-death'); onClose(); }
    },
    // Sounds
    {
      id: 'sound-thock',
      title: 'Audio: Mechanical Thock (Tactile Brown)',
      category: 'Tactile Audio',
      icon: <Volume2 className="h-4 w-4 text-amber-400" />,
      action: () => { setSoundMode('thock'); onClose(); }
    },
    {
      id: 'sound-clicky',
      title: 'Audio: Mechanical Clicky (Blue Switch)',
      category: 'Tactile Audio',
      icon: <Volume2 className="h-4 w-4 text-cyan-400" />,
      action: () => { setSoundMode('clicky'); onClose(); }
    },
    {
      id: 'sound-typewriter',
      title: 'Audio: Vintage Typewriter',
      category: 'Tactile Audio',
      icon: <Volume2 className="h-4 w-4 text-yellow-500" />,
      action: () => { setSoundMode('typewriter'); onClose(); }
    },
    {
      id: 'sound-off',
      title: 'Audio: Mute',
      category: 'Tactile Audio',
      icon: <Volume2 className="h-4 w-4 text-zinc-600" />,
      action: () => { setSoundMode('off'); onClose(); }
    },
    // Themes
    {
      id: 'theme-obsidian',
      title: 'Theme: Obsidian Zen (Amber Caret)',
      category: 'Theme Palette',
      icon: <Palette className="h-4 w-4 text-amber-400" />,
      action: () => { setTheme('obsidian'); onClose(); }
    },
    {
      id: 'theme-cyberpunk',
      title: 'Theme: Cyber Neon',
      category: 'Theme Palette',
      icon: <Palette className="h-4 w-4 text-cyan-400" />,
      action: () => { setTheme('cyberpunk'); onClose(); }
    },
    {
      id: 'theme-tokyo',
      title: 'Theme: Tokyo Night',
      category: 'Theme Palette',
      icon: <Palette className="h-4 w-4 text-purple-400" />,
      action: () => { setTheme('tokyo'); onClose(); }
    },
    {
      id: 'theme-matrix',
      title: 'Theme: Emerald Matrix',
      category: 'Theme Palette',
      icon: <Palette className="h-4 w-4 text-emerald-400" />,
      action: () => { setTheme('matrix'); onClose(); }
    },
    {
      id: 'theme-espresso',
      title: 'Theme: Warm Espresso',
      category: 'Theme Palette',
      icon: <Palette className="h-4 w-4 text-amber-600" />,
      action: () => { setTheme('espresso'); onClose(); }
    },
    // Ghost Pacer
    {
      id: 'pacer-off',
      title: 'Pacer: Disable Ghost Caret',
      category: 'Ghost Pacer',
      icon: <Activity className="h-4 w-4 text-zinc-600" />,
      action: () => { setPacer('off'); onClose(); }
    },
    {
      id: 'pacer-60',
      title: 'Pacer: 60 WPM Pace',
      category: 'Ghost Pacer',
      icon: <Activity className="h-4 w-4 text-amber-400" />,
      action: () => { setPacer(60); onClose(); }
    },
    {
      id: 'pacer-80',
      title: 'Pacer: 80 WPM Pace',
      category: 'Ghost Pacer',
      icon: <Activity className="h-4 w-4 text-amber-400" />,
      action: () => { setPacer(80); onClose(); }
    },
    {
      id: 'pacer-100',
      title: 'Pacer: 100 WPM Pace',
      category: 'Ghost Pacer',
      icon: <Activity className="h-4 w-4 text-amber-400" />,
      action: () => { setPacer(100); onClose(); }
    },
    {
      id: 'pacer-pb',
      title: 'Pacer: Race Against Personal Best',
      category: 'Ghost Pacer',
      icon: <Sparkles className="h-4 w-4 text-amber-400" />,
      action: () => { setPacer('pb'); onClose(); }
    },
    // Reset
    {
      id: 'action-reset',
      title: 'Restart Test (New Random Words)',
      category: 'Actions',
      icon: <RotateCcw className="h-4 w-4 text-zinc-400" />,
      action: () => { onRestart(); onClose(); }
    }
  ], [
    setMode,
    setTimeLimit,
    setWordQuota,
    setSyntaxCategory,
    setSoundMode,
    setTheme,
    setErrorMode,
    setPacer,
    onRestart,
    onClose
  ])

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(c =>
      c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    )
  }, [commands, query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action()
      }
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-xl p-0 overflow-hidden font-sans">
      <div className="flex flex-col">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3.5">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or filter modes, themes, sounds..."
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
          />
          <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500">
            esc
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 font-mono">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-600">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((command, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={command.id}
                  onClick={() => command.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                    isSelected
                      ? 'bg-amber-400/10 text-amber-300'
                      : 'text-zinc-400 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isSelected ? 'text-amber-400' : 'text-zinc-500'}>
                      {command.icon}
                    </span>
                    <span>{command.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                    {command.category}
                  </span>
                </button>
              )
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950/60 px-4 py-2 text-[11px] font-mono text-zinc-600">
          <span>Navigate with ↑ ↓ and Enter</span>
          <span>ZenType Quick Palette</span>
        </div>
      </div>
    </Dialog>
  )
}
