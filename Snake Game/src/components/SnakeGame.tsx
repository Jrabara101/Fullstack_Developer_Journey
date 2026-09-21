import React, { useEffect, useRef, useState, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { SnakeEngine, GRID_SIZE, TILE_COUNT } from '../engine/snakeEngine'
import { Direction, GameTelemetry, GameStatus, Difficulty } from '../types/game'
import { DecryptedText } from './reactbits/DecryptedText'
import { Button } from './ui/button'
import { AlertTriangle, RotateCcw, Play, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { soundEngine } from '../engine/sound'

interface SnakeGameProps {
  difficulty: Difficulty
  soundEnabled: boolean
  onTelemetryUpdate: (telemetry: GameTelemetry) => void
}

export const SnakeGame: React.FC<SnakeGameProps> = ({
  difficulty,
  soundEnabled,
  onTelemetryUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<SnakeEngine | null>(null)
  const [screenShake, setScreenShake] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [status, setStatus] = useState<GameStatus>('IDLE')
  const [telemetry, setTelemetry] = useState<GameTelemetry | null>(null)
  const [hasNewHighScore, setHasNewHighScore] = useState(false)

  // Touch swipe tracking (10px gesture threshold)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4edea3', '#6ffbbe', '#f59e0b', '#ffffff'],
    })
  }, [])

  // Initialize engine
  useEffect(() => {
    const engine = new SnakeEngine({
      onTelemetryUpdate: (t) => {
        setStatus(t.status)
        setTelemetry(t)
        onTelemetryUpdate(t)
      },
      onScreenShake: (intensity) => {
        // Apply random screen shake vector
        const angle = Math.random() * Math.PI * 2
        const offsetX = Math.cos(angle) * intensity
        const offsetY = Math.sin(angle) * intensity
        setScreenShake({ x: offsetX, y: offsetY })
        setTimeout(() => setScreenShake({ x: 0, y: 0 }), 120)
      },
      onNewHighScore: () => {
        setHasNewHighScore(true)
        triggerConfetti()
      },
    })

    engine.setDifficulty(difficulty)
    engineRef.current = engine

    return () => {
      engine.reset()
    }
  }, [difficulty, onTelemetryUpdate, triggerConfetti])

  // Sync difficulty setting
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setDifficulty(difficulty)
    }
  }, [difficulty])

  // Sync sound setting
  useEffect(() => {
    soundEngine.setEnabled(soundEnabled)
  }, [soundEnabled])

  // Sub-200ms Instant Restart
  const handleRestart = useCallback(() => {
    if (engineRef.current) {
      setHasNewHighScore(false)
      engineRef.current.reset()
      engineRef.current.start()
    }
  }, [])

  const handleTogglePlay = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.togglePlayPause()
    }
  }, [])

  const handleDirection = useCallback((dir: Direction) => {
    if (engineRef.current) {
      engineRef.current.queueDirection(dir)
    }
  }, [])

  // Expose direction handler to global window for external D-pad or keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser arrow key / space scroll
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      if (e.key === ' ' || e.code === 'Space') {
        if (engineRef.current) {
          if (engineRef.current.status === 'CRASHED') {
            handleRestart()
          } else {
            handleTogglePlay()
          }
        }
        return
      }

      if (e.key === 'Enter') {
        if (engineRef.current?.status === 'CRASHED') {
          handleRestart()
        }
        return
      }

      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          handleDirection('UP')
          break
        case 'arrowdown':
        case 's':
          handleDirection('DOWN')
          break
        case 'arrowleft':
        case 'a':
          handleDirection('LEFT')
          break
        case 'arrowright':
        case 'd':
          handleDirection('RIGHT')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDirection, handleRestart, handleTogglePlay])

  // Touch Swipe Handler (10px threshold)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!touchStartRef.current) return
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // Check 10px swipe threshold
    if (Math.max(absX, absY) >= 10) {
      if (absX > absY) {
        handleDirection(deltaX > 0 ? 'RIGHT' : 'LEFT')
      } else {
        handleDirection(deltaY > 0 ? 'DOWN' : 'UP')
      }
    } else {
      // Single tap on crash restarts immediately
      if (status === 'CRASHED') {
        handleRestart()
      } else if (status === 'IDLE') {
        handleRestart()
      }
    }

    touchStartRef.current = null
  }

  // Animation Frame Loop
  useEffect(() => {
    let animId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const renderLoop = (now: number) => {
      const engine = engineRef.current
      if (engine) {
        engine.update(now)
        engine.updateParticles()

        // Decay head pulse
        if (engine.headPulse > 0) {
          engine.headPulse = Math.max(0, engine.headPulse - 0.05)
        }

        // Draw Canvas
        draw(ctx, engine)
      }

      animId = requestAnimationFrame(renderLoop)
    }

    animId = requestAnimationFrame(renderLoop)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Main Canvas Drawing Routine
  const draw = (ctx: CanvasRenderingContext2D, engine: SnakeEngine) => {
    const width = TILE_COUNT * GRID_SIZE
    const height = TILE_COUNT * GRID_SIZE

    ctx.clearRect(0, 0, width, height)

    // 1. Dark arena background
    ctx.fillStyle = '#0c0c0f'
    ctx.fillRect(0, 0, width, height)

    // 2. LED Matrix Grid Dots
    ctx.fillStyle = '#1a1a20'
    for (let x = 0; x < TILE_COUNT; x++) {
      for (let y = 0; y < TILE_COUNT; y++) {
        ctx.fillRect(x * GRID_SIZE + GRID_SIZE / 2 - 1, y * GRID_SIZE + GRID_SIZE / 2 - 1, 2, 2)
      }
    }

    // 3. Draw Regular Food (Ruby Apple)
    const food = engine.regularFood
    const foodPixelX = food.x * GRID_SIZE + GRID_SIZE / 2
    const foodPixelY = food.y * GRID_SIZE + GRID_SIZE / 2

    // Pulsing aura
    const pulseFactor = 0.85 + 0.15 * Math.sin(Date.now() / 150)
    ctx.shadowColor = '#f43f5e'
    ctx.shadowBlur = 12 * pulseFactor
    ctx.fillStyle = '#f43f5e'
    ctx.beginPath()
    ctx.arc(foodPixelX, foodPixelY, (GRID_SIZE / 2 - 2) * pulseFactor, 0, Math.PI * 2)
    ctx.fill()

    // Tiny highlight specular dot on apple
    ctx.fillStyle = '#ffe4e6'
    ctx.beginPath()
    ctx.arc(foodPixelX - 2, foodPixelY - 2, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // 4. Draw Decaying Bonus Food (if active)
    if (engine.bonusFood) {
      const bFood = engine.bonusFood
      const bx = bFood.x * GRID_SIZE + GRID_SIZE / 2
      const by = bFood.y * GRID_SIZE + GRID_SIZE / 2
      const remainingRatio = (bFood.remainingMs || 0) / (bFood.durationMs || 5000)

      // Golden outer glow
      ctx.shadowColor = '#f59e0b'
      ctx.shadowBlur = 16
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(bx, by, GRID_SIZE / 2 - 1, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Countdown timer ring
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(bx, by, GRID_SIZE / 2 + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remainingRatio)
      ctx.stroke()

      // Multiplier text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 9px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`x${bFood.multiplier || 2}`, bx, by + 3)
    }

    // 5. Draw Snake Body & Tail with Chromatic Ripple
    const snake = engine.snake
    for (let i = snake.length - 1; i >= 0; i--) {
      const part = snake[i]
      const px = part.x * GRID_SIZE
      const py = part.y * GRID_SIZE

      const isHead = i === 0
      const isRipple = engine.rippleIndex === i

      if (isHead) {
        // Head with dynamic 15% pulse expansion on eat
        const scale = 1 + engine.headPulse * 0.15
        const size = GRID_SIZE * scale
        const offset = (size - GRID_SIZE) / 2

        ctx.shadowColor = '#4edea3'
        ctx.shadowBlur = 12
        ctx.fillStyle = '#4edea3'

        // Rounded head
        const radius = 6
        ctx.beginPath()
        ctx.roundRect(px - offset + 1, py - offset + 1, size - 2, size - 2, radius)
        ctx.fill()
        ctx.shadowBlur = 0

        // Dynamic Head Articulation: Directional Eyes
        drawHeadEyes(ctx, px - offset, py - offset, size, engine.direction)
      } else {
        // Body Segment
        const segmentProgress = i / snake.length // 0 near head, 1 near tail
        if (isRipple) {
          // Intense chromatic highlight passing through
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = '#6ffbbe'
          ctx.shadowBlur = 10
        } else {
          // Smooth emerald gradient toward tail
          const alpha = 0.95 - segmentProgress * 0.35
          ctx.fillStyle = `rgba(78, 222, 163, ${alpha})`
          ctx.shadowColor = '#4edea3'
          ctx.shadowBlur = 3
        }

        const segRadius = Math.max(2, 4 - Math.floor(segmentProgress * 3))
        ctx.beginPath()
        ctx.roundRect(px + 1.5, py + 1.5, GRID_SIZE - 3, GRID_SIZE - 3, segRadius)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // 6. Draw Collision Snapshot Point (Flashing Red crosshair)
    if (engine.status === 'CRASHED' && engine.collisionPoint) {
      const cx = engine.collisionPoint.x * GRID_SIZE
      const cy = engine.collisionPoint.y * GRID_SIZE
      const flash = Math.floor(Date.now() / 120) % 2 === 0

      ctx.fillStyle = flash ? 'rgba(244, 63, 94, 0.7)' : 'rgba(244, 63, 94, 0.2)'
      ctx.fillRect(cx, cy, GRID_SIZE, GRID_SIZE)
      ctx.strokeStyle = '#f43f5e'
      ctx.lineWidth = 2
      ctx.strokeRect(cx, cy, GRID_SIZE, GRID_SIZE)
    }

    // 7. Draw Shattered Pixel Dispersion Particles
    engine.particles.forEach((p) => {
      ctx.fillStyle = p.color
      ctx.globalAlpha = Math.max(0, p.life)
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
      ctx.globalAlpha = 1.0
    })
  }

  // Directional Eye articulation
  const drawHeadEyes = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    dir: Direction
  ) => {
    ctx.fillStyle = '#0e0e11'
    let eye1X = 0, eye1Y = 0, eye2X = 0, eye2Y = 0

    switch (dir) {
      case 'RIGHT':
        eye1X = x + size * 0.7
        eye1Y = y + size * 0.25
        eye2X = x + size * 0.7
        eye2Y = y + size * 0.75
        break
      case 'LEFT':
        eye1X = x + size * 0.3
        eye1Y = y + size * 0.25
        eye2X = x + size * 0.3
        eye2Y = y + size * 0.75
        break
      case 'UP':
        eye1X = x + size * 0.25
        eye1Y = y + size * 0.3
        eye2X = x + size * 0.75
        eye2Y = y + size * 0.3
        break
      case 'DOWN':
        eye1X = x + size * 0.25
        eye1Y = y + size * 0.7
        eye2X = x + size * 0.75
        eye2Y = y + size * 0.7
        break
    }

    const eyeRadius = 2.2
    ctx.beginPath()
    ctx.arc(eye1X, eye1Y, eyeRadius, 0, Math.PI * 2)
    ctx.arc(eye2X, eye2Y, eyeRadius, 0, Math.PI * 2)
    ctx.fill()

    // Inner bright pupil glint
    ctx.fillStyle = '#6ffbbe'
    ctx.fillRect(eye1X - 0.5, eye1Y - 0.5, 1, 1)
    ctx.fillRect(eye2X - 0.5, eye2Y - 0.5, 1, 1)
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Shake transform wrapper */}
      <div
        className="relative rounded-2xl p-2 bg-[#131316] border border-[#27272a]/80 shadow-[0_0_40px_rgba(78,222,163,0.12)] transition-transform"
        style={{
          transform: `translate(${screenShake.x}px, ${screenShake.y}px)`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={TILE_COUNT * GRID_SIZE}
          height={TILE_COUNT * GRID_SIZE}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="block rounded-xl bg-[#0c0c0f] cursor-crosshair max-w-full h-auto aspect-square"
          style={{ width: 'min(88vw, 480px)', height: 'min(88vw, 480px)' }}
        />

        {/* Start / Idle Prompt Overlay */}
        {status === 'IDLE' && (
          <div className="absolute inset-2 rounded-xl bg-[#0e0e11]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-12 h-12 rounded-full bg-[#4edea3]/10 border border-[#4edea3]/30 flex items-center justify-center mb-3">
              <Play className="w-6 h-6 text-[#4edea3] fill-[#4edea3] ml-0.5" />
            </div>
            <h2 className="text-xl font-bold font-mono text-[#e4e1e5] mb-1">
              <DecryptedText text="ARENA INITIALIZED" speed={30} />
            </h2>
            <p className="text-xs text-[#9ca3af] max-w-xs mb-5">
              Claustrophobic spatial management. Logarithmic speed curves. Decaying bonus fruits.
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={() => engineRef.current?.start()}
              className="gap-2 font-mono text-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              PRESS SPACE OR CLICK TO LAUNCH
            </Button>
            <div className="mt-4 flex items-center gap-4 text-[11px] text-[#71717a] font-mono">
              <span>[W A S D / ARROWS]</span>
              <span>•</span>
              <span>[10px MOBILE SWIPE]</span>
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {status === 'PAUSED' && (
          <div className="absolute inset-2 rounded-xl bg-[#0e0e11]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
            <h2 className="text-2xl font-bold font-mono text-[#38bdf8] mb-2 tracking-wider">
              SYSTEM SUSPENDED
            </h2>
            <p className="text-xs text-[#9ca3af] mb-4">Tactile engine on standby</p>
            <Button
              variant="outline"
              size="default"
              onClick={handleTogglePlay}
              className="font-mono text-xs"
            >
              RESUME ARENA [SPACE]
            </Button>
          </div>
        )}

        {/* Game Over / Crash Modal Overlay (Sub-200ms Instant Replay) */}
        {status === 'CRASHED' && (
          <div className="absolute inset-2 rounded-xl bg-[#0e0e11]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-[#f43f5e]/15 border border-[#f43f5e]/40 flex items-center justify-center mb-2">
              <AlertTriangle className="w-7 h-7 text-[#f43f5e]" />
            </div>
            
            <h2 className="text-2xl font-bold font-mono text-[#f43f5e] mb-1">
              <DecryptedText text="SYSTEM CRASH" speed={25} />
            </h2>
            <p className="text-xs text-[#9ca3af] mb-4">
              Buffer overflow. Kinetic collision confirmed at highlighted coordinates.
            </p>

            {hasNewHighScore && (
              <div className="mb-3 px-3 py-1 bg-[#f59e0b]/20 border border-[#f59e0b]/40 rounded-full text-xs font-mono text-[#fbbf24] flex items-center gap-1.5 animate-bounce">
                <Sparkles className="w-3.5 h-3.5" />
                NEW SESSION HIGH SCORE!
              </div>
            )}

            {/* Run Stats Matrix */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-5 text-center">
              <div className="bg-[#18181b] p-2.5 rounded-lg border border-[#27272a]">
                <span className="text-[10px] text-[#9ca3af] block font-mono">SCORE</span>
                <span className="font-mono text-base font-bold text-[#4edea3]">
                  {telemetry?.score || 0}
                </span>
              </div>
              <div className="bg-[#18181b] p-2.5 rounded-lg border border-[#27272a]">
                <span className="text-[10px] text-[#9ca3af] block font-mono">APPLES</span>
                <span className="font-mono text-base font-bold text-[#e4e1e5]">
                  {telemetry?.applesEaten || 0}
                </span>
              </div>
              <div className="bg-[#18181b] p-2.5 rounded-lg border border-[#27272a]">
                <span className="text-[10px] text-[#9ca3af] block font-mono">MAX COMBO</span>
                <span className="font-mono text-base font-bold text-[#f59e0b]">
                  x{telemetry?.multiplier || 1}
                </span>
              </div>
            </div>

            {/* Instant Sub-200ms Reboot Action */}
            <Button
              variant="default"
              size="lg"
              onClick={handleRestart}
              className="gap-2 font-mono text-xs sm:text-sm tracking-wider"
            >
              <RotateCcw className="w-4 h-4" />
              INSTANT REBOOT [SPACE / TAP]
            </Button>
            <span className="text-[10px] text-[#71717a] font-mono mt-2">
              Sub-200ms latency loop
            </span>
          </div>
        )}
      </div>

      {/* Quick Controls Caption Bar */}
      <div className="mt-3 flex items-center justify-between w-full max-w-[480px] px-2 text-[11px] text-[#9ca3af] font-mono">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-[#1f1f22] rounded border border-[#2e2e32] text-[#e4e1e5]">
            WASD
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-[#1f1f22] rounded border border-[#2e2e32] text-[#e4e1e5]">
            ARROWS
          </kbd>
          <span>Steer</span>
        </span>

        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-[#1f1f22] rounded border border-[#2e2e32] text-[#e4e1e5]">
            SPACE
          </kbd>
          <span>Pause / Restart</span>
        </span>
      </div>
    </div>
  )
}
