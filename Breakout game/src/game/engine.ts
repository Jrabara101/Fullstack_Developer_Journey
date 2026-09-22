import { 
  Ball, 
  Paddle, 
  Brick, 
  PowerUpDrop, 
  ActivePowerUp, 
  Particle, 
  LaserBeam, 
  FloatingText, 
  GameSettings, 
  GameStats, 
  PowerUpType,
  BrickTier 
} from './types';
import { SECTORS } from './levels';
import { sound } from './audio';

export class BreakoutEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  // Arena Dimensions
  public readonly ARENA_WIDTH = 800;
  public readonly ARENA_HEIGHT = 500;

  // Settings & Game Stats
  public settings: GameSettings = {
    soundEnabled: true,
    soundVolume: 0.6,
    reducedMotion: false,
    crtOverlay: true,
    ballSpeedMultiplier: 1.0,
    homingAssistEnabled: true,
  };

  public stats: GameStats = {
    score: 0,
    highScore: 50000,
    lives: 3,
    maxLives: 3,
    combo: 1,
    maxCombo: 1,
    bricksDestroyed: 0,
    totalBricks: 0,
    activeSector: 1,
    isGameOver: false,
    isVictory: false,
    rank: 'A',
  };

  // State
  public isPlaying: boolean = false;
  public isPaused: boolean = false;
  public isWaitingLaunch: boolean = true;
  public screenShake: number = 0;
  public hitStopTimer: number = 0; // ms to pause physics
  public consecutiveBouncesWithoutHit: number = 0; // Anti-frustration tracker
  public upperDeckBreached: boolean = false;

  // Entities
  public paddle: Paddle;
  public balls: Ball[] = [];
  public bricks: Brick[][] = [];
  public powerUpDrops: PowerUpDrop[] = [];
  public activePowerUps: ActivePowerUp[] = [];
  public particles: Particle[] = [];
  public lasers: LaserBeam[] = [];
  public floatingTexts: FloatingText[] = [];

  // Key tracking for smooth acceleration
  public keys = {
    left: false,
    right: false,
    space: false,
  };
  public keyboardVelocity: number = 0;

  // Callbacks for React state sync
  public onStatsChange?: (stats: GameStats) => void;
  public onPowerUpsChange?: (active: ActivePowerUp[]) => void;
  public onLaunchStateChange?: (waiting: boolean) => void;
  public onSectorComplete?: (stats: GameStats) => void;
  public onGameOver?: (stats: GameStats) => void;

  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2D context');
    this.ctx = context;

    // Load High Score from localStorage
    try {
      const savedHigh = localStorage.getItem('cyberbreak_highscore');
      if (savedHigh) {
        this.stats.highScore = parseInt(savedHigh, 10) || 50000;
      }
    } catch {}

    // Initialize Paddle
    const baseWidth = 118;
    this.paddle = {
      x: (this.ARENA_WIDTH - baseWidth) / 2,
      y: this.ARENA_HEIGHT - 32,
      width: baseWidth,
      height: 14,
      baseWidth: baseWidth,
      targetX: (this.ARENA_WIDTH - baseWidth) / 2,
      glowTimer: 0,
      activeZone: 3,
      hasLasers: false,
      laserCooldown: 0,
      isMagnetic: false,
      caughtBall: null,
    };

    // Load Sector
    this.loadSector(this.stats.activeSector);
  }

  public loadSector(sectorId: number) {
    const sector = SECTORS.find(s => s.id === sectorId) || SECTORS[0];
    this.stats.activeSector = sector.id;

    // Reset paddle position & power-ups
    this.paddle.width = this.paddle.baseWidth;
    this.paddle.hasLasers = false;
    this.paddle.isMagnetic = false;
    this.paddle.caughtBall = null;
    this.activePowerUps = [];
    this.powerUpDrops = [];
    this.lasers = [];
    this.floatingTexts = [];
    this.upperDeckBreached = false;
    this.consecutiveBouncesWithoutHit = 0;

    // Build Bricks Grid
    this.bricks = [];
    let count = 0;
    const padding = 8;
    const offsetTop = 44;
    const sideMargin = 32;
    const totalAvailWidth = this.ARENA_WIDTH - (sideMargin * 2);
    const brickWidth = (totalAvailWidth - (padding * (sector.cols - 1))) / sector.cols;
    const brickHeight = 18;

    for (let r = 0; r < sector.rows; r++) {
      this.bricks[r] = [];
      for (let c = 0; c < sector.cols; c++) {
        const item = sector.pattern(r, c);
        if (item) {
          count++;
          this.bricks[r][c] = {
            x: sideMargin + c * (brickWidth + padding),
            y: offsetTop + r * (brickHeight + padding),
            width: brickWidth,
            height: brickHeight,
            tier: item.tier,
            hits: item.hits,
            maxHits: item.hits,
            status: 1,
            pulse: 0,
            powerUpType: item.powerUp,
          };
        } else {
          this.bricks[r][c] = {
            x: sideMargin + c * (brickWidth + padding),
            y: offsetTop + r * (brickHeight + padding),
            width: brickWidth,
            height: brickHeight,
            tier: 0,
            hits: 0,
            maxHits: 0,
            status: 0,
            pulse: 0,
          };
        }
      }
    }

    this.stats.totalBricks = count;
    this.stats.bricksDestroyed = 0;
    this.stats.combo = 1;
    this.stats.isGameOver = false;
    this.stats.isVictory = false;

    // Reset Ball on Paddle
    this.resetBallOnPaddle();
    this.syncStats();
    if (this.onPowerUpsChange) this.onPowerUpsChange(this.activePowerUps);
  }

  public resetBallOnPaddle() {
    this.balls = [];
    const newBall: Ball = {
      id: Math.random().toString(36).substring(2, 9),
      x: this.paddle.x + this.paddle.width / 2,
      y: this.paddle.y - 8,
      vx: 4.6 * this.settings.ballSpeedMultiplier,
      vy: -5.4 * this.settings.ballSpeedMultiplier,
      radius: 6.5,
      speed: 7.2 * this.settings.ballSpeedMultiplier,
      attached: true,
      trail: [],
    };
    this.balls.push(newBall);
    this.isWaitingLaunch = true;
    if (this.onLaunchStateChange) this.onLaunchStateChange(true);
  }

  public launchBall() {
    sound.init();
    const attachedBall = this.balls.find(b => b.attached);
    if (attachedBall) {
      attachedBall.attached = false;
      this.isWaitingLaunch = false;
      this.isPlaying = true;
      if (this.onLaunchStateChange) this.onLaunchStateChange(false);
      sound.playPaddleHit(3);
      this.addFloatingText(attachedBall.x, attachedBall.y - 12, 'ENGAGE!', '#06b6d4');
    } else if (this.paddle.caughtBall) {
      // Release magnetically caught ball
      const ball = this.paddle.caughtBall;
      ball.attached = false;
      // Launch at angle based on caught position
      const offset = (ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
      const angle = offset * (Math.PI / 3);
      const speed = ball.speed || 7.2 * this.settings.ballSpeedMultiplier;
      ball.vx = Math.sin(angle) * speed;
      ball.vy = -Math.abs(Math.cos(angle) * speed);
      this.paddle.caughtBall = null;
      sound.playPaddleHit(3);
    }
  }

  public fireLasers() {
    if (!this.paddle.hasLasers || this.paddle.laserCooldown > 0) return;
    sound.playLaserShot();
    this.paddle.laserCooldown = 14; // frames cooldown

    // Left cannon and Right cannon
    this.lasers.push({
      id: Math.random().toString(),
      x: this.paddle.x + 8,
      y: this.paddle.y - 4,
      vy: -13,
      width: 4,
      height: 14,
    });
    this.lasers.push({
      id: Math.random().toString(),
      x: this.paddle.x + this.paddle.width - 12,
      y: this.paddle.y - 4,
      vy: -13,
      width: 4,
      height: 14,
    });
  }

  // 1:1 Hardware pointer tracking
  public setPaddleTarget(clientX: number, rect: DOMRect) {
    const scaleX = this.ARENA_WIDTH / rect.width;
    const relativeX = (clientX - rect.left) * scaleX;
    this.paddle.targetX = Math.max(0, Math.min(this.ARENA_WIDTH - this.paddle.width, relativeX - this.paddle.width / 2));
  }

  // Mobile slider direct percentage
  public setPaddlePercent(pct: number) {
    const clampedPct = Math.max(0, Math.min(100, pct));
    const target = (clampedPct / 100) * (this.ARENA_WIDTH - this.paddle.width);
    this.paddle.targetX = target;
  }

  // Power-Up Activation System
  public applyPowerUp(type: PowerUpType) {
    sound.playPowerUpCollect();
    const durationMap: Record<PowerUpType, number> = {
      multi_ball: 0, // Instant
      laser: 12000, // 12 seconds
      wide_paddle: 14000, // 14 seconds
      slow_mo: 9000, // 9 seconds
      magnetic: 12000, // 12 seconds
      explosive: 10000, // 10 seconds
    };

    const duration = durationMap[type];
    const now = Date.now();

    // Floating notification
    const labels: Record<PowerUpType, { text: string; color: string }> = {
      multi_ball: { text: 'TRI-PHOTON ACTIVE!', color: '#06b6d4' },
      laser: { text: 'LASER CANNONS READY!', color: '#f43f5e' },
      wide_paddle: { text: 'SHIELD WINGS DEPLOYED', color: '#10b981' },
      slow_mo: { text: 'CHRONO WARP (SLOW-MO)', color: '#8b5cf6' },
      magnetic: { text: 'TRACTOR CLAMP ENGAGED', color: '#f59e0b' },
      explosive: { text: 'PLASMA EXPLOSIVES ARMED', color: '#d946ef' },
    };
    this.addFloatingText(this.paddle.x + this.paddle.width / 2, this.paddle.y - 25, labels[type].text, labels[type].color);

    if (type === 'multi_ball') {
      // Split each non-attached ball into 3 balls
      const newBalls: Ball[] = [];
      const currentBalls = this.balls.filter(b => !b.attached);
      if (currentBalls.length === 0) {
        // If ball was attached, launch and split
        this.launchBall();
      }
      
      this.balls.forEach(b => {
        if (!b.attached) {
          const speed = Math.hypot(b.vx, b.vy);
          // Angle 1: +28 degrees
          newBalls.push({
            id: Math.random().toString(36).substring(2, 9),
            x: b.x,
            y: b.y,
            vx: b.vx * 0.86 - b.vy * 0.5,
            vy: b.vx * 0.5 + b.vy * 0.86,
            radius: b.radius,
            speed: speed,
            attached: false,
            trail: [],
            isExplosive: b.isExplosive,
          });
          // Angle 2: -28 degrees
          newBalls.push({
            id: Math.random().toString(36).substring(2, 9),
            x: b.x,
            y: b.y,
            vx: b.vx * 0.86 + b.vy * 0.5,
            vy: -b.vx * 0.5 + b.vy * 0.86,
            radius: b.radius,
            speed: speed,
            attached: false,
            trail: [],
            isExplosive: b.isExplosive,
          });
        }
      });
      this.balls.push(...newBalls.slice(0, 6)); // limit to max 9 balls
      return;
    }

    if (type === 'wide_paddle') {
      this.paddle.width = this.paddle.baseWidth * 1.45;
    } else if (type === 'laser') {
      this.paddle.hasLasers = true;
    } else if (type === 'magnetic') {
      this.paddle.isMagnetic = true;
    } else if (type === 'explosive') {
      this.balls.forEach(b => b.isExplosive = true);
    } else if (type === 'slow_mo') {
      this.balls.forEach(b => {
        b.vx *= 0.6;
        b.vy *= 0.6;
      });
    }

    // Add or update active power up
    const existing = this.activePowerUps.find(p => p.type === type);
    if (existing) {
      existing.expiresAt = now + duration;
      existing.totalDuration = duration;
    } else {
      this.activePowerUps.push({
        type: type,
        expiresAt: now + duration,
        totalDuration: duration,
      });
    }

    if (this.onPowerUpsChange) this.onPowerUpsChange([...this.activePowerUps]);
  }

  private updatePowerUpDurations() {
    const now = Date.now();
    let changed = false;

    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const p = this.activePowerUps[i];
      if (now >= p.expiresAt) {
        // Deactivate
        if (p.type === 'wide_paddle') {
          this.paddle.width = this.paddle.baseWidth;
        } else if (p.type === 'laser') {
          this.paddle.hasLasers = false;
        } else if (p.type === 'magnetic') {
          this.paddle.isMagnetic = false;
          if (this.paddle.caughtBall) {
            this.launchBall();
          }
        } else if (p.type === 'explosive') {
          this.balls.forEach(b => b.isExplosive = false);
        } else if (p.type === 'slow_mo') {
          this.balls.forEach(b => {
            b.vx /= 0.6;
            b.vy /= 0.6;
          });
        }
        this.activePowerUps.splice(i, 1);
        changed = true;
      }
    }

    if (changed && this.onPowerUpsChange) {
      this.onPowerUpsChange([...this.activePowerUps]);
    }
  }

  // Floating text feedback (+100, x4 COMBO, etc)
  public addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      x: x,
      y: y,
      text: text,
      color: color,
      alpha: 1,
      vy: -1.2,
    });
  }

  // Particle Shatter Burst
  public createShatter(x: number, y: number, color: string, count: number = 16) {
    if (this.settings.reducedMotion) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 1.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.5,
        color: color,
        alpha: 1,
        decay: Math.random() * 0.025 + 0.015,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  // Trigger Screen Shake
  public triggerShake(amount: number) {
    if (this.settings.reducedMotion) return;
    this.screenShake = Math.max(this.screenShake, amount);
  }

  // Anti-Frustration "Final Brick" Homing Gravity Nudge
  private applyHomingAssist(ball: Ball) {
    if (!this.settings.homingAssistEnabled) return;
    if (this.consecutiveBouncesWithoutHit < 8) return;

    // Count remaining active bricks
    const activeBricks: Brick[] = [];
    for (const row of this.bricks) {
      for (const b of row) {
        if (b.status === 1) activeBricks.push(b);
      }
    }

    // Only assist if 4 or fewer bricks remain
    if (activeBricks.length === 0 || activeBricks.length > 4) return;

    // Find closest target brick
    let closest: Brick | null = null;
    let minDistSq = Infinity;
    for (const b of activeBricks) {
      const bx = b.x + b.width / 2;
      const by = b.y + b.height / 2;
      const dSq = (bx - ball.x) ** 2 + (by - ball.y) ** 2;
      if (dSq < minDistSq) {
        minDistSq = dSq;
        closest = b;
      }
    }

    if (!closest) return;

    // Compute target direction
    const targetX = closest.x + closest.width / 2;
    const targetY = closest.y + closest.height / 2;
    const dx = targetX - ball.x;
    const dy = targetY - ball.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;

    const targetDirX = dx / dist;
    const targetDirY = dy / dist;

    // Subtle invisible nudge (0.025 weight)
    const currentSpeed = Math.hypot(ball.vx, ball.vy);
    const nudge = 0.022;
    let newVx = ball.vx + targetDirX * nudge * currentSpeed;
    let newVy = ball.vy + targetDirY * nudge * currentSpeed;
    const newSpeed = Math.hypot(newVx, newVy);
    if (newSpeed > 0) {
      ball.vx = (newVx / newSpeed) * currentSpeed;
      ball.vy = (newVy / newSpeed) * currentSpeed;
    }
  }

  /* ==========================================================
     PHYSICS SIMULATION STEP
     ========================================================== */
  public update(dt: number) {
    if (this.isPaused) return;

    // Hit-Stop Micro-Pause (freezes simulation for tactical crunch)
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
      return;
    }

    this.updatePowerUpDurations();

    // 1. Keyboard Smooth Velocity Curves
    const accel = 1.8;
    const friction = 0.82;
    const maxKeySpeed = 22;

    if (this.keys.left) {
      this.keyboardVelocity = Math.max(-maxKeySpeed, this.keyboardVelocity - accel);
    } else if (this.keys.right) {
      this.keyboardVelocity = Math.min(maxKeySpeed, this.keyboardVelocity + accel);
    } else {
      this.keyboardVelocity *= friction;
      if (Math.abs(this.keyboardVelocity) < 0.1) this.keyboardVelocity = 0;
    }

    if (this.keyboardVelocity !== 0) {
      this.paddle.targetX = Math.max(0, Math.min(this.ARENA_WIDTH - this.paddle.width, this.paddle.targetX + this.keyboardVelocity));
    }

    // Smooth Paddle Interpolation (0.28 lerp for buttery responsiveness)
    this.paddle.x += (this.paddle.targetX - this.paddle.x) * 0.28;
    if (this.paddle.glowTimer > 0) this.paddle.glowTimer--;
    if (this.paddle.laserCooldown > 0) this.paddle.laserCooldown--;

    // 2. Lasers Update
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.y += l.vy;

      // Laser-Brick Collision
      let hit = false;
      for (const row of this.bricks) {
        for (const b of row) {
          if (b.status === 1) {
            if (l.x >= b.x && l.x <= b.x + b.width && l.y >= b.y && l.y <= b.y + b.height) {
              this.damageBrick(b);
              hit = true;
              break;
            }
          }
        }
        if (hit) break;
      }

      if (hit || l.y < 0) {
        this.createShatter(l.x, l.y, '#f43f5e', 4);
        this.lasers.splice(i, 1);
      }
    }

    // 3. Power-Up Falling Drops
    for (let i = this.powerUpDrops.length - 1; i >= 0; i--) {
      const p = this.powerUpDrops[i];
      p.y += p.vy;

      // Check paddle catch
      if (
        p.y + p.height >= this.paddle.y &&
        p.y <= this.paddle.y + this.paddle.height &&
        p.x + p.width >= this.paddle.x &&
        p.x <= this.paddle.x + this.paddle.width
      ) {
        this.applyPowerUp(p.type);
        this.powerUpDrops.splice(i, 1);
        continue;
      }

      // Fell off bottom
      if (p.y > this.ARENA_HEIGHT + 20) {
        this.powerUpDrops.splice(i, 1);
      }
    }

    // 4. Balls Update & Collisions
    let aliveCount = 0;

    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];

      // Attached to paddle (initial launch or magnetic catch)
      if (ball.attached) {
        ball.x = this.paddle.x + this.paddle.width / 2;
        ball.y = this.paddle.y - ball.radius - 2;
        aliveCount++;
        continue;
      }

      // Ball Trail
      if (!this.settings.reducedMotion) {
        ball.trail.push({ x: ball.x, y: ball.y, alpha: 0.7 });
        if (ball.trail.length > 8) ball.trail.shift();
      }

      // Invisible Homing Assistance
      this.applyHomingAssist(ball);

      // Advance ball position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Arena Boundaries
      // Left / Right walls
      if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.vx = Math.abs(ball.vx);
        sound.playWallBounce();
        this.consecutiveBouncesWithoutHit++;
      } else if (ball.x + ball.radius >= this.ARENA_WIDTH) {
        ball.x = this.ARENA_WIDTH - ball.radius;
        ball.vx = -Math.abs(ball.vx);
        sound.playWallBounce();
        this.consecutiveBouncesWithoutHit++;
      }

      // Ceiling Collision (Upper-Deck Euphoria Zone!)
      if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.vy = Math.abs(ball.vy);
        sound.playWallBounce();
        this.consecutiveBouncesWithoutHit++;

        if (!this.upperDeckBreached) {
          this.upperDeckBreached = true;
          this.addFloatingText(ball.x, 24, 'UPPER-DECK BREACH! 🔥', '#d946ef');
          this.triggerShake(3);
        }
      }

      // Paddle Collision (Segmented 5-Zone Curvature — The Illusion of English)
      if (
        ball.y + ball.radius >= this.paddle.y &&
        ball.y - ball.radius <= this.paddle.y + this.paddle.height &&
        ball.x + ball.radius >= this.paddle.x &&
        ball.x - ball.radius <= this.paddle.x + this.paddle.width &&
        ball.vy > 0
      ) {
        // Handle Magnetic Catch
        if (this.paddle.isMagnetic && !this.paddle.caughtBall) {
          ball.attached = true;
          this.paddle.caughtBall = ball;
          sound.playMagneticLatch();
          this.addFloatingText(ball.x, ball.y - 12, 'LATCHED [SPACE/CLICK]', '#f59e0b');
          aliveCount++;
          continue;
        }

        // Calculate Relative Hit Position from 0.0 (far left) to 1.0 (far right)
        const hitNorm = Math.max(0, Math.min(1, (ball.x - this.paddle.x) / this.paddle.width));
        let zone = 3;
        let reflectionAngle = 0; // Angle from vertical (radians)
        let speedBoost = 1.02;

        if (hitNorm < 0.15) {
          // Zone 1: Far Left Extreme (~25° from horizontal, i.e. 65° from vertical)
          zone = 1;
          reflectionAngle = -1.13; // ~65 deg
        } else if (hitNorm < 0.40) {
          // Zone 2: Mid Left (~45° angle)
          zone = 2;
          reflectionAngle = -0.78; // 45 deg
        } else if (hitNorm < 0.60) {
          // Zone 3: Sweet Spot Center (~85° vertical punch with extra speed!)
          zone = 3;
          reflectionAngle = (hitNorm - 0.5) * 0.4; // near vertical
          speedBoost = 1.05;
        } else if (hitNorm < 0.85) {
          // Zone 4: Mid Right (~45° angle)
          zone = 4;
          reflectionAngle = 0.78; // 45 deg
        } else {
          // Zone 5: Far Right Extreme (~25° from horizontal)
          zone = 5;
          reflectionAngle = 1.13; // ~65 deg
        }

        this.paddle.activeZone = zone;
        this.paddle.glowTimer = 16;
        sound.playPaddleHit(zone);

        const currentSpeed = Math.min(12, Math.hypot(ball.vx, ball.vy) * speedBoost);
        ball.vx = Math.sin(reflectionAngle) * currentSpeed;
        ball.vy = -Math.cos(reflectionAngle) * currentSpeed;
        ball.y = this.paddle.y - ball.radius - 1;

        // Reset Combo step on paddle hit
        if (this.stats.combo > 1) {
          this.stats.combo = 1;
          this.syncStats();
        }
        this.consecutiveBouncesWithoutHit++;
      }

      // Brick Collisions
      let hitABrick = false;
      for (let r = 0; r < this.bricks.length; r++) {
        for (let c = 0; c < this.bricks[r].length; c++) {
          const b = this.bricks[r][c];
          if (b.status === 1) {
            // Collision test
            if (
              ball.x + ball.radius > b.x &&
              ball.x - ball.radius < b.x + b.width &&
              ball.y + ball.radius > b.y &&
              ball.y - ball.radius < b.y + b.height
            ) {
              hitABrick = true;
              this.consecutiveBouncesWithoutHit = 0;

              // Calculate collision normal
              const overlapLeft = (ball.x + ball.radius) - b.x;
              const overlapRight = (b.x + b.width) - (ball.x - ball.radius);
              const overlapTop = (ball.y + ball.radius) - b.y;
              const overlapBottom = (b.y + b.height) - (ball.y - ball.radius);

              const minOverlapX = Math.min(overlapLeft, overlapRight);
              const minOverlapY = Math.min(overlapTop, overlapBottom);

              if (minOverlapX < minOverlapY) {
                ball.vx = -ball.vx;
              } else {
                ball.vy = -ball.vy;
              }

              // Damage brick
              this.damageBrick(b, ball.isExplosive);
              break;
            }
          }
        }
        if (hitABrick) break;
      }

      // Bottom Pit — Ball Lost
      if (ball.y - ball.radius > this.ARENA_HEIGHT) {
        this.balls.splice(i, 1);
        continue;
      }

      aliveCount++;
    }

    // Handle Life Loss if all balls are dropped
    if (aliveCount === 0 && !this.stats.isGameOver && !this.stats.isVictory) {
      this.handleBallLost();
    }

    // 5. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.rotation !== undefined && p.vRot !== undefined) p.rotation += p.vRot;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 6. Update Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 7. Check Victory Condition (All breakable bricks destroyed)
    this.checkVictory();
  }

  // Brick Damage & Shatter Logic
  public damageBrick(b: Brick, explosive: boolean = false) {
    b.hits--;
    b.pulse = 12;

    if (b.hits <= 0) {
      // Brick Shattered!
      b.status = 0;
      this.stats.bricksDestroyed++;
      
      // Hit-Stop Micro-Pause (28ms tactile resistance!)
      this.hitStopTimer = 28;

      // Color mapping
      const colors: Record<BrickTier, string> = {
        0: '#10b981', // Emerald
        1: '#f59e0b', // Amber
        2: '#d946ef', // Magenta
        3: '#fbbf24', // Explosive Cluster
        4: '#3b82f6', // Barrier
      };
      const color = colors[b.tier] || '#06b6d4';
      this.createShatter(b.x + b.width / 2, b.y + b.height / 2, color, b.tier === 2 ? 22 : 14);

      // Audio & Ascending Pitch scaling
      sound.playBrickBreak(this.stats.combo);

      // Score Calculation with Combo Scaling
      const pointValues: Record<BrickTier, number> = {
        0: 100,
        1: 250,
        2: 500,
        3: 350,
        4: 200,
      };
      const points = (pointValues[b.tier] || 100) * this.stats.combo;
      this.stats.score += points;
      this.stats.combo++;
      if (this.stats.combo > this.stats.maxCombo) {
        this.stats.maxCombo = this.stats.combo;
      }

      // Screen Shake
      this.triggerShake(b.tier === 2 ? 6 : 2.5);

      // Floating Score Toast
      const text = this.stats.combo > 3 ? `+${points} [x${this.stats.combo}!]` : `+${points}`;
      this.addFloatingText(b.x + b.width / 2, b.y - 6, text, color);

      // Spawn Power-Up Drop if assigned
      if (b.powerUpType) {
        this.spawnPowerUp(b.x + b.width / 2, b.y + b.height / 2, b.powerUpType);
      }

      // Handle Explosive Cluster (Tier 3) or Explosive Ball
      if (b.tier === 3 || explosive) {
        sound.playExplosion();
        this.triggerShake(7);
        this.detonateCluster(b.x + b.width / 2, b.y + b.height / 2, 70);
      }

      this.syncStats();
    } else {
      // Brick Cracked
      sound.playBrickHit(b.tier, this.stats.combo);
      this.triggerShake(1.5);
    }
  }

  // Explosive Cluster Detonation Radius
  private detonateCluster(centerX: number, centerY: number, radius: number) {
    this.createShatter(centerX, centerY, '#fbbf24', 30);
    this.addFloatingText(centerX, centerY - 15, '💥 PLASMA DETONATION!', '#fbbf24');

    for (const row of this.bricks) {
      for (const b of row) {
        if (b.status === 1) {
          const bx = b.x + b.width / 2;
          const by = b.y + b.height / 2;
          const dist = Math.hypot(bx - centerX, by - centerY);
          if (dist <= radius) {
            b.hits = 0;
            b.status = 0;
            this.stats.bricksDestroyed++;
            this.stats.score += 200 * this.stats.combo;
            this.createShatter(bx, by, '#f59e0b', 10);
            if (b.powerUpType) {
              this.spawnPowerUp(bx, by, b.powerUpType);
            }
          }
        }
      }
    }
  }

  private spawnPowerUp(x: number, y: number, type: PowerUpType) {
    this.powerUpDrops.push({
      id: Math.random().toString(),
      type: type,
      x: x - 14,
      y: y,
      vy: 2.2,
      width: 28,
      height: 28,
    });
  }

  private handleBallLost() {
    this.stats.lives--;
    this.stats.combo = 1;
    sound.playLifeLost();
    this.triggerShake(8);

    if (this.stats.lives <= 0) {
      // Game Over
      this.stats.isGameOver = true;
      this.isPlaying = false;
      this.calculateRank();
      this.syncStats();
      if (this.onGameOver) this.onGameOver(this.stats);
    } else {
      // Respawn Ball on Paddle
      this.resetBallOnPaddle();
      this.syncStats();
    }
  }

  private checkVictory() {
    if (this.stats.isVictory || this.stats.isGameOver) return;
    
    let active = 0;
    for (const row of this.bricks) {
      for (const b of row) {
        if (b.status === 1) active++;
      }
    }

    if (active === 0) {
      this.stats.isVictory = true;
      this.isPlaying = false;
      sound.playVictory();
      this.calculateRank();
      this.syncStats();
      if (this.onSectorComplete) this.onSectorComplete(this.stats);
    }
  }

  private calculateRank() {
    // Determine Rank: S+, A, B, C
    if (this.stats.lives === 3 && this.stats.maxCombo >= 8) {
      this.stats.rank = 'S+';
    } else if (this.stats.score >= 35000 || this.stats.maxCombo >= 5) {
      this.stats.rank = 'A';
    } else if (this.stats.score >= 18000) {
      this.stats.rank = 'B';
    } else {
      this.stats.rank = 'C';
    }

    // Persist High Score
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      try {
        localStorage.setItem('cyberbreak_highscore', this.stats.highScore.toString());
      } catch {}
    }
  }

  private syncStats() {
    if (this.onStatsChange) {
      this.onStatsChange({ ...this.stats });
    }
  }

  /* ==========================================================
     CANVAS 2D RENDERING PIPELINE
     ========================================================== */
  public render() {
    const ctx = this.ctx;
    ctx.save();

    // 1. Screen Shake
    if (this.screenShake > 0 && !this.settings.reducedMotion) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
      this.screenShake *= 0.86;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    // 2. Clear Arena with deep slate midnight
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, this.ARENA_WIDTH, this.ARENA_HEIGHT);

    // 3. Cyber Vector Floor Grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < this.ARENA_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.ARENA_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < this.ARENA_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.ARENA_WIDTH, y);
      ctx.stroke();
    }

    // 4. Render Bricks
    for (const row of this.bricks) {
      for (const b of row) {
        if (b.status === 1) {
          ctx.save();

          let fill = 'rgba(16, 185, 129, 0.22)';
          let stroke = '#10b981';
          let glow = 'rgba(16, 185, 129, 0.6)';

          if (b.tier === 1) {
            // Amber (2-Hit)
            fill = b.hits === 1 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.45)';
            stroke = '#f59e0b';
            glow = 'rgba(245, 158, 11, 0.7)';
          } else if (b.tier === 2) {
            // Magenta Armored
            fill = b.hits === 1 ? 'rgba(217, 70, 239, 0.25)' : (b.hits === 2 ? 'rgba(217, 70, 239, 0.45)' : 'rgba(217, 70, 239, 0.7)');
            stroke = '#d946ef';
            glow = 'rgba(217, 70, 239, 0.85)';
          } else if (b.tier === 3) {
            // Explosive Cluster
            fill = 'rgba(251, 191, 36, 0.4)';
            stroke = '#fbbf24';
            glow = 'rgba(251, 191, 36, 0.9)';
          }

          ctx.shadowColor = glow;
          ctx.shadowBlur = b.pulse > 0 ? 20 : 8;
          ctx.fillStyle = fill;
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 1.5;

          // Draw rounded brick
          ctx.beginPath();
          ctx.roundRect(b.x, b.y, b.width, b.height, 4);
          ctx.fill();
          ctx.stroke();

          // Top bevel highlight line
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(b.x + 3, b.y + 2.5);
          ctx.lineTo(b.x + b.width - 3, b.y + 2.5);
          ctx.stroke();

          // Armored plates / PowerUp badge inside brick
          if (b.tier === 2 && b.hits >= 2) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillRect(b.x + b.width / 2 - 8, b.y + b.height / 2 - 1.5, 16, 3);
          } else if (b.tier === 3) {
            // Explosive icon dot
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(b.x + b.width / 2, b.y + b.height / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (b.powerUpType) {
            // Power-up core glow inside brick
            ctx.fillStyle = '#06b6d4';
            ctx.beginPath();
            ctx.arc(b.x + b.width / 2, b.y + b.height / 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          if (b.pulse > 0) b.pulse--;
          ctx.restore();
        }
      }
    }

    // 5. Render Lasers
    for (const l of this.lasers) {
      ctx.save();
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.fillRect(l.x, l.y, l.width, l.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(l.x + 1, l.y + 2, l.width - 2, l.height - 4);
      ctx.restore();
    }

    // 6. Render Power-Up Drops (Floating glowing capsules)
    for (const p of this.powerUpDrops) {
      ctx.save();
      const colors: Record<PowerUpType, string> = {
        multi_ball: '#06b6d4',
        laser: '#f43f5e',
        wide_paddle: '#10b981',
        slow_mo: '#8b5cf6',
        magnetic: '#f59e0b',
        explosive: '#d946ef',
      };
      const color = colors[p.type] || '#06b6d4';

      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      // Draw capsule pill
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.width, p.height, 8);
      ctx.fill();
      ctx.stroke();

      // Inner glowing icon
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2, p.y + p.height / 2, 6, 0, Math.PI * 2);
      ctx.fill();

      // Letter indicator
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const letters: Record<PowerUpType, string> = {
        multi_ball: '3x',
        laser: 'LZ',
        wide_paddle: 'WD',
        slow_mo: 'SL',
        magnetic: 'MG',
        explosive: 'EX',
      };
      ctx.fillText(letters[p.type] || 'UP', p.x + p.width / 2, p.y + p.height / 2);

      ctx.restore();
    }

    // 7. Render Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      if (p.rotation !== undefined) {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();
    }

    // 8. Render Balls & Trails
    for (const ball of this.balls) {
      // Trail
      if (!this.settings.reducedMotion) {
        for (let i = 0; i < ball.trail.length; i++) {
          const pt = ball.trail[i];
          const tAlpha = (i / ball.trail.length) * 0.45;
          ctx.save();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, ball.radius * (0.6 + (i / ball.trail.length) * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = ball.isExplosive ? `rgba(217, 70, 239, ${tAlpha})` : `rgba(6, 182, 212, ${tAlpha})`;
          ctx.shadowColor = ball.isExplosive ? '#d946ef' : '#06b6d4';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
        }
      }

      // Main Ball
      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = ball.isExplosive ? '#d946ef' : '#06b6d4';
      ctx.shadowBlur = ball.isExplosive ? 22 : 16;
      ctx.fill();

      // Outer aura ring
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = ball.isExplosive ? 'rgba(217, 70, 239, 0.9)' : 'rgba(6, 182, 212, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Aim indicator if ball is caught magnetically
      if (this.paddle.caughtBall === ball) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x, ball.y - 45);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    // 9. Render Paddle (With 5 Segmented Zones Visual Indicator!)
    ctx.save();
    const pGlow = this.paddle.glowTimer > 0;
    ctx.shadowColor = pGlow ? '#ffffff' : '#06b6d4';
    ctx.shadowBlur = pGlow ? 22 : 12;

    // Paddle base frame
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, 6);
    ctx.fill();
    ctx.stroke();

    // 5-Zone Segmented LED Curvature Bars
    const zoneWidths = [
      this.paddle.width * 0.15, // Zone 1
      this.paddle.width * 0.25, // Zone 2
      this.paddle.width * 0.20, // Zone 3 (Center sweet spot)
      this.paddle.width * 0.25, // Zone 4
      this.paddle.width * 0.15, // Zone 5
    ];

    let currentOffset = this.paddle.x;
    for (let z = 0; z < 5; z++) {
      const zWidth = zoneWidths[z];
      const isActiveZone = (this.paddle.activeZone === z + 1) && pGlow;

      let zoneColor = 'rgba(6, 182, 212, 0.4)';
      if (z === 0 || z === 4) {
        // Outer extreme reflection cut (Magenta)
        zoneColor = isActiveZone ? '#ffffff' : (pGlow ? '#d946ef' : 'rgba(217, 70, 239, 0.55)');
      } else if (z === 2) {
        // Center punch (Cyan/White)
        zoneColor = isActiveZone ? '#ffffff' : 'rgba(6, 182, 212, 0.8)';
      } else {
        zoneColor = isActiveZone ? '#ffffff' : 'rgba(6, 182, 212, 0.5)';
      }

      ctx.fillStyle = zoneColor;
      ctx.fillRect(currentOffset + 2, this.paddle.y + 4, zWidth - 4, this.paddle.height - 8);
      currentOffset += zWidth;
    }

    // Laser Cannon Brackets if active
    if (this.paddle.hasLasers) {
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.fillRect(this.paddle.x - 4, this.paddle.y - 6, 8, 14);
      ctx.fillRect(this.paddle.x + this.paddle.width - 4, this.paddle.y - 6, 8, 14);
    }

    ctx.restore();

    // 10. Render Floating Texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 10;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }

  /* ==========================================================
     MAIN GAME LOOP
     ========================================================== */
  public start() {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min(32, time - this.lastTime);
      this.lastTime = time;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };

    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(loop);
    }
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public destroy() {
    this.stop();
  }
}
