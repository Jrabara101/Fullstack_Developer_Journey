import type { Vector2D } from '../types';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'BLOOD' | 'SPARK' | 'FIRE' | 'FROST' | 'SHOCKWAVE';
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private readonly maxParticles = 600;

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Friction & physics
      if (p.type === 'BLOOD') {
        p.vx *= 0.92;
        p.vy *= 0.92;
      } else if (p.type === 'SPARK') {
        p.vx *= 0.96;
        p.vy *= 0.96;
      } else if (p.type === 'FIRE') {
        p.vy -= 40 * dt; // rise
        p.vx *= 0.95;
      } else if (p.type === 'SHOCKWAVE') {
        p.size += 300 * dt;
      }

      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'SHOCKWAVE') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3 * p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  public spawnSparks(origin: Vector2D, count = 16, color = '#F59E0B') {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 260;
      this.particles.push({
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.35,
        type: 'SPARK'
      });
    }
  }

  public spawnBlood(origin: Vector2D, count = 12, dirAngle?: number) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = dirAngle !== undefined
        ? dirAngle + (Math.random() - 0.5) * 1.2
        : Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 180;
      this.particles.push({
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.4 ? '#DC2626' : '#991B1B',
        alpha: 1,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.4,
        type: 'BLOOD'
      });
    }
  }

  public spawnShockwave(origin: Vector2D, color = '#06B6D4', initialSize = 10, maxLife = 0.3) {
    if (this.particles.length < this.maxParticles) {
      this.particles.push({
        x: origin.x,
        y: origin.y,
        vx: 0,
        vy: 0,
        size: initialSize,
        color,
        alpha: 1,
        life: 0,
        maxLife,
        type: 'SHOCKWAVE'
      });
    }
  }

  public spawnFireEmbers(origin: Vector2D, count = 10) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 100;
      this.particles.push({
        x: origin.x + (Math.random() - 0.5) * 20,
        y: origin.y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#F97316' : '#EF4444',
        alpha: 1,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
        type: 'FIRE'
      });
    }
  }

  public spawnFrostFlakes(origin: Vector2D, count = 12) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 120;
      this.particles.push({
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2.5,
        color: '#38BDF8',
        alpha: 1,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3,
        type: 'FROST'
      });
    }
  }

  public clear() {
    this.particles = [];
  }
}
