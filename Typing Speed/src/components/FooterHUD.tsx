import React from 'react'
import { RotateCcw, CornerDownLeft } from 'lucide-react'
import type { TestMode, TestStatus } from '../types/typing'
import { formatTime } from '../lib/utils'

interface FooterHUDProps {
  status: TestStatus
  mode: TestMode
  timeRemaining: number
  timeElapsed: number
  currentWordIndex: number
  wordQuota: number
  totalWords: number
  liveWpm: number
  liveAccuracy: number
  onReset: () => void
}

export const FooterHUD: React.FC<FooterHUDProps> = ({
  status,
  mode,
  timeRemaining,
  timeElapsed,
  currentWordIndex,
  wordQuota,
  totalWords,
  liveWpm,
  liveAccuracy,
  onReset,
}) => {
  return (
    <footer className="relative z-20 mt-auto flex w-full flex-col items-center justify-center gap-4 px-4 pb-6 pt-2 font-mono">
      {/* Subdued Live Peripheral HUD */}
      <div className="flex items-center gap-6 text-xs text-zinc-500 transition-opacity duration-300">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-600">wpm:</span>
          <span className="font-semibold text-zinc-400">
            {status === 'idle' ? '—' : liveWpm}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-zinc-600">acc:</span>
          <span className="font-semibold text-zinc-400">
            {status === 'idle' ? '100%' : `${liveAccuracy}%`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-zinc-600">
            {mode === 'time' ? 'time:' : 'words:'}
          </span>
          <span className="font-semibold text-zinc-400">
            {mode === 'time'
              ? formatTime(status === 'idle' ? timeRemaining : timeRemaining)
              : `${currentWordIndex}/${mode === 'words' ? wordQuota : totalWords}`}
          </span>
        </div>

        {status === 'running' && mode !== 'time' && (
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-600">elapsed:</span>
            <span className="font-semibold text-zinc-400">{timeElapsed}s</span>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hints & Reset Button */}
      <div className="flex items-center gap-4 text-[11px] text-zinc-500">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3 py-1 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100 transition-all duration-150 active:scale-95"
          title="Restart Test (Esc or Tab + Enter)"
        >
          <RotateCcw className="h-3 w-3" />
          <span>restart</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded bg-zinc-900 px-1.5 py-0.5 border border-zinc-800 text-zinc-400 text-[10px]">
            tab
          </span>
          <span>+</span>
          <span className="flex items-center gap-1 rounded bg-zinc-900 px-1.5 py-0.5 border border-zinc-800 text-zinc-400 text-[10px]">
            <CornerDownLeft className="h-2.5 w-2.5" />
            enter
          </span>
          <span className="text-zinc-600">new set</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <span className="rounded bg-zinc-900 px-1.5 py-0.5 border border-zinc-800 text-zinc-400 text-[10px]">
            esc
          </span>
          <span className="text-zinc-600">quick reset</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <span className="rounded bg-zinc-900 px-1.5 py-0.5 border border-zinc-800 text-zinc-400 text-[10px]">
            ctrl + k
          </span>
          <span className="text-zinc-600">command palette</span>
        </div>
      </div>
    </footer>
  )
}
