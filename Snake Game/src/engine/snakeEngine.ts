import { Direction, Food, GameStatus, Difficulty, Point, Particle, GameTelemetry } from '../types/game'
import { soundEngine } from './sound'

export const GRID_SIZE = 20
export const TILE_COUNT = 24 // 480x480 canvas resolution (24x24 tiles)

export interface SnakeEngineCallbacks {
  onTelemetryUpdate: (telemetry: GameTelemetry) => void
  onScreenShake: (intensity: number) => void
  onNewHighScore: (newHigh: number) => void
}

export class SnakeEngine {
  public snake: Point[] = []
  public direction: Direction = 'RIGHT'
  public inputQueue: Direction[] = []
  public regularFood: Food = { x: 5, y: 5, type: 'regular' }
  public bonusFood: Food | null = null

  public status: GameStatus = 'IDLE'
  public difficulty: Difficulty = 'NORMAL'
  public score = 0
  public highScore = 0
  public applesEaten = 0
  public bonusEaten = 0
  public comboMultiplier = 1
  public elapsedSeconds = 0

  public collisionPoint: Point | null = null
  public particles: Particle[] = []

  // Visual juice metrics
  public headPulse = 0 // 1.0 down to 0
  public rippleIndex = -1 // segment index currently experiencing chromatic ripple
  public shakeIntensity = 0

  private lastTickTime = 0
  private timerInterval: number | null = null
  private bonusDecayInterval: number | null = null
  private callbacks: SnakeEngineCallbacks

  constructor(callbacks: SnakeEngineCallbacks) {
    this.callbacks = callbacks
    this.loadHighScore()
    this.reset()
  }

  private loadHighScore() {
    try {
      const stored = localStorage.getItem('arcade_snake_highscore')
      if (stored) {
        this.highScore = parseInt(stored, 10) || 0
      }
    } catch {
      this.highScore = 0
    }
  }

  public saveHighScore() {
    try {
      if (this.score > this.highScore) {
        this.highScore = this.score
        localStorage.setItem('arcade_snake_highscore', String(this.highScore))
        this.callbacks.onNewHighScore(this.highScore)
      }
    } catch {
      // Ignore
    }
  }

  public setDifficulty(diff: Difficulty) {
    this.difficulty = diff
    this.emitTelemetry()
  }

  public getTickRate(): number {
    let baseTick = 120
    let minTick = 50
    const decayRate = 0.985 // ~1.5% speedup per apple

    if (this.difficulty === 'CASUAL') {
      baseTick = 145
      minTick = 70
    } else if (this.difficulty === 'HARDCORE') {
      baseTick = 90
      minTick = 38
    }

    const calculated = Math.round(baseTick * Math.pow(decayRate, this.applesEaten))
    return Math.max(minTick, calculated)
  }

  public getSpeedMultiplier(): number {
    const base = this.difficulty === 'CASUAL' ? 145 : this.difficulty === 'NORMAL' ? 120 : 90
    return +(base / this.getTickRate()).toFixed(2)
  }

  public reset() {
    this.snake = [
      { x: 10, y: 12 },
      { x: 9, y: 12 },
      { x: 8, y: 12 }
    ]
    this.direction = 'RIGHT'
    this.inputQueue = []
    this.status = 'IDLE'
    this.score = 0
    this.applesEaten = 0
    this.bonusEaten = 0
    this.comboMultiplier = 1
    this.elapsedSeconds = 0
    this.collisionPoint = null
    this.particles = []
    this.headPulse = 0
    this.rippleIndex = -1
    this.bonusFood = null

    this.clearIntervals()
    this.spawnRegularFood()
    this.emitTelemetry()
  }

  public start() {
    if (this.status === 'PLAYING') return

    if (this.status === 'CRASHED' || this.status === 'IDLE') {
      this.reset()
    }

    this.status = 'PLAYING'
    this.lastTickTime = performance.now()
    this.startTimers()
    soundEngine.playTick()
    this.emitTelemetry()
  }

  public pause() {
    if (this.status !== 'PLAYING') return
    this.status = 'PAUSED'
    this.clearIntervals()
    soundEngine.playTick()
    this.emitTelemetry()
  }

  public resume() {
    if (this.status !== 'PAUSED') return
    this.status = 'PLAYING'
    this.lastTickTime = performance.now()
    this.startTimers()
    soundEngine.playTick()
    this.emitTelemetry()
  }

  public togglePlayPause() {
    if (this.status === 'PLAYING') {
      this.pause()
    } else if (this.status === 'PAUSED') {
      this.resume()
    } else {
      this.start()
    }
  }

  private startTimers() {
    this.clearIntervals()

    this.timerInterval = window.setInterval(() => {
      if (this.status === 'PLAYING') {
        this.elapsedSeconds++
        this.emitTelemetry()
      }
    }, 1000)

    // Check bonus food decay
    this.bonusDecayInterval = window.setInterval(() => {
      if (this.status === 'PLAYING' && this.bonusFood && this.bonusFood.spawnedAt && this.bonusFood.durationMs) {
        const elapsed = Date.now() - this.bonusFood.spawnedAt
        const remaining = Math.max(0, this.bonusFood.durationMs - elapsed)
        this.bonusFood.remainingMs = remaining

        if (remaining <= 2000 && remaining > 0 && Math.floor(remaining / 500) % 2 === 0) {
          soundEngine.playDecayTick()
        }

        if (remaining <= 0) {
          // Bonus expired without being collected
          this.bonusFood = null
          this.comboMultiplier = 1 // reset combo
        }
        this.emitTelemetry()
      }
    }, 100)
  }

  private clearIntervals() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
    if (this.bonusDecayInterval) {
      clearInterval(this.bonusDecayInterval)
      this.bonusDecayInterval = null
    }
  }

  // Queue input with buffer protection against 180-degree suicide
  public queueDirection(dir: Direction) {
    if (this.status !== 'PLAYING' && this.status !== 'PAUSED') {
      if (this.status === 'IDLE' || this.status === 'CRASHED') {
        this.start()
      }
    }

    // Reference the last planned direction (either in queue or current)
    const referenceDir = this.inputQueue.length > 0 
      ? this.inputQueue[this.inputQueue.length - 1] 
      : this.direction

    // Prevent direct 180 reversals or redundant pushes
    if (this.isOpposite(dir, referenceDir) || dir === referenceDir) {
      return
    }

    // Buffer maximum 2 pending moves to keep responsiveness razor sharp
    if (this.inputQueue.length < 2) {
      this.inputQueue.push(dir)
    }
  }

  private isOpposite(a: Direction, b: Direction): boolean {
    return (
      (a === 'UP' && b === 'DOWN') ||
      (a === 'DOWN' && b === 'UP') ||
      (a === 'LEFT' && b === 'RIGHT') ||
      (a === 'RIGHT' && b === 'LEFT')
    )
  }

  // Main fixed-step engine update
  public update(now: number) {
    if (this.status !== 'PLAYING') return

    const tickInterval = this.getTickRate()
    if (now - this.lastTickTime < tickInterval) {
      return
    }
    this.lastTickTime = now

    // Dequeue next valid input
    if (this.inputQueue.length > 0) {
      const nextDir = this.inputQueue.shift()!
      if (!this.isOpposite(nextDir, this.direction)) {
        this.direction = nextDir
      }
    }

    // Step chromatic ripple along tail
    if (this.rippleIndex >= 0) {
      this.rippleIndex++
      if (this.rippleIndex >= this.snake.length) {
        this.rippleIndex = -1
      }
    }

    // Calculate next head position
    const currentHead = this.snake[0]
    let nextX = currentHead.x
    let nextY = currentHead.y

    switch (this.direction) {
      case 'UP': nextY--; break
      case 'DOWN': nextY++; break
      case 'LEFT': nextX--; break
      case 'RIGHT': nextX++; break
    }

    const nextHead: Point = { x: nextX, y: nextY }

    // Check Wall Collision
    if (nextX < 0 || nextX >= TILE_COUNT || nextY < 0 || nextY >= TILE_COUNT) {
      this.handleCrash(nextHead)
      return
    }

    // Check Self-Collision
    // Note: If we are not growing this tick, snake tail will move, but hitting body still kills
    for (let i = 0; i < this.snake.length - 1; i++) {
      if (nextX === this.snake[i].x && nextY === this.snake[i].y) {
        this.handleCrash(nextHead)
        return
      }
    }

    // Move snake
    this.snake.unshift(nextHead)

    // Check Eat Regular Food
    if (nextX === this.regularFood.x && nextY === this.regularFood.y) {
      this.handleEatRegular()
    } 
    // Check Eat Bonus Food
    else if (this.bonusFood && nextX === this.bonusFood.x && nextY === this.bonusFood.y) {
      this.handleEatBonus()
    } 
    else {
      // Pop tail segment
      this.snake.pop()
    }

    this.emitTelemetry()
  }

  private handleEatRegular() {
    this.applesEaten++
    const points = Math.round(100 * this.comboMultiplier * this.getSpeedMultiplier())
    this.score += points

    // Trigger visual juice
    this.headPulse = 1.0
    this.rippleIndex = 0
    this.callbacks.onScreenShake(4)
    soundEngine.playEat(this.getSpeedMultiplier())

    this.saveHighScore()
    this.spawnRegularFood()

    // Passive Coiling Disruptor: Spawn bonus decaying fruit every 5 apples
    if (this.applesEaten % 5 === 0 && !this.bonusFood) {
      this.spawnBonusFood()
    }
  }

  private handleEatBonus() {
    if (!this.bonusFood) return
    this.bonusEaten++
    this.comboMultiplier = Math.min(5, this.comboMultiplier + 1)
    const points = Math.round(350 * this.comboMultiplier * this.getSpeedMultiplier())
    this.score += points

    // Intense visual juice
    this.headPulse = 1.3
    this.rippleIndex = 0
    this.callbacks.onScreenShake(8)
    soundEngine.playBonusEat()

    this.saveHighScore()
    this.bonusFood = null
  }

  private handleCrash(hitPoint: Point) {
    this.status = 'CRASHED'
    this.collisionPoint = hitPoint
    this.clearIntervals()
    this.saveHighScore()

    soundEngine.playDeath()
    this.callbacks.onScreenShake(12)

    // Generate shattered pixel dispersion particles
    this.spawnShatteredParticles(hitPoint)
    this.emitTelemetry()
  }

  private spawnShatteredParticles(hitPoint: Point) {
    this.particles = []
    const colors = ['#4edea3', '#6ffbbe', '#f43f5e', '#ffffff', '#fbbf24']

    // Explode snake body segments into particle shards
    this.snake.forEach((part, index) => {
      const pCount = index === 0 ? 12 : 3
      for (let i = 0; i < pCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1.5 + Math.random() * 5
        this.particles.push({
          x: part.x * GRID_SIZE + GRID_SIZE / 2,
          y: part.y * GRID_SIZE + GRID_SIZE / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
          maxLife: 30 + Math.floor(Math.random() * 30),
          size: 2 + Math.random() * 3
        })
      }
    })
  }

  public updateParticles() {
    if (this.particles.length === 0) return
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.96 // air drag
      p.vy *= 0.96
      p.life -= 1 / p.maxLife
      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  private spawnRegularFood() {
    let found = false
    let attempts = 0
    while (!found && attempts < 200) {
      attempts++
      const x = Math.floor(Math.random() * TILE_COUNT)
      const y = Math.floor(Math.random() * TILE_COUNT)

      // Ensure not on snake
      const onSnake = this.snake.some(p => p.x === x && p.y === y)
      // Ensure not on bonus food
      const onBonus = this.bonusFood && this.bonusFood.x === x && this.bonusFood.y === y

      if (!onSnake && !onBonus) {
        this.regularFood = { x, y, type: 'regular' }
        found = true
      }
    }
  }

  // Spawns bonus fruit in opposite quadrant to disrupt passive coiling
  private spawnBonusFood() {
    const head = this.snake[0]
    const mid = TILE_COUNT / 2

    // Opposite quadrant logic
    const minX = head.x < mid ? Math.floor(mid) : 0
    const maxX = head.x < mid ? TILE_COUNT - 1 : Math.floor(mid) - 1
    const minY = head.y < mid ? Math.floor(mid) : 0
    const maxY = head.y < mid ? TILE_COUNT - 1 : Math.floor(mid) - 1

    let found = false
    let attempts = 0
    let fx = 0
    let fy = 0

    while (!found && attempts < 100) {
      attempts++
      fx = minX + Math.floor(Math.random() * (maxX - minX + 1))
      fy = minY + Math.floor(Math.random() * (maxY - minY + 1))

      const onSnake = this.snake.some(p => p.x === fx && p.y === fy)
      const onRegular = this.regularFood.x === fx && this.regularFood.y === fy

      if (!onSnake && !onRegular) {
        found = true
      }
    }

    if (found) {
      const duration = 5000 // 5 seconds decay
      this.bonusFood = {
        x: fx,
        y: fy,
        type: 'bonus',
        spawnedAt: Date.now(),
        durationMs: duration,
        remainingMs: duration,
        multiplier: this.comboMultiplier + 1
      }
      soundEngine.playBonusSpawn()
    }
  }

  private emitTelemetry() {
    this.callbacks.onTelemetryUpdate({
      score: this.score,
      highScore: this.highScore,
      applesEaten: this.applesEaten,
      bonusEaten: this.bonusEaten,
      multiplier: this.comboMultiplier,
      speedMultiplier: this.getSpeedMultiplier(),
      tickRateMs: this.getTickRate(),
      elapsedSeconds: this.elapsedSeconds,
      trailLength: this.snake.length,
      status: this.status,
      difficulty: this.difficulty,
      collisionPoint: this.collisionPoint,
      headPulse: this.headPulse,
      rippleIndex: this.rippleIndex
    })
  }
}
