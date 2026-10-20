import type { EnemyEntity, CombatEntity, TelegraphZone, Vector2D, ArenaHazard } from '../types';
import { soundManager } from './audio';

export class AggressionTokenManager {
  private maxConcurrentHeavyAttacks: number = 2;
  private tokenHolders: Set<string> = new Set();

  public requestToken(enemyId: string): boolean {
    if (this.tokenHolders.has(enemyId)) return true;
    if (this.tokenHolders.size < this.maxConcurrentHeavyAttacks) {
      this.tokenHolders.add(enemyId);
      return true;
    }
    return false;
  }

  public releaseToken(enemyId: string) {
    this.tokenHolders.delete(enemyId);
  }

  public reset() {
    this.tokenHolders.clear();
  }
}

export function updateEnemyAI(
  enemy: EnemyEntity,
  player: CombatEntity,
  allEnemies: EnemyEntity[],
  hazards: ArenaHazard[],
  tokenManager: AggressionTokenManager,
  dt: number,
  onSpawnProjectile?: (proj: any) => void
) {
  // If enemy is frozen or staggered
  if (enemy.statusEffects?.frozenMs && enemy.statusEffects.frozenMs > 0) {
    enemy.statusEffects.frozenMs -= dt * 1000;
    enemy.velocity = { x: 0, y: 0 };
    return;
  }

  if (enemy.isStaggered) {
    enemy.staggerTimerMs -= dt * 1000;
    enemy.velocity = { x: enemy.velocity.x * 0.85, y: enemy.velocity.y * 0.85 };
    if (enemy.staggerTimerMs <= 0) {
      enemy.isStaggered = false;
      enemy.posture = 0;
      enemy.aiState = 'RECOVERY';
      enemy.stateTimerMs = 500;
      tokenManager.releaseToken(enemy.id);
    }
    return;
  }

  // Calculate distance and direction to player
  const dx = player.pos.x - enemy.pos.x;
  const dy = player.pos.y - enemy.pos.y;
  const distToPlayer = Math.sqrt(dx * dx + dy * dy);
  const angleToPlayer = Math.atan2(dy, dx);
  enemy.rotationAngle = angleToPlayer;

  // Decrease attack cooldown
  if (enemy.attackCooldownMs > 0) {
    enemy.attackCooldownMs -= dt * 1000;
  }

  // Check boss phase transition
  if (enemy.archetype === 'BOSS_WARLORD') {
    const hpPct = enemy.hp / enemy.maxHp;
    if (hpPct <= 0.33 && enemy.phase !== 3) {
      enemy.phase = 3;
      enemy.aiState = 'ENRAGED';
      enemy.stateTimerMs = 1200;
      soundManager.playTelegraphWarning();
    } else if (hpPct <= 0.66 && (enemy.phase ?? 1) < 2) {
      enemy.phase = 2;
    }
  }

  // Hazard avoidance steering vector
  let hazardSteerX = 0;
  let hazardSteerY = 0;
  for (const h of hazards) {
    if (h.isActive) {
      const hdx = enemy.pos.x - h.pos.x;
      const hdy = enemy.pos.y - h.pos.y;
      const hdist = Math.sqrt(hdx * hdx + hdy * hdy);
      const safeDist = h.radius + enemy.radius + 30;
      if (hdist < safeDist && hdist > 0) {
        const force = (safeDist - hdist) / safeDist;
        hazardSteerX += (hdx / hdist) * force * 150;
        hazardSteerY += (hdy / hdist) * force * 150;
      }
    }
  }

  // Separation steering among enemies
  let sepX = 0;
  let sepY = 0;
  for (const other of allEnemies) {
    if (other.id !== enemy.id) {
      const odx = enemy.pos.x - other.pos.x;
      const ody = enemy.pos.y - other.pos.y;
      const odist = Math.sqrt(odx * odx + ody * ody);
      const minSep = enemy.radius + other.radius + 15;
      if (odist < minSep && odist > 0) {
        sepX += (odx / odist) * (minSep - odist) * 3;
        sepY += (ody / odist) * (minSep - odist) * 3;
      }
    }
  }

  // State Machine execution
  switch (enemy.aiState) {
    case 'IDLE_STALK': {
      // Approach orbit range or re-evaluate
      const desiredRange = getIdealRange(enemy.archetype);
      if (distToPlayer > desiredRange + 40) {
        const speed = getBaseSpeed(enemy.archetype);
        enemy.velocity = {
          x: Math.cos(angleToPlayer) * speed + hazardSteerX + sepX,
          y: Math.sin(angleToPlayer) * speed + hazardSteerY + sepY,
        };
      } else {
        enemy.aiState = 'ORBIT';
        enemy.stateTimerMs = 1500 + Math.random() * 2000;
        enemy.orbitDirection = Math.random() > 0.5 ? 1 : -1;
      }

      // Check if can initiate attack
      if (enemy.attackCooldownMs <= 0 && distToPlayer <= desiredRange + 60) {
        if (tokenManager.requestToken(enemy.id)) {
          startAttackWindup(enemy, player, angleToPlayer);
        }
      }
      break;
    }

    case 'ORBIT': {
      enemy.stateTimerMs -= dt * 1000;
      enemy.orbitAngle += (dt * 1.5 * enemy.orbitDirection);

      const desiredRange = getIdealRange(enemy.archetype);
      // Tangential orbital velocity + radial correction to stay at orbit radius
      const tangentAngle = angleToPlayer + (Math.PI / 2) * enemy.orbitDirection;
      const speed = getBaseSpeed(enemy.archetype) * 0.85;

      const radialPush = (distToPlayer - desiredRange) * 0.8;
      const vx = Math.cos(tangentAngle) * speed + Math.cos(angleToPlayer) * radialPush;
      const vy = Math.sin(tangentAngle) * speed + Math.sin(angleToPlayer) * radialPush;

      enemy.velocity = {
        x: vx + hazardSteerX + sepX,
        y: vy + hazardSteerY + sepY,
      };

      if (enemy.attackCooldownMs <= 0 && enemy.stateTimerMs <= 0) {
        if (tokenManager.requestToken(enemy.id)) {
          startAttackWindup(enemy, player, angleToPlayer);
        } else {
          // Keep orbiting or stalk
          enemy.stateTimerMs = 1200 + Math.random() * 1500;
        }
      }
      break;
    }

    case 'WINDUP': {
      // Anchored or creeping during windup telegraph
      enemy.velocity = {
        x: enemy.velocity.x * 0.85 + hazardSteerX * 0.2,
        y: enemy.velocity.y * 0.85 + hazardSteerY * 0.2,
      };

      if (enemy.activeTelegraph) {
        enemy.activeTelegraph.elapsedMs += dt * 1000;
        // Keep origin pinned to enemy position for directional telegraphs
        enemy.activeTelegraph.origin = { ...enemy.pos };
        if (enemy.activeTelegraph.type === 'CONE' || enemy.activeTelegraph.type === 'LINE_CHARGING') {
          // Gradually rotate telegraph towards player
          enemy.activeTelegraph.angleRad = angleToPlayer;
        }

        if (enemy.activeTelegraph.elapsedMs >= enemy.activeTelegraph.durationMs) {
          // Transition to ACTIVE_STRIKE!
          enemy.aiState = 'ATTACKING';
          enemy.stateTimerMs = 280; // active strike frame duration
          executeStrike(enemy, player, onSpawnProjectile);
        }
      }
      break;
    }

    case 'ATTACKING': {
      enemy.stateTimerMs -= dt * 1000;
      // Lunge forward slightly during attack
      if (enemy.stateTimerMs > 0) {
        const lungeSpeed = getBaseSpeed(enemy.archetype) * 1.6;
        enemy.velocity = {
          x: Math.cos(enemy.rotationAngle) * lungeSpeed,
          y: Math.sin(enemy.rotationAngle) * lungeSpeed,
        };
      } else {
        enemy.aiState = 'RECOVERY';
        enemy.stateTimerMs = getRecoveryTime(enemy.archetype);
        enemy.activeTelegraph = null;
        tokenManager.releaseToken(enemy.id);
      }
      break;
    }

    case 'RECOVERY': {
      enemy.stateTimerMs -= dt * 1000;
      // Back off slightly or recover stance
      const speed = getBaseSpeed(enemy.archetype) * 0.4;
      enemy.velocity = {
        x: -Math.cos(angleToPlayer) * speed + hazardSteerX + sepX,
        y: -Math.sin(angleToPlayer) * speed + hazardSteerY + sepY,
      };

      if (enemy.stateTimerMs <= 0) {
        enemy.aiState = 'ORBIT';
        enemy.stateTimerMs = 1200 + Math.random() * 1500;
        enemy.attackCooldownMs = getCooldown(enemy.archetype);
      }
      break;
    }

    case 'ENRAGED': {
      enemy.stateTimerMs -= dt * 1000;
      // Boss roar shockwave then aggressive relentless charge
      enemy.velocity = { x: 0, y: 0 };
      if (enemy.stateTimerMs <= 0) {
        enemy.aiState = 'IDLE_STALK';
        enemy.attackCooldownMs = 200;
      }
      break;
    }
  }

  // Update physical position based on velocity
  enemy.pos.x += enemy.velocity.x * dt;
  enemy.pos.y += enemy.velocity.y * dt;

  // Clamp within arena radius
  const maxRadius = 490;
  const currentDist = Math.sqrt(enemy.pos.x * enemy.pos.x + enemy.pos.y * enemy.pos.y);
  if (currentDist > maxRadius) {
    enemy.pos.x = (enemy.pos.x / currentDist) * maxRadius;
    enemy.pos.y = (enemy.pos.y / currentDist) * maxRadius;
  }
}

function getIdealRange(archetype: string): number {
  switch (archetype) {
    case 'ARCHER': return 310;
    case 'ARENA_BRUTE': return 120;
    case 'BOSS_WARLORD': return 130;
    case 'MINION_MELEE':
    default: return 95;
  }
}

function getBaseSpeed(archetype: string): number {
  switch (archetype) {
    case 'MINION_MELEE': return 165;
    case 'ARCHER': return 145;
    case 'ARENA_BRUTE': return 110;
    case 'BOSS_WARLORD': return 135;
    default: return 140;
  }
}

function getRecoveryTime(archetype: string): number {
  switch (archetype) {
    case 'ARENA_BRUTE': return 900;
    case 'BOSS_WARLORD': return 600;
    case 'ARCHER': return 700;
    default: return 500;
  }
}

function getCooldown(archetype: string): number {
  switch (archetype) {
    case 'ARENA_BRUTE': return 2200;
    case 'BOSS_WARLORD': return 1400;
    case 'ARCHER': return 2600;
    default: return 1800;
  }
}

function startAttackWindup(enemy: EnemyEntity, player: CombatEntity, angleToPlayer: number) {
  enemy.aiState = 'WINDUP';
  soundManager.playTelegraphWarning();

  switch (enemy.archetype) {
    case 'MINION_MELEE': {
      // 90-degree Cone Sweep
      enemy.activeTelegraph = {
        id: `telegraph_${Math.random().toString(36).slice(2, 7)}`,
        type: 'CONE',
        origin: { ...enemy.pos },
        radius: 95,
        angleRad: angleToPlayer,
        coneAngleDeg: 90,
        durationMs: 700,
        elapsedMs: 0
      };
      break;
    }
    case 'ARCHER': {
      // Linear Charging Arrow corridor
      enemy.activeTelegraph = {
        id: `telegraph_${Math.random().toString(36).slice(2, 7)}`,
        type: 'LINE_CHARGING',
        origin: { ...enemy.pos },
        radius: 380, // length
        angleRad: angleToPlayer,
        durationMs: 1000,
        elapsedMs: 0
      };
      break;
    }
    case 'ARENA_BRUTE': {
      // Expanding Red Circle Ground Slam
      enemy.activeTelegraph = {
        id: `telegraph_${Math.random().toString(36).slice(2, 7)}`,
        type: 'CIRCLE',
        origin: { ...enemy.pos },
        radius: 125,
        durationMs: 1200,
        elapsedMs: 0
      };
      break;
    }
    case 'BOSS_WARLORD': {
      const isPhase3 = enemy.phase === 3;
      const attackChoice = Math.random();
      if (attackChoice < 0.4 || isPhase3) {
        // Colossal Cataclysm Circle
        enemy.activeTelegraph = {
          id: `telegraph_${Math.random().toString(36).slice(2, 7)}`,
          type: 'CIRCLE',
          origin: { ...enemy.pos },
          radius: isPhase3 ? 180 : 140,
          durationMs: isPhase3 ? 900 : 1100,
          elapsedMs: 0
        };
      } else {
        // Wide 130° Greatsword Sweep
        enemy.activeTelegraph = {
          id: `telegraph_${Math.random().toString(36).slice(2, 7)}`,
          type: 'CONE',
          origin: { ...enemy.pos },
          radius: 160,
          angleRad: angleToPlayer,
          coneAngleDeg: 130,
          durationMs: 850,
          elapsedMs: 0
        };
      }
      break;
    }
  }
}

function executeStrike(
  enemy: EnemyEntity,
  player: CombatEntity,
  onSpawnProjectile?: (proj: any) => void
) {
  if (enemy.archetype === 'ARCHER' && onSpawnProjectile) {
    // Spawn projectile
    const speed = 480;
    const proj = {
      id: `proj_${Math.random().toString(36).slice(2, 7)}`,
      sourceId: enemy.id,
      isPlayer: false,
      pos: { ...enemy.pos },
      velocity: {
        x: Math.cos(enemy.rotationAngle) * speed,
        y: Math.sin(enemy.rotationAngle) * speed
      },
      radius: 6,
      damage: 42,
      element: 'PHYSICAL',
      lifeMs: 0,
      maxLifeMs: 1200
    };
    onSpawnProjectile(proj);
    soundManager.playSlash();
  } else {
    soundManager.playSlash();
  }
}
