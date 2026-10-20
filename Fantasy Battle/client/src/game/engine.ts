import type {
  ArenaGameState,
  CombatEntity,
  EnemyEntity,
  ArenaHazard,
  Projectile,
  Vector2D,
  TelemetryPoint,
  FighterClass,
  AIArchetype
} from '../types';
import { CLASS_CONFIGS } from './classes';
import { ParticleSystem } from './particles';
import { FloatingTextManager } from './floatingText';
import { soundManager } from './audio';
import { updateEnemyAI, AggressionTokenManager } from './ai';
import { ArenaRenderer, type RenderState } from './renderer';
import { createMulberry32 } from './prng';

export class ArenaEngine {
  public gameState: ArenaGameState;
  public projectiles: Projectile[] = [];
  public particles: ParticleSystem = new ParticleSystem();
  public floatingTexts: FloatingTextManager = new FloatingTextManager();
  public tokenManager: AggressionTokenManager = new AggressionTokenManager();
  public renderer: ArenaRenderer = new ArenaRenderer();

  public telemetry: TelemetryPoint[] = [];
  public matchStartTime = 0;
  public totalMatchDurationMs = 0;

  // Input states
  public moveInput: Vector2D = { x: 0, y: 0 };
  public cursorWorldPos: Vector2D = { x: 0, y: 0 };
  public isAimAssisting = false;

  // Settings
  public cameraShakeMultiplier = 1.0;

  // Visual juice state
  public renderState: RenderState = {
    cameraShake: 0,
    shakeOffset: { x: 0, y: 0 },
    parryFlashTimer: 0,
    postureBreakFlashTimer: 0,
  };

  // Fixed physics timestep
  private readonly fixedDt = 1 / 60;
  private accumulator = 0;
  private lastFrameTime = 0;
  private hitStopTimerMs = 0;

  // Event callbacks for React HUD
  public onStateChange?: (state: ArenaGameState) => void;
  public onVictory?: () => void;
  public onGameOver?: () => void;

  constructor(seed: string, fighterClass: FighterClass = 'WARRIOR') {
    const config = CLASS_CONFIGS[fighterClass];

    this.gameState = {
      status: 'LOBBY',
      seed,
      currentWave: 1,
      totalWaves: 5,
      countdownSeconds: 3,
      player: {
        id: 'player_gladiator',
        name: 'Gladiator',
        isPlayer: true,
        pos: { x: 0, y: 150 },
        velocity: { x: 0, y: 0 },
        rotationAngle: -Math.PI / 2,
        hp: config.maxHp,
        maxHp: config.maxHp,
        stamina: config.maxStamina,
        maxStamina: config.maxStamina,
        mana: config.maxMana,
        maxMana: config.maxMana,
        posture: 0,
        isStaggered: false,
        staggerTimerMs: 0,
        isInvulnerable: false,
        radius: 20,
        fighterClass,
        abilities: JSON.parse(JSON.stringify(config.abilities)),
        statusEffects: {}
      },
      enemies: [],
      hazards: [],
      activeTelegraphs: [],
      stats: {
        damageDealt: 0,
        damageTaken: 0,
        parriesSucceeded: 0,
        postureBreaksTriggered: 0,
        timeElapsedMs: 0,
        wavesCleared: 0
      }
    };
  }

  public setFighterClass(fClass: FighterClass) {
    const config = CLASS_CONFIGS[fClass];
    this.gameState.player.fighterClass = fClass;
    this.gameState.player.hp = config.maxHp;
    this.gameState.player.maxHp = config.maxHp;
    this.gameState.player.stamina = config.maxStamina;
    this.gameState.player.maxStamina = config.maxStamina;
    this.gameState.player.mana = config.maxMana;
    this.gameState.player.maxMana = config.maxMana;
    this.gameState.player.abilities = JSON.parse(JSON.stringify(config.abilities));
    this.notifyState();
  }

  public startBattle() {
    this.gameState.status = 'WAVE_COUNTDOWN';
    this.gameState.countdownSeconds = 3;
    this.matchStartTime = performance.now();
    this.telemetry = [];
    this.spawnWave(this.gameState.currentWave);
    this.notifyState();

    // Start countdown
    const interval = window.setInterval(() => {
      if (this.gameState.status !== 'WAVE_COUNTDOWN') {
        clearInterval(interval);
        return;
      }
      this.gameState.countdownSeconds--;
      if (this.gameState.countdownSeconds <= 0) {
        clearInterval(interval);
        this.gameState.status = 'BATTLE_ACTIVE';
        this.notifyState();
      } else {
        this.notifyState();
      }
    }, 1000);
  }

  public spawnWave(waveNum: number) {
    this.gameState.enemies = [];
    this.gameState.hazards = [];
    this.tokenManager.reset();

    const rng = createMulberry32(`${this.gameState.seed}-WAVE-${waveNum}`);

    // Setup hazards based on wave
    if (waveNum >= 2) {
      this.gameState.hazards.push({
        id: 'hazard_lava_1',
        type: 'LAVA_GRATE',
        pos: { x: -220, y: -220 },
        radius: 48,
        isActive: false,
        periodMs: 3800,
        elapsedMs: 0
      });
    }
    if (waveNum >= 3) {
      this.gameState.hazards.push({
        id: 'hazard_blade_1',
        type: 'PENDULUM_BLADE',
        pos: { x: 0, y: 0 },
        radius: 35,
        isActive: true,
        periodMs: 3000,
        elapsedMs: 1200
      });
    }
    if (waveNum >= 4) {
      this.gameState.hazards.push({
        id: 'hazard_lava_2',
        type: 'LAVA_GRATE',
        pos: { x: 220, y: 220 },
        radius: 48,
        isActive: false,
        periodMs: 3800,
        elapsedMs: 1900
      });
    }

    // Spawn Enemies
    const spawnEnemy = (archetype: AIArchetype, hpMult = 1.0) => {
      const angle = rng() * Math.PI * 2;
      const dist = 240 + rng() * 180;
      const ex = Math.cos(angle) * dist;
      const ey = Math.sin(angle) * dist;

      let maxHp = 140;
      let radius = 18;
      let name = 'Colosseum Minion';

      if (archetype === 'ARCHER') {
        maxHp = 110;
        radius = 16;
        name = 'Bone Archer';
      } else if (archetype === 'ARENA_BRUTE') {
        maxHp = 380;
        radius = 28;
        name = 'Arena Brute';
      } else if (archetype === 'BOSS_WARLORD') {
        maxHp = 950;
        radius = 42;
        name = 'Valerius, The Hollow Champion';
      }

      maxHp = Math.round(maxHp * hpMult);

      const enemy: EnemyEntity = {
        id: `enemy_${Math.random().toString(36).slice(2, 7)}`,
        name,
        isPlayer: false,
        archetype,
        pos: { x: ex, y: ey },
        velocity: { x: 0, y: 0 },
        rotationAngle: Math.PI,
        hp: maxHp,
        maxHp,
        stamina: 100,
        maxStamina: 100,
        posture: 0,
        isStaggered: false,
        staggerTimerMs: 0,
        isInvulnerable: false,
        radius,
        aiState: 'IDLE_STALK',
        activeTelegraph: null,
        targetPos: { x: 0, y: 0 },
        attackCooldownMs: 1000 + rng() * 1500,
        stateTimerMs: 0,
        orbitAngle: rng() * Math.PI * 2,
        orbitRadius: 160 + rng() * 80,
        orbitDirection: rng() > 0.5 ? 1 : -1,
        hasAggressionToken: false,
        phase: archetype === 'BOSS_WARLORD' ? 1 : undefined,
        maxPhase: archetype === 'BOSS_WARLORD' ? 3 : undefined
      };

      this.gameState.enemies.push(enemy);
    };

    if (waveNum === 1) {
      spawnEnemy('MINION_MELEE');
      spawnEnemy('MINION_MELEE');
      spawnEnemy('MINION_MELEE');
    } else if (waveNum === 2) {
      spawnEnemy('MINION_MELEE');
      spawnEnemy('MINION_MELEE');
      spawnEnemy('ARCHER');
      spawnEnemy('ARCHER');
    } else if (waveNum === 3) {
      spawnEnemy('ARENA_BRUTE', 1.1);
      spawnEnemy('MINION_MELEE');
      spawnEnemy('ARCHER');
    } else if (waveNum === 4) {
      spawnEnemy('ARENA_BRUTE', 1.2);
      spawnEnemy('ARENA_BRUTE', 1.2);
      spawnEnemy('ARCHER');
      spawnEnemy('MINION_MELEE');
    } else if (waveNum === 5) {
      spawnEnemy('BOSS_WARLORD', 1.5);
      spawnEnemy('ARENA_BRUTE', 1.0);
    }
  }

  // Combat Abilities Trigger
  public executePlayerAbility(abilityId: string) {
    if (this.gameState.status !== 'BATTLE_ACTIVE') return;

    const player = this.gameState.player;
    const ability = player.abilities.find(a => a.id === abilityId);
    if (!ability) return;

    const now = performance.now();
    if (now - ability.lastUsedTimestamp < ability.cooldownMs) {
      return; // Still on cooldown
    }

    if (player.stamina < ability.staminaCost || player.mana < ability.manaCost) {
      this.floatingTexts.spawn(player.pos, 'NOT ENOUGH ENERGY!', '#94A3B8');
      return;
    }

    // Deduct resource
    player.stamina -= ability.staminaCost;
    player.mana -= ability.manaCost;
    ability.lastUsedTimestamp = now;

    // Record Telemetry
    this.recordTelemetry(abilityId as any);

    switch (abilityId) {
      case 'SLASH': {
        soundManager.playSlash();
        this.performPlayerSlash();
        break;
      }
      case 'PARRY': {
        // Activate 150ms Parry window
        soundManager.playDash();
        this.floatingTexts.spawn(player.pos, 'GUARD PRIMED', '#06B6D4');
        break;
      }
      case 'DASH': {
        soundManager.playDash();
        player.isInvulnerable = true;
        const dashSpeed = 680;
        const moveLen = Math.sqrt(this.moveInput.x * this.moveInput.x + this.moveInput.y * this.moveInput.y);
        const dashDir = moveLen > 0.1
          ? { x: this.moveInput.x / moveLen, y: this.moveInput.y / moveLen }
          : { x: Math.cos(player.rotationAngle), y: Math.sin(player.rotationAngle) };

        player.velocity = { x: dashDir.x * dashSpeed, y: dashDir.y * dashSpeed };

        this.particles.spawnShockwave(player.pos, '#10B981', 12, 0.25);

        // Invulnerability ends after 300ms
        window.setTimeout(() => {
          player.isInvulnerable = false;
        }, 300);
        break;
      }
      case 'FROST_NOVA': {
        soundManager.playFrostNova();
        this.particles.spawnShockwave(player.pos, '#38BDF8', 25, 0.4);
        this.particles.spawnFrostFlakes(player.pos, 28);
        this.triggerScreenShake(0.3);

        // Freeze all enemies within 260px
        for (const enemy of this.gameState.enemies) {
          const edx = enemy.pos.x - player.pos.x;
          const edy = enemy.pos.y - player.pos.y;
          const edist = Math.sqrt(edx * edx + edy * edy);
          if (edist <= 260) {
            enemy.statusEffects = enemy.statusEffects || {};
            enemy.statusEffects.frozenMs = 2800;
            this.damageEnemy(enemy, 55, false, 'FROST');
            this.floatingTexts.spawn(enemy.pos, 'FROZEN!', '#38BDF8');
          }
        }
        break;
      }
      case 'FLAME_SWEEP': {
        soundManager.playFlameSweep();
        this.triggerScreenShake(0.35);

        const sweepRadius = 160;
        const halfCone = Math.PI * 0.35; // ~125 degrees

        this.particles.spawnShockwave(player.pos, '#F97316', 20, 0.35);
        this.particles.spawnFireEmbers(player.pos, 24);

        for (const enemy of this.gameState.enemies) {
          const edx = enemy.pos.x - player.pos.x;
          const edy = enemy.pos.y - player.pos.y;
          const edist = Math.sqrt(edx * edx + edy * edy);
          if (edist <= sweepRadius) {
            const angleToEnemy = Math.atan2(edy, edx);
            let diff = angleToEnemy - player.rotationAngle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;

            if (Math.abs(diff) <= halfCone) {
              const isTargetFrozen = enemy.statusEffects?.frozenMs && enemy.statusEffects.frozenMs > 0;
              if (isTargetFrozen) {
                // ELEMENTAL SYNERGY: STEAM SHATTER!
                enemy.statusEffects!.frozenMs = 0;
                this.damageEnemy(enemy, 220, true, 'STEAM SHATTER!');
                this.particles.spawnSparks(enemy.pos, 30, '#FEF08A');
                this.particles.spawnShockwave(enemy.pos, '#F59E0B', 20, 0.4);
                this.triggerPostureDamage(enemy, 45);
              } else {
                this.damageEnemy(enemy, 90, false, 'BURN');
                this.triggerPostureDamage(enemy, 20);
              }
            }
          }
        }
        break;
      }
      case 'OVERDRIVE': {
        soundManager.playOverdrive();
        this.triggerScreenShake(0.5);
        this.particles.spawnShockwave(player.pos, '#A855F7', 30, 0.5);
        this.particles.spawnSparks(player.pos, 35, '#E879F9');
        player.statusEffects = player.statusEffects || {};
        player.statusEffects.overdriveMs = 6000;
        this.floatingTexts.spawn(player.pos, 'OVERDRIVE ACTIVATED!', '#E879F9', true);
        break;
      }
    }
  }

  private performPlayerSlash() {
    const player = this.gameState.player;
    const slashRange = 110;
    const isOverdrive = player.statusEffects?.overdriveMs && player.statusEffects.overdriveMs > 0;

    let baseDamage = player.fighterClass === 'WARRIOR' ? 75 : player.fighterClass === 'ROGUE' ? 60 : 55;
    if (isOverdrive) baseDamage *= 2.0;

    let hitAny = false;

    for (const enemy of this.gameState.enemies) {
      const edx = enemy.pos.x - player.pos.x;
      const edy = enemy.pos.y - player.pos.y;
      const edist = Math.sqrt(edx * edx + edy * edy);

      if (edist <= slashRange + enemy.radius) {
        const angleToEnemy = Math.atan2(edy, edx);
        let diff = angleToEnemy - player.rotationAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        if (Math.abs(diff) <= Math.PI * 0.45) { // 160 deg arc
          hitAny = true;
          const isCrit = enemy.isStaggered;
          let finalDmg = isCrit
            ? (player.fighterClass === 'ROGUE' ? baseDamage * 2.5 : baseDamage * 2.0)
            : baseDamage;

          this.damageEnemy(enemy, Math.round(finalDmg), isCrit);
          this.triggerPostureDamage(enemy, isOverdrive ? 30 : 18);

          // Particles & Juice
          this.particles.spawnBlood(enemy.pos, 14, angleToEnemy);
          this.particles.spawnSparks(enemy.pos, 10, '#F59E0B');

          if (isCrit) {
            this.applyHitStop(60);
            this.triggerScreenShake(0.4);
            soundManager.playHitImpact(true);
          } else {
            soundManager.playHitImpact(false);
          }
        }
      }
    }

    if (!hitAny) {
      this.particles.spawnShockwave(
        {
          x: player.pos.x + Math.cos(player.rotationAngle) * 35,
          y: player.pos.y + Math.sin(player.rotationAngle) * 35
        },
        '#64748B',
        8,
        0.18
      );
    }
  }

  public triggerPostureDamage(enemy: EnemyEntity, amount: number) {
    if (enemy.isStaggered) return;

    enemy.posture = Math.min(100, enemy.posture + amount);

    if (enemy.posture >= 100) {
      // POSTURE BREAK TRIGGERED!
      enemy.isStaggered = true;
      enemy.staggerTimerMs = 3500;
      enemy.aiState = 'STAGGERED';
      enemy.activeTelegraph = null;
      this.tokenManager.releaseToken(enemy.id);

      this.gameState.stats.postureBreaksTriggered++;
      this.renderState.postureBreakFlashTimer = 300;
      this.triggerScreenShake(0.65);
      this.applyHitStop(70);

      soundManager.playPostureBreak();
      this.floatingTexts.spawn(enemy.pos, 'POSTURE BREAK!', '#F59E0B', true, 1.3);
      this.particles.spawnShockwave(enemy.pos, '#F59E0B', 30, 0.4);
      this.particles.spawnSparks(enemy.pos, 25, '#F59E0B');

      this.recordTelemetry('POSTURE_BREAK');
    }
  }

  private damageEnemy(enemy: EnemyEntity, damage: number, isCrit = false, label?: string) {
    enemy.hp = Math.max(0, enemy.hp - damage);
    this.gameState.stats.damageDealt += damage;

    const text = label ? `${label} -${damage}` : isCrit ? `CRIT -${damage}!` : `-${damage}`;
    this.floatingTexts.spawn(enemy.pos, text, isCrit ? '#F59E0B' : '#EF4444', isCrit);

    this.recordTelemetry('DAMAGE_DEALT', { damageDealt: damage, targetId: enemy.id });

    if (enemy.hp <= 0) {
      this.handleEnemyDeath(enemy);
    }
  }

  private handleEnemyDeath(enemy: EnemyEntity) {
    this.tokenManager.releaseToken(enemy.id);
    this.particles.spawnBlood(enemy.pos, 25);
    this.particles.spawnSparks(enemy.pos, 20, '#EF4444');
    this.triggerScreenShake(0.3);

    // Remove enemy
    const idx = this.gameState.enemies.indexOf(enemy);
    if (idx !== -1) {
      this.gameState.enemies.splice(idx, 1);
    }

    // Check if wave cleared
    if (this.gameState.enemies.length === 0) {
      this.handleWaveClear();
    }
  }

  private handleWaveClear() {
    this.gameState.stats.wavesCleared = this.gameState.currentWave;

    if (this.gameState.currentWave >= this.gameState.totalWaves) {
      // VICTORY!
      this.gameState.status = 'VICTORY';
      this.totalMatchDurationMs = performance.now() - this.matchStartTime;
      soundManager.playOverdrive();
      this.notifyState();
      if (this.onVictory) this.onVictory();
    } else {
      // Proceed to next wave
      this.gameState.status = 'WAVE_CLEARED';
      this.notifyState();

      window.setTimeout(() => {
        if (this.gameState.status === 'WAVE_CLEARED') {
          this.gameState.currentWave++;
          this.startBattle();
        }
      }, 2000);
    }
  }

  private damagePlayer(damage: number, sourceName: string) {
    const player = this.gameState.player;
    if (player.isInvulnerable) return;

    // Check 150ms PARRY window!
    const parryAbility = player.abilities.find(a => a.id === 'PARRY');
    const isParrying = parryAbility && (performance.now() - parryAbility.lastUsedTimestamp < 150);

    if (isParrying) {
      // DEFLECTED & PERFECT PARRY!
      soundManager.playParry();
      this.gameState.stats.parriesSucceeded++;
      this.renderState.parryFlashTimer = 260;
      this.applyHitStop(60);
      this.triggerScreenShake(0.45);

      this.floatingTexts.spawn(player.pos, 'PERFECT PARRY!', '#06B6D4', true, 1.0);
      this.particles.spawnSparks(player.pos, 24, '#06B6D4');
      this.particles.spawnShockwave(player.pos, '#06B6D4', 18, 0.3);

      // Warrior passive: restores stamina
      if (player.fighterClass === 'WARRIOR') {
        player.stamina = Math.min(player.maxStamina, player.stamina + 25);
        this.floatingTexts.spawn(player.pos, '+25 STAMINA', '#10B981');
      }

      // Inflict 35 Posture Damage to attacking enemy!
      const nearestEnemy = this.getNearestEnemy(player.pos);
      if (nearestEnemy) {
        this.triggerPostureDamage(nearestEnemy, player.fighterClass === 'WARRIOR' ? 45 : 35);
      }

      this.recordTelemetry('PARRY');
      return;
    }

    // Normal damage taken
    player.hp = Math.max(0, player.hp - damage);
    this.gameState.stats.damageTaken += damage;
    this.floatingTexts.spawn(player.pos, `-${damage}`, '#EF4444', true);
    this.particles.spawnBlood(player.pos, 15);
    this.triggerScreenShake(0.4);
    soundManager.playHitImpact(true);

    this.recordTelemetry('DAMAGE_TAKEN', { damageTaken: damage });

    // Update low health heartbeat audio
    const isLowHp = (player.hp / player.maxHp) < 0.25;
    soundManager.updateHeartbeat(isLowHp);

    if (player.hp <= 0) {
      this.gameState.status = 'GAME_OVER';
      soundManager.updateHeartbeat(false);
      this.totalMatchDurationMs = performance.now() - this.matchStartTime;
      this.notifyState();
      if (this.onGameOver) this.onGameOver();
    }
  }

  private getNearestEnemy(pos: Vector2D): EnemyEntity | null {
    let nearest: EnemyEntity | null = null;
    let minDist = Infinity;
    for (const e of this.gameState.enemies) {
      const dx = e.pos.x - pos.x;
      const dy = e.pos.y - pos.y;
      const d = dx * dx + dy * dy;
      if (d < minDist) {
        minDist = d;
        nearest = e;
      }
    }
    return nearest;
  }

  // Master Fixed-Timestep Loop
  public tick(timestamp: number) {
    if (!this.lastFrameTime) {
      this.lastFrameTime = timestamp;
      return;
    }

    let elapsed = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    if (elapsed > 0.1) elapsed = 0.1; // clamp delta to prevent spiral of death

    // Handle Hit-Stop Freeze Frame
    if (this.hitStopTimerMs > 0) {
      this.hitStopTimerMs -= elapsed * 1000;
      return;
    }

    this.accumulator += elapsed;

    while (this.accumulator >= this.fixedDt) {
      this.physicsUpdate(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    // Update screen shake & flash decays
    this.updateJuice(elapsed);
  }

  private physicsUpdate(dt: number) {
    if (this.gameState.status !== 'BATTLE_ACTIVE') return;

    this.gameState.stats.timeElapsedMs += dt * 1000;

    const player = this.gameState.player;
    const config = CLASS_CONFIGS[player.fighterClass];

    // Player regeneration
    player.stamina = Math.min(player.maxStamina, player.stamina + 24 * dt);
    player.mana = Math.min(player.maxMana, player.mana + 15 * dt);

    // Overdrive decay
    if (player.statusEffects?.overdriveMs && player.statusEffects.overdriveMs > 0) {
      player.statusEffects.overdriveMs -= dt * 1000;
    }

    // Auto-aim assistance if enabled
    if (this.isAimAssisting) {
      const nearest = this.getNearestEnemy(player.pos);
      if (nearest) {
        const dx = nearest.pos.x - player.pos.x;
        const dy = nearest.pos.y - player.pos.y;
        player.rotationAngle = Math.atan2(dy, dx);
      }
    } else {
      // Aim at mouse cursor
      const dx = this.cursorWorldPos.x - player.pos.x;
      const dy = this.cursorWorldPos.y - player.pos.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        player.rotationAngle = Math.atan2(dy, dx);
      }
    }

    // Kinematic player acceleration & damping
    const moveLen = Math.sqrt(this.moveInput.x * this.moveInput.x + this.moveInput.y * this.moveInput.y);
    const speed = config.baseSpeed;

    if (moveLen > 0.05) {
      const targetVx = (this.moveInput.x / moveLen) * speed;
      const targetVy = (this.moveInput.y / moveLen) * speed;
      player.velocity.x += (targetVx - player.velocity.x) * 12 * dt;
      player.velocity.y += (targetVy - player.velocity.y) * 12 * dt;
    } else {
      player.velocity.x *= Math.pow(0.05, dt);
      player.velocity.y *= Math.pow(0.05, dt);
    }

    player.pos.x += player.velocity.x * dt;
    player.pos.y += player.velocity.y * dt;

    // Arena Boundary Clamp
    const arenaRadius = 490;
    const pdist = Math.sqrt(player.pos.x * player.pos.x + player.pos.y * player.pos.y);
    if (pdist > arenaRadius) {
      player.pos.x = (player.pos.x / pdist) * arenaRadius;
      player.pos.y = (player.pos.y / pdist) * arenaRadius;
    }

    // Periodic Movement Telemetry sampling (~4 times per second)
    if (Math.random() < 0.06) {
      this.recordTelemetry('MOVE');
    }

    // Update Enemies AI & state machines
    for (const enemy of this.gameState.enemies) {
      updateEnemyAI(
        enemy,
        player,
        this.gameState.enemies,
        this.gameState.hazards,
        this.tokenManager,
        dt,
        (proj) => this.projectiles.push(proj)
      );

      // Check Active Strike damage frames on Player
      if (enemy.aiState === 'ATTACKING') {
        const edx = player.pos.x - enemy.pos.x;
        const edy = player.pos.y - enemy.pos.y;
        const dist = Math.sqrt(edx * edx + edy * edy);

        if (dist <= enemy.radius + player.radius + 30) {
          const dmg = enemy.archetype === 'BOSS_WARLORD' ? 48 : enemy.archetype === 'ARENA_BRUTE' ? 42 : 24;
          this.damagePlayer(dmg, enemy.name);
        }
      }
    }

    // Update Hazards
    for (const h of this.gameState.hazards) {
      h.elapsedMs += dt * 1000;
      if (h.type === 'LAVA_GRATE') {
        const cycle = (h.elapsedMs % h.periodMs) / h.periodMs;
        h.isActive = cycle > 0.6;
        if (h.isActive) {
          const pdx = player.pos.x - h.pos.x;
          const pdy = player.pos.y - h.pos.y;
          if (pdx * pdx + pdy * pdy <= h.radius * h.radius) {
            this.damagePlayer(15 * dt * 2, 'Lava Grate');
          }
        }
      } else if (h.type === 'PENDULUM_BLADE') {
        const cycle = (h.elapsedMs % h.periodMs) / h.periodMs;
        const swingAngle = Math.sin(cycle * Math.PI * 2) * (Math.PI * 0.45);
        const bx = h.pos.x + Math.sin(swingAngle) * 110;
        const by = h.pos.y + Math.cos(swingAngle) * 110;
        const pdx = player.pos.x - bx;
        const pdy = player.pos.y - by;
        if (pdx * pdx + pdy * pdy <= (h.radius + player.radius) ** 2) {
          this.damagePlayer(35 * dt * 3, 'Pendulum Blade');
        }
      }
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.lifeMs += dt * 1000;
      p.pos.x += p.velocity.x * dt;
      p.pos.y += p.velocity.y * dt;

      if (p.lifeMs >= p.maxLifeMs) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (!p.isPlayer) {
        // Enemy projectile hits player
        const dx = player.pos.x - p.pos.x;
        const dy = player.pos.y - p.pos.y;
        if (dx * dx + dy * dy <= (player.radius + p.radius) ** 2) {
          this.damagePlayer(p.damage, 'Piercing Arrow');
          this.projectiles.splice(i, 1);
        }
      }
    }

    // Update particles & floating texts
    this.particles.update(dt);
    this.floatingTexts.update(dt);
  }

  private updateJuice(elapsed: number) {
    // Screen shake decay
    if (this.renderState.cameraShake > 0) {
      this.renderState.cameraShake = Math.max(0, this.renderState.cameraShake - elapsed * 3.5);
      const intensity = this.renderState.cameraShake * 12 * this.cameraShakeMultiplier;
      this.renderState.shakeOffset = {
        x: (Math.random() - 0.5) * intensity,
        y: (Math.random() - 0.5) * intensity
      };
    } else {
      this.renderState.shakeOffset = { x: 0, y: 0 };
    }

    // Parry flash timer decay
    if (this.renderState.parryFlashTimer > 0) {
      this.renderState.parryFlashTimer = Math.max(0, this.renderState.parryFlashTimer - elapsed * 1000);
    }

    // Posture break flash timer decay
    if (this.renderState.postureBreakFlashTimer > 0) {
      this.renderState.postureBreakFlashTimer = Math.max(0, this.renderState.postureBreakFlashTimer - elapsed * 1000);
    }
  }

  public triggerScreenShake(magnitude = 0.5) {
    this.renderState.cameraShake = Math.min(1.0, this.renderState.cameraShake + magnitude);
  }

  public applyHitStop(durationMs = 50) {
    this.hitStopTimerMs = durationMs;
  }

  private recordTelemetry(action: TelemetryPoint['action'], extra?: { damageDealt?: number; damageTaken?: number; targetId?: string }) {
    const timeMs = Math.round(performance.now() - this.matchStartTime);
    this.telemetry.push({
      timeMs,
      action,
      x: Math.round(this.gameState.player.pos.x),
      y: Math.round(this.gameState.player.pos.y),
      ...extra
    });
  }

  public notifyState() {
    if (this.onStateChange) {
      this.onStateChange({ ...this.gameState });
    }
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.renderer.render(
      ctx,
      width,
      height,
      this.gameState.player,
      this.gameState.enemies,
      this.gameState.hazards,
      this.projectiles,
      this.particles,
      this.floatingTexts,
      this.renderState,
      this.cursorWorldPos
    );
  }
}
