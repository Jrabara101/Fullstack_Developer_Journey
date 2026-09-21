import React, { useState } from 'react'
import { SnakeGame } from './components/SnakeGame'
import { HUD } from './components/HUD'
import { TactileDPad } from './components/TactileDPad'
import { TelemetryMatrix } from './components/TelemetryMatrix'
import { ScanlineOverlay } from './components/reactbits/ScanlineOverlay'
import { ParticleBackdrop } from './components/reactbits/ParticleBackdrop'
import { ShinyText } from './components/reactbits/ShinyText'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Difficulty, GameTelemetry } from './types/game'
import {
  Volume2,
  VolumeX,
  Tv,
  Gamepad2,
  Zap,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

export function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL')
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [crtActive, setCrtActive] = useState<boolean>(true)
  const [telemetry, setTelemetry] = useState<GameTelemetry | null>(null)
  const [showManifesto, setShowManifesto] = useState<boolean>(false)

  return (
    <div className="relative min-h-screen bg-[#0e0e11] text-[#e4e1e5] flex flex-col font-sans selection:bg-[#4edea3]/30 selection:text-[#4edea3]">
      {/* ReactBits Particle Backdrop */}
      <ParticleBackdrop />

      {/* CRT Scanline Overlay Effect */}
      <ScanlineOverlay active={crtActive} />

      {/* Top Arcade Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#27272a]/70 bg-[#0e0e11]/85 backdrop-blur-xl px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3] shadow-[0_0_15px_rgba(78,222,163,0.2)]">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono text-sm sm:text-base font-bold tracking-wider flex items-center gap-2">
              <ShinyText text="ARCADE OS" speed={3} className="text-[#e4e1e5]" />
              <span className="text-[#4edea3] text-xs font-mono font-normal">// KINETIC SNAKE</span>
            </h1>
            <span className="text-[10px] font-mono text-[#71717a] hidden sm:inline-block">
              INPUT BUFFERED • LOGARITHMIC CURVE • SENSORY JUICE
            </span>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Difficulty Dropdown / Selector */}
          <div className="flex items-center bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
            {(['CASUAL', 'NORMAL', 'HARDCORE'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                  difficulty === d
                    ? 'bg-[#4edea3] text-[#0e0e11] font-bold shadow-[0_0_10px_rgba(78,222,163,0.3)]'
                    : 'text-[#9ca3af] hover:text-[#e4e1e5]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* CRT Toggle */}
          <Button
            variant={crtActive ? 'arcade' : 'outline'}
            size="sm"
            onClick={() => setCrtActive(!crtActive)}
            className="text-xs h-8 px-2.5 hidden sm:flex items-center gap-1.5"
            title="Toggle CRT Scanline Overlay"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>CRT {crtActive ? 'ON' : 'OFF'}</span>
          </Button>

          {/* Audio Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-xs h-8 px-2.5 flex items-center gap-1.5 border-[#27272a]"
            title="Toggle Synthesized Audio"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#4edea3]" />
                <span className="hidden sm:inline">AUDIO ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#71717a]" />
                <span className="hidden sm:inline">MUTED</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Arena Workspace */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top HUD Telemetry Row */}
        {telemetry && <HUD telemetry={telemetry} />}

        {/* Game Arena Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Center Column: Snake Canvas Arena */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center">
            <SnakeGame
              difficulty={difficulty}
              soundEnabled={soundEnabled}
              onTelemetryUpdate={setTelemetry}
            />
          </div>

          {/* Right Column: Telemetry Matrix, D-Pad, and Design Philosophy */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Live Telemetry Matrix */}
            <TelemetryMatrix telemetry={telemetry} />

            {/* Tactile On-Screen D-Pad (Touch & Click Support) */}
            <TactileDPad
              onDirection={(dir) => {
                window.dispatchEvent(
                  new KeyboardEvent('keydown', {
                    key:
                      dir === 'UP'
                        ? 'ArrowUp'
                        : dir === 'DOWN'
                        ? 'ArrowDown'
                        : dir === 'LEFT'
                        ? 'ArrowLeft'
                        : 'ArrowRight',
                  })
                )
              }}
              onTogglePlay={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
              }}
              onRestart={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
              }}
              status={telemetry?.status || 'IDLE'}
            />

            {/* Game Design Manifesto Drawer / Expander */}
            <Card className="border-[#27272a]/60 bg-[#131316]/70 backdrop-blur-md">
              <CardContent className="p-4">
                <button
                  type="button"
                  onClick={() => setShowManifesto(!showManifesto)}
                  className="flex items-center justify-between w-full text-left text-xs font-mono text-[#9ca3af] hover:text-[#4edea3] transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-bold">
                    <Info className="w-3.5 h-3.5 text-[#4edea3]" />
                    GAME FEEL MANIFESTO
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      showManifesto ? 'rotate-90 text-[#4edea3]' : ''
                    }`}
                  />
                </button>

                {showManifesto && (
                  <div className="mt-3 pt-3 border-t border-[#27272a]/40 text-[11px] text-[#a1a1aa] space-y-2.5 font-sans leading-relaxed">
                    <div>
                      <strong className="text-[#4edea3] font-mono block">1. Self-Imposed Spatial Trap</strong>
                      The player is their own antagonist. Tail growth actively constricts movement corridors.
                    </div>
                    <div>
                      <strong className="text-[#f59e0b] font-mono block">2. Passive Coiling Disruptor</strong>
                      Decaying bonus fruits spawn opposite your quadrant for 5s to break safe lawnmower patterns with big multipliers.
                    </div>
                    <div>
                      <strong className="text-[#38bdf8] font-mono block">3. Input Buffering & Pacing</strong>
                      Taps are queued across ticks for seamless U-turns. Continuous logarithmic curve speeds up 1.5% per apple.
                    </div>
                    <div>
                      <strong className="text-[#f43f5e] font-mono block">4. Sub-200ms Restart Loop</strong>
                      One-key reboot (Space/Enter or tap) eliminates downtime between failure and retry.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-[#27272a]/60 bg-[#0e0e11]/80 backdrop-blur-md py-4 px-6 text-center text-xs font-mono text-[#71717a]">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span>SNAKE ARCADE OS v2.0</span>
          <span>•</span>
          <span>BUILT WITH REACT + VITE + SHADCN + REACTBITS</span>
          <span>•</span>
          <span className="text-[#4edea3]">HIGH-OCTANE KINETICS</span>
        </div>
      </footer>
    </div>
  )
}

export default App
