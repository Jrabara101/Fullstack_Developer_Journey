import React from 'react'
import { Trophy, Flame, Zap, Timer, Activity, ShieldAlert } from 'lucide-react'
import { GameTelemetry } from '../types/game'
import { ShinyText } from './reactbits/ShinyText'
import { Badge } from './ui/badge'

interface HUDProps {
  telemetry: GameTelemetry
}

export const HUD: React.FC<HUDProps> = ({ telemetry }) => {
  const formatNumber = (num: number, digits = 6) => {
    return String(num).padStart(digits, '0')
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
      {/* Current Score */}
      <div className="relative overflow-hidden rounded-xl bg-[#131316]/90 p-4 border border-[#27272a]/80 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono tracking-widest text-[#9ca3af] uppercase">
            Current Score
          </span>
          {telemetry.multiplier > 1 && (
            <Badge variant="gold" className="flex items-center gap-1 text-[10px] px-1.5 py-0.5">
              <Flame className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
              x{telemetry.multiplier} COMBO
            </Badge>
          )}
        </div>
        <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[#4edea3]">
          {formatNumber(telemetry.score)}
        </div>
        {/* Glow ambient */}
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-[#4edea3]/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Session High Score */}
      <div className="relative overflow-hidden rounded-xl bg-[#131316]/90 p-4 border border-[#27272a]/80 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono tracking-widest text-[#9ca3af] uppercase flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-[#f59e0b]" />
            Session Record
          </span>
          {telemetry.score >= telemetry.highScore && telemetry.score > 0 && (
            <Badge variant="neon" className="text-[9px] px-1 py-0">NEW HI</Badge>
          )}
        </div>
        <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[#e4e1e5]">
          <ShinyText text={formatNumber(telemetry.highScore)} speed={3} />
        </div>
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-[#f59e0b]/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Speed & Tick Rate */}
      <div className="relative overflow-hidden rounded-xl bg-[#131316]/90 p-4 border border-[#27272a]/80 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono tracking-widest text-[#9ca3af] uppercase flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#38bdf8]" />
            Dynamic Speed
          </span>
          <span className="text-[10px] font-mono text-[#38bdf8] font-bold">
            {telemetry.speedMultiplier}x
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#e4e1e5]">
            {telemetry.tickRateMs}ms
          </span>
          <span className="text-xs text-[#71717a] font-mono">/ tick</span>
        </div>
        <div className="w-full bg-[#27272a] h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#38bdf8] to-[#f43f5e] h-full transition-all duration-300 rounded-full"
            style={{
              width: `${Math.min(100, Math.max(10, ((150 - telemetry.tickRateMs) / 100) * 100))}%`,
            }}
          />
        </div>
      </div>

      {/* Arena Status & Telemetry */}
      <div className="relative overflow-hidden rounded-xl bg-[#131316]/90 p-4 border border-[#27272a]/80 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono tracking-widest text-[#9ca3af] uppercase flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#a855f7]" />
            Telemetry
          </span>
          <span className="text-[10px] font-mono text-[#a855f7] flex items-center gap-1">
            <Timer className="w-3 h-3" />
            {formatTime(telemetry.elapsedSeconds)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col">
            <span className="text-xs text-[#9ca3af] font-mono">Length: {telemetry.trailLength}</span>
            <span className="text-xs text-[#9ca3af] font-mono">Eaten: {telemetry.applesEaten}</span>
          </div>
          <div>
            {telemetry.status === 'PLAYING' && (
              <Badge variant="default" className="text-[10px] animate-pulse">
                RUNNING
              </Badge>
            )}
            {telemetry.status === 'PAUSED' && (
              <Badge variant="secondary" className="text-[10px]">
                PAUSED
              </Badge>
            )}
            {telemetry.status === 'CRASHED' && (
              <Badge variant="destructive" className="text-[10px] flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                CRASHED
              </Badge>
            )}
            {telemetry.status === 'IDLE' && (
              <Badge variant="outline" className="text-[10px]">
                STANDBY
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
