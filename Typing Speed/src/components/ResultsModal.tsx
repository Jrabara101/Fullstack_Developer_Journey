import React, { useEffect, useMemo } from 'react'
import confetti from 'canvas-confetti'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Share2,
  Clock
} from 'lucide-react'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import type { TestMetrics, PersonalBestRecord } from '../types/typing'

interface ResultsModalProps {
  isOpen: boolean
  onClose: () => void
  onRestart: () => void
  metrics: TestMetrics | null
  personalBest: PersonalBestRecord | null
  modeLabel: string
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  metrics,
  personalBest,
  modeLabel,
}) => {
  const isNewRecord = useMemo(() => {
    if (!metrics) return false
    if (!personalBest) return metrics.wpm > 0
    return metrics.wpm > personalBest.wpm
  }, [metrics, personalBest])

  useEffect(() => {
    if (isOpen && isNewRecord) {
      // Trigger confetti celebratory effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#6366f1', '#ec4899']
        })
      } catch (err) {
        console.warn('Confetti error:', err)
      }
    }
  }, [isOpen, isNewRecord])

  if (!metrics) return null

  const handleShare = () => {
    const text = `⚡ ZenType Score: ${metrics.wpm} WPM | ${metrics.accuracy}% Accuracy | ${metrics.consistency}% Consistency in ${modeLabel} mode!`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      alert('Score copied to clipboard!')
    }
  }

  // Format chart data
  const chartData = metrics.history.map(item => ({
    time: `${item.time}s`,
    wpm: item.wpm,
    rawWpm: item.rawWpm,
    errors: item.errors,
  }))

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-3xl font-sans" showCloseButton={true}>
      <div className="flex flex-col gap-6">
        
        {/* Top Header & PB Notification */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              Test Debrief //
            </span>
            <Badge variant="outline" className="font-mono text-[11px]">
              {modeLabel}
            </Badge>
          </div>

          {isNewRecord && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 border border-amber-400/30 text-xs font-medium text-amber-400 animate-pulse">
              <Trophy className="h-3.5 w-3.5" />
              <span>New Personal Best!</span>
            </div>
          )}
        </div>

        {/* Hero Metrics Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Main Hero WPM */}
          <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <span className="text-xs font-mono text-zinc-500">wpm</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-5xl font-extrabold tracking-tight text-amber-400">
                {metrics.wpm}
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 font-mono">
              raw: <span className="text-zinc-400">{metrics.rawWpm}</span>
            </span>
          </div>

          {/* Accuracy */}
          <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <span className="text-xs font-mono text-zinc-500">acc</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-5xl font-extrabold tracking-tight text-zinc-100">
                {metrics.accuracy}
              </span>
              <span className="font-mono text-2xl text-zinc-500">%</span>
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 font-mono">
              consistency: <span className="text-zinc-400">{metrics.consistency}%</span>
            </span>
          </div>

          {/* Characters Breakdown */}
          <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <span className="text-xs font-mono text-zinc-500">characters</span>
            <div className="mt-2 flex flex-col gap-1 font-mono text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>correct</span>
                <span className="text-emerald-400 font-medium">{metrics.correctChars}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>incorrect</span>
                <span className="text-rose-400 font-medium">{metrics.incorrectChars}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>extra / miss</span>
                <span className="text-zinc-500">{metrics.extraChars} / {metrics.missedChars}</span>
              </div>
            </div>
          </div>

          {/* Test Duration & Info */}
          <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <span className="text-xs font-mono text-zinc-500">duration</span>
            <div className="flex items-center gap-2 mt-2 font-mono text-3xl font-bold text-zinc-200">
              <Clock className="h-5 w-5 text-zinc-500" />
              <span>{metrics.timeElapsed}s</span>
            </div>
            {personalBest && (
              <span className="text-[11px] text-zinc-500 mt-auto font-mono">
                all-time pb: <span className="text-amber-400">{personalBest.wpm} wpm</span>
              </span>
            )}
          </div>
        </div>

        {/* Analytics Progression Chart */}
        <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="flex items-center justify-between mb-3 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              WPM Progression Curve
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Net WPM
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-zinc-500" />
                Raw WPM
              </span>
            </div>
          </div>

          <div className="h-48 w-full">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#52525b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#52525b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#09090b',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="wpm"
                    stroke="#fbbf24"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#wpmGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="rawWpm"
                    stroke="#71717a"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-xs text-zinc-600">
                Single-second sprint completed.
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="font-mono text-xs gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Result</span>
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              className="font-mono text-xs"
            >
              Review Canvas
            </Button>

            <Button
              variant="accent"
              size="md"
              onClick={onRestart}
              className="font-mono text-xs gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Next Test</span>
              <span className="rounded bg-amber-500/30 px-1 py-0.5 text-[10px] text-zinc-900 font-bold">
                Tab + Enter
              </span>
            </Button>
          </div>
        </div>

      </div>
    </Dialog>
  )
}
