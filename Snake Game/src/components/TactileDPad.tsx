import React from 'react'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react'
import { Direction, GameStatus } from '../types/game'

interface TactileDPadProps {
  onDirection: (dir: Direction) => void
  onTogglePlay: () => void
  onRestart: () => void
  status: GameStatus
}

export const TactileDPad: React.FC<TactileDPadProps> = ({
  onDirection,
  onTogglePlay,
  onRestart,
  status,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#131316]/80 border border-[#27272a]/60 backdrop-blur-md shadow-xl select-none">
      <div className="flex items-center justify-between w-full px-2 mb-2">
        <span className="text-[11px] font-mono tracking-wider text-[#9ca3af] uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
          Tactile Input Array
        </span>
        <span className="text-[10px] font-mono text-[#71717a]">10px SWIPE / TOUCH</span>
      </div>

      <div className="grid grid-cols-3 gap-2 w-48 h-48">
        {/* Row 1 */}
        <div />
        <button
          type="button"
          aria-label="Move Up"
          className="bg-[#1f1f22] hover:bg-[#27272a] active:bg-[#4edea3] active:text-[#0e0e11] text-[#e4e1e5] rounded-xl flex items-center justify-center transition-all duration-75 shadow-md active:scale-90 border border-[#2e2e32]"
          onClick={() => onDirection('UP')}
          onTouchStart={(e) => {
            e.preventDefault()
            onDirection('UP')
          }}
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />

        {/* Row 2 */}
        <button
          type="button"
          aria-label="Move Left"
          className="bg-[#1f1f22] hover:bg-[#27272a] active:bg-[#4edea3] active:text-[#0e0e11] text-[#e4e1e5] rounded-xl flex items-center justify-center transition-all duration-75 shadow-md active:scale-90 border border-[#2e2e32]"
          onClick={() => onDirection('LEFT')}
          onTouchStart={(e) => {
            e.preventDefault()
            onDirection('LEFT')
          }}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          aria-label="Action Center"
          className="bg-[#18181b] hover:bg-[#222226] text-[#4edea3] rounded-xl flex items-center justify-center transition-all duration-75 shadow-inner border border-[#4edea3]/30 active:scale-95"
          onClick={() => {
            if (status === 'CRASHED') {
              onRestart()
            } else {
              onTogglePlay()
            }
          }}
        >
          {status === 'CRASHED' ? (
            <RotateCcw className="w-5 h-5 animate-spin-slow text-[#f43f5e]" />
          ) : status === 'PLAYING' ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current" />
          )}
        </button>

        <button
          type="button"
          aria-label="Move Right"
          className="bg-[#1f1f22] hover:bg-[#27272a] active:bg-[#4edea3] active:text-[#0e0e11] text-[#e4e1e5] rounded-xl flex items-center justify-center transition-all duration-75 shadow-md active:scale-90 border border-[#2e2e32]"
          onClick={() => onDirection('RIGHT')}
          onTouchStart={(e) => {
            e.preventDefault()
            onDirection('RIGHT')
          }}
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        {/* Row 3 */}
        <div />
        <button
          type="button"
          aria-label="Move Down"
          className="bg-[#1f1f22] hover:bg-[#27272a] active:bg-[#4edea3] active:text-[#0e0e11] text-[#e4e1e5] rounded-xl flex items-center justify-center transition-all duration-75 shadow-md active:scale-90 border border-[#2e2e32]"
          onClick={() => onDirection('DOWN')}
          onTouchStart={(e) => {
            e.preventDefault()
            onDirection('DOWN')
          }}
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <div />
      </div>
    </div>
  )
}
