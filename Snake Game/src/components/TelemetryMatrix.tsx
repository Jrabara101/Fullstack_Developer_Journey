import React from 'react'
import { GameTelemetry } from '../types/game'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Activity, Radio, Cpu, Sparkles } from 'lucide-react'
import { Progress } from './ui/progress'

interface TelemetryMatrixProps {
  telemetry: GameTelemetry | null
}

export const TelemetryMatrix: React.FC<TelemetryMatrixProps> = ({ telemetry }) => {
  const trail = telemetry?.trailLength || 3
  const maxCapacity = 24 * 24
  const claustrophobiaRatio = Math.min(100, Math.round((trail / maxCapacity) * 100))

  return (
    <Card className="w-full border-[#27272a]/70 bg-[#131316]/90 backdrop-blur-md">
      <CardHeader className="pb-3 border-b border-[#27272a]/40">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#e4e1e5]">
            <Activity className="w-4 h-4 text-[#4edea3]" />
            Arena Telemetry Matrix
          </CardTitle>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#4edea3]">
            <Radio className="w-3 h-3 animate-pulse" />
            LIVE LINK
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 text-xs font-mono">
        {/* Spatial Claustrophobia Meter */}
        <div>
          <div className="flex justify-between text-[#9ca3af] mb-1.5">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
              Spatial Claustrophobia
            </span>
            <span className="text-[#38bdf8] font-bold">{claustrophobiaRatio}%</span>
          </div>
          <Progress
            value={claustrophobiaRatio}
            indicatorClassName="bg-gradient-to-r from-[#4edea3] via-[#f59e0b] to-[#f43f5e]"
          />
          <span className="text-[10px] text-[#71717a] mt-1 block">
            {trail} of {maxCapacity} grid units occupied
          </span>
        </div>

        {/* Dynamic Logarithmic Pacing */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#27272a]/30">
          <div className="bg-[#18181b] p-2.5 rounded-lg border border-[#27272a]/60">
            <span className="text-[10px] text-[#9ca3af] block">TICK CADENCE</span>
            <span className="text-sm font-bold text-[#4edea3]">
              {telemetry?.tickRateMs || 120} ms
            </span>
          </div>

          <div className="bg-[#18181b] p-2.5 rounded-lg border border-[#27272a]/60">
            <span className="text-[10px] text-[#9ca3af] block">SPEED MULTIPLIER</span>
            <span className="text-sm font-bold text-[#38bdf8]">
              {telemetry?.speedMultiplier || 1.0}x
            </span>
          </div>
        </div>

        {/* Bonus & Combo Telemetry */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#18181b] p-2.5 rounded-lg border border-[#27272a]/60">
            <span className="text-[10px] text-[#9ca3af] block">BONUS HARVESTED</span>
            <span className="text-sm font-bold text-[#f59e0b] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {telemetry?.bonusEaten || 0}
            </span>
          </div>

          <div className="bg-[#18181b] p-2.5 rounded-lg border border-[#27272a]/60">
            <span className="text-[10px] text-[#9ca3af] block">INPUT BUFFER</span>
            <span className="text-sm font-bold text-[#4edea3]">
              100% RELIABLE
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
