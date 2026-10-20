import { LevelData, PlacedWidget, SimulationStats, Vector2D, BallType } from '../types';

export interface BallState {
  pos: Vector2D;
  vel: Vector2D;
  radius: number;
  mass: number;
  restitution: number;
  ballType: BallType;
  alive: boolean;
  inGoal: boolean;
  portalCooldown: number;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  tick: number;
  bounces: number;
  alpha: number;
  isBounce?: boolean;
}

export interface SimulationResult {
  outcome: 'VICTORY' | 'FAILED' | 'TIMEOUT';
  ticks: number;
  elapsedMs: number;
  bounces: number;
  maxVelocity: number;
  kineticEnergyScore: number;
  stars: number;
  failureReason?: string;
  history?: Array<{ x: number; y: number; vx: number; vy: number }>;
}

export const BASE_GRAVITY = 980; // px/s^2
export const SUB_STEPS = 4;
export const FIXED_DT = 1 / 60; // 60Hz
export const MAX_SIMULATION_TICKS = 3600; // 60 seconds at 60Hz

export function getBallProps(type: BallType) {
  switch (type) {
    case 'steel':
      return { mass: 2.8, radius: 13, restitution: 0.35, gravityScale: 1.1, color: '#94A3B8' };
    case 'floater':
      return { mass: 0.6, radius: 16, restitution: 0.55, gravityScale: -0.25, color: '#F59E0B' };
    case 'rubber':
    default:
      return { mass: 1.0, radius: 12, restitution: 0.88, gravityScale: 1.0, color: '#06B6D4' };
  }
}

/**
 * Transforms a point from world space to oriented local space centered at center with rotationDeg
 */
function toLocalSpace(p: Vector2D, center: Vector2D, rad: number): Vector2D {
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  const cos = Math.cos(-rad);
  const sin = Math.sin(-rad);
  return {
    x: dx * cos - dy * sin,
    y: dx * sin + dy * cos
  };
}

/**
 * Transforms a vector from local space back to world space
 */
function toWorldSpace(v: Vector2D, rad: number): Vector2D {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos
  };
}

export class DeterministicPhysicsRunner {
  level: LevelData;
  widgets: PlacedWidget[];
  ball: BallState;
  ticks: number = 0;
  bounces: number = 0;
  maxVelocity: number = 0;
  kineticEnergySum: number = 0;
  goalContactTicks: number = 0;
  outcome: 'EDITING' | 'SIMULATING' | 'PAUSED' | 'VICTORY' | 'FAILED' = 'SIMULATING';
  failureReason?: string;

  constructor(level: LevelData, userPlacements: PlacedWidget[] = []) {
    this.level = level;
    // Combine immutable static bodies with user placements
    this.widgets = [...level.staticBodies, ...userPlacements];
    
    const ballProps = getBallProps(level.emitter.ballType || 'rubber');
    this.ball = {
      pos: { ...level.emitter.pos },
      vel: { ...level.emitter.initialVelocity },
      radius: ballProps.radius,
      mass: ballProps.mass,
      restitution: ballProps.restitution,
      ballType: level.emitter.ballType || 'rubber',
      alive: true,
      inGoal: false,
      portalCooldown: 0
    };
  }

  /**
   * Run one fixed 60Hz step (composed of SUB_STEPS for continuous collision detection)
   */
  step(): { outcome: 'EDITING' | 'SIMULATING' | 'PAUSED' | 'VICTORY' | 'FAILED'; ball: BallState } {
    if (this.outcome === 'VICTORY' || this.outcome === 'FAILED') {
      return { outcome: this.outcome, ball: this.ball };
    }

    const subDt = FIXED_DT / SUB_STEPS;

    for (let s = 0; s < SUB_STEPS; s++) {
      this.subStep(subDt);
      if (!this.ball.alive || this.ball.inGoal) break;
    }

    this.ticks++;

    // Track kinetic energy and peak velocity
    const speed = Math.hypot(this.ball.vel.x, this.ball.vel.y);
    if (speed > this.maxVelocity) {
      this.maxVelocity = speed;
    }
    const currentKE = 0.5 * this.ball.mass * (speed * speed);
    this.kineticEnergySum += currentKE;

    // Timeout check
    if (this.ticks >= MAX_SIMULATION_TICKS && this.outcome === 'SIMULATING') {
      this.outcome = 'FAILED';
      this.failureReason = 'Simulation time limit exceeded (60s)';
    }

    return { outcome: this.outcome, ball: this.ball };
  }

  private subStep(dt: number) {
    if (!this.ball.alive || this.ball.inGoal) return;

    if (this.ball.portalCooldown > 0) {
      this.ball.portalCooldown--;
    }

    const ballProps = getBallProps(this.ball.ballType);
    let ax = 0;
    let ay = BASE_GRAVITY * ballProps.gravityScale;

    // 1. Force fields: Gravity Wells & Accelerators
    for (const w of this.widgets) {
      if (w.type === 'gravity_well') {
        const radius = w.properties.gravityRadius ?? 160;
        const mag = w.properties.forceMagnitude ?? 420;
        const dx = w.pos.x - this.ball.pos.x;
        const dy = w.pos.y - this.ball.pos.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist > 1 && dist < radius) {
          // Softened inverse gravity falloff
          const falloff = 1 - (dist / radius);
          const force = (mag * 2500 * falloff) / (dist + 30);
          ax += (dx / dist) * (force / this.ball.mass);
          ay += (dy / dist) * (force / this.ball.mass);
        }
      } else if (w.type === 'bouncer' && w.properties.speedBoost) {
        // Handled in collision
      }
    }

    // Integrate acceleration to velocity
    this.ball.vel.x += ax * dt;
    this.ball.vel.y += ay * dt;

    // Subtle atmospheric drag
    this.ball.vel.x *= 0.9998;
    this.ball.vel.y *= 0.9998;

    // Integrate velocity to position
    this.ball.pos.x += this.ball.vel.x * dt;
    this.ball.pos.y += this.ball.vel.y * dt;

    // 2. Check Boundary Collisions (Walls of level)
    const bounds = this.level.dimensions;
    if (this.ball.pos.x - this.ball.radius < 0) {
      this.ball.pos.x = this.ball.radius;
      this.ball.vel.x = -this.ball.vel.x * this.ball.restitution;
      this.bounces++;
    } else if (this.ball.pos.x + this.ball.radius > bounds.width) {
      this.ball.pos.x = bounds.width - this.ball.radius;
      this.ball.vel.x = -this.ball.vel.x * this.ball.restitution;
      this.bounces++;
    }

    if (this.ball.pos.y - this.ball.radius < 0) {
      this.ball.pos.y = this.ball.radius;
      this.ball.vel.y = -this.ball.vel.y * this.ball.restitution;
      this.bounces++;
    } else if (this.ball.pos.y + this.ball.radius > bounds.height) {
      // Fallen out the bottom boundary
      this.ball.alive = false;
      this.outcome = 'FAILED';
      this.failureReason = 'Payload lost to the void';
      return;
    }

    // 3. Goal Receptacle Sensor Check
    const goal = this.level.goal;
    const gDist = Math.hypot(this.ball.pos.x - goal.pos.x, this.ball.pos.y - goal.pos.y);
    if (gDist < goal.radius) {
      this.goalContactTicks++;
      // Dampen velocity inside goal funnel
      this.ball.vel.x *= 0.85;
      this.ball.vel.y *= 0.85;

      if (this.goalContactTicks >= 3 || gDist < goal.radius * 0.6) {
        this.ball.inGoal = true;
        this.outcome = 'VICTORY';
        return;
      }
    } else {
      this.goalContactTicks = Math.max(0, this.goalContactTicks - 1);
    }

    // 4. Widget Collisions (Obstacles, Ramps, Bouncers, Portals, Hazards)
    for (const w of this.widgets) {
      this.handleWidgetInteraction(w, dt);
      if (!this.ball.alive || this.ball.inGoal) return;
    }
  }

  private handleWidgetInteraction(w: PlacedWidget, dt: number) {
    const rad = ((w.rotationDeg || 0) * Math.PI) / 180;

    if (w.type === 'hazard') {
      // Lethal barrier (laser, spikes, or beam)
      const hw = (w.properties.width ?? 70) / 2;
      const hh = (w.properties.height ?? 18) / 2;
      const local = toLocalSpace(this.ball.pos, w.pos, rad);

      // Check distance to clamped box
      const cx = Math.max(-hw, Math.min(hw, local.x));
      const cy = Math.max(-hh, Math.min(hh, local.y));
      const dist = Math.hypot(local.x - cx, local.y - cy);

      if (dist < this.ball.radius * 0.85) {
        this.ball.alive = false;
        this.outcome = 'FAILED';
        this.failureReason = 'Payload vaporized by lethal laser hazard';
      }
      return;
    }

    if (w.type === 'portal') {
      if (this.ball.portalCooldown <= 0) {
        const portalRadius = 26;
        const dist = Math.hypot(this.ball.pos.x - w.pos.x, this.ball.pos.y - w.pos.y);

        if (dist < portalRadius) {
          // Find target portal
          let targetPortal: PlacedWidget | undefined;
          if (w.properties.portalTargetId) {
            targetPortal = this.widgets.find(item => item.id === w.properties.portalTargetId);
          }
          if (!targetPortal) {
            // Find another portal widget in the arena
            targetPortal = this.widgets.find(item => item.type === 'portal' && item.id !== w.id);
          }

          if (targetPortal) {
            const exitRad = ((targetPortal.rotationDeg || 0) * Math.PI) / 180;
            // Exit facing direction vector
            const exitNormal = toWorldSpace({ x: 0, y: -1 }, exitRad);
            const currentSpeed = Math.max(220, Math.hypot(this.ball.vel.x, this.ball.vel.y));

            // Teleport ball outside exit portal event horizon
            this.ball.pos.x = targetPortal.pos.x + exitNormal.x * 32;
            this.ball.pos.y = targetPortal.pos.y + exitNormal.y * 32;

            // Redirect momentum along exit orientation
            this.ball.vel.x = exitNormal.x * currentSpeed;
            this.ball.vel.y = exitNormal.y * currentSpeed;

            this.ball.portalCooldown = 24; // 0.4s cooldown
            this.bounces++;
          }
        }
      }
      return;
    }

    if (w.type === 'bouncer') {
      // Directional Spring Pad / Trampoline
      const pw = (w.properties.width ?? 76) / 2;
      const ph = (w.properties.height ?? 18) / 2;
      const local = toLocalSpace(this.ball.pos, w.pos, rad);

      // Pad oriented with top face facing negative local Y
      const cx = Math.max(-pw, Math.min(pw, local.x));
      const cy = Math.max(-ph, Math.min(ph, local.y));
      const dist = Math.hypot(local.x - cx, local.y - cy);

      if (dist < this.ball.radius) {
        // Normal in local space pointing out from box
        let nx = local.x - cx;
        let ny = local.y - cy;
        const nLen = Math.hypot(nx, ny);

        if (nLen < 0.001) {
          ny = -1; // Default to pad top face
        } else {
          nx /= nLen;
          ny /= nLen;
        }

        // Push ball out of penetration
        const overlap = this.ball.radius - dist;
        local.x += nx * overlap;
        local.y += ny * overlap;

        // Restore to world space
        const restoredPos = toWorldSpace(local, rad);
        this.ball.pos.x = w.pos.x + restoredPos.x;
        this.ball.pos.y = w.pos.y + restoredPos.y;

        // Velocity collision response
        const localVel = toLocalSpace(this.ball.vel, { x: 0, y: 0 }, rad);
        const vNormal = localVel.x * nx + localVel.y * ny;

        if (vNormal < 0) {
          const bounceRestitution = w.properties.restitution ?? 1.45;
          const boostImpulse = w.properties.forceMagnitude ?? 380;

          // Reflect normal velocity with boosted spring kick
          localVel.x -= (1 + bounceRestitution) * vNormal * nx;
          localVel.y -= (1 + bounceRestitution) * vNormal * ny;

          // Extra spring launch if hitting top face
          if (ny < -0.5) {
            localVel.y -= boostImpulse;
          }

          const worldVel = toWorldSpace(localVel, rad);
          this.ball.vel.x = worldVel.x;
          this.ball.vel.y = worldVel.y;
          this.bounces++;
        }
      }
      return;
    }

    if (w.type === 'ramp') {
      // Rotating Deflector Paddle / Solid Wall Ramp
      const rw = (w.properties.width ?? 90) / 2;
      const rh = (w.properties.height ?? 16) / 2;
      const local = toLocalSpace(this.ball.pos, w.pos, rad);

      const cx = Math.max(-rw, Math.min(rw, local.x));
      const cy = Math.max(-rh, Math.min(rh, local.y));
      const dist = Math.hypot(local.x - cx, local.y - cy);

      if (dist < this.ball.radius) {
        let nx = local.x - cx;
        let ny = local.y - cy;
        const nLen = Math.hypot(nx, ny);

        if (nLen < 0.001) {
          ny = -1;
        } else {
          nx /= nLen;
          ny /= nLen;
        }

        const overlap = this.ball.radius - dist;
        local.x += nx * overlap;
        local.y += ny * overlap;

        const restoredPos = toWorldSpace(local, rad);
        this.ball.pos.x = w.pos.x + restoredPos.x;
        this.ball.pos.y = w.pos.y + restoredPos.y;

        const localVel = toLocalSpace(this.ball.vel, { x: 0, y: 0 }, rad);
        const vNormal = localVel.x * nx + localVel.y * ny;

        if (vNormal < 0) {
          const effectiveRestitution = this.ball.restitution * (w.properties.restitution ?? 0.85);
          localVel.x -= (1 + effectiveRestitution) * vNormal * nx;
          localVel.y -= (1 + effectiveRestitution) * vNormal * ny;

          // Tangential friction
          const tx = -ny;
          const ty = nx;
          const vTangent = localVel.x * tx + localVel.y * ty;
          localVel.x -= vTangent * 0.08 * tx;
          localVel.y -= vTangent * 0.08 * ty;

          const worldVel = toWorldSpace(localVel, rad);
          this.ball.vel.x = worldVel.x;
          this.ball.vel.y = worldVel.y;
          this.bounces++;
        }
      }
      return;
    }
  }

  /**
   * Run full simulation headless until completion or timeout
   */
  runUntilDone(maxTicks = MAX_SIMULATION_TICKS): SimulationResult {
    const history: Array<{ x: number; y: number; vx: number; vy: number }> = [];

    while (this.outcome === 'SIMULATING' && this.ticks < maxTicks) {
      history.push({
        x: Math.round(this.ball.pos.x * 100) / 100,
        y: Math.round(this.ball.pos.y * 100) / 100,
        vx: Math.round(this.ball.vel.x * 100) / 100,
        vy: Math.round(this.ball.vel.y * 100) / 100
      });
      this.step();
    }

    const elapsedMs = Math.round(this.ticks * (1000 / 60));
    const gadgetsUsed = this.widgets.filter(w => !w.isLocked).length;
    const par = this.level.parItems || 3;

    // Calculate stars (1 to 3) based on gadget budget efficiency & elapsed time
    let stars = 1;
    if (this.outcome === 'VICTORY') {
      if (gadgetsUsed <= par && elapsedMs <= 20000) {
        stars = 3;
      } else if (gadgetsUsed <= par + 1) {
        stars = 2;
      }
    } else {
      stars = 0;
    }

    return {
      outcome: this.outcome === 'VICTORY' ? 'VICTORY' : this.outcome === 'FAILED' ? 'FAILED' : 'TIMEOUT',
      ticks: this.ticks,
      elapsedMs,
      bounces: this.bounces,
      maxVelocity: Math.round(this.maxVelocity),
      kineticEnergyScore: Math.round(this.kineticEnergySum / (this.ticks || 1)),
      stars,
      failureReason: this.failureReason,
      history
    };
  }

  /**
   * Compute real-time ghost trajectory preview for up to 2 bounces
   */
  static computeGhostTrajectory(
    level: LevelData,
    userPlacements: PlacedWidget[],
    maxLookaheadTicks: number = 140
  ): TrajectoryPoint[] {
    const runner = new DeterministicPhysicsRunner(level, userPlacements);
    const points: TrajectoryPoint[] = [];
    const maxBounces = 2;
    let prevBounces = 0;

    for (let t = 0; t < maxLookaheadTicks; t++) {
      runner.step();

      const bounceOccurred = runner.bounces > prevBounces;
      if (bounceOccurred) {
        prevBounces = runner.bounces;
      }

      // Calculate alpha fading: fades as ticks advance and as bounces approach limit
      const tickProgress = t / maxLookaheadTicks;
      const bounceFade = 1 - (runner.bounces / (maxBounces + 0.5));
      const alpha = Math.max(0, Math.min(1, (1 - tickProgress * 0.7) * bounceFade));

      if (t % 2 === 0 || bounceOccurred) {
        points.push({
          x: runner.ball.pos.x,
          y: runner.ball.pos.y,
          tick: t,
          bounces: runner.bounces,
          alpha,
          isBounce: bounceOccurred
        });
      }

      if (runner.bounces >= maxBounces || runner.outcome === 'VICTORY' || runner.outcome === 'FAILED') {
        break;
      }
    }

    return points;
  }
}
