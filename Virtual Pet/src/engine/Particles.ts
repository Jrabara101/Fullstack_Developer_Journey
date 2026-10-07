export interface FoamBubble {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: number;
  wobbleSpeed: number;
  wobbleOffset: number;
}

export interface DirtDecal {
  id: string;
  relX: number; // offset relative to pet center (-0.5 to 0.5)
  relY: number; // offset relative to pet center (-0.5 to 0.5)
  radius: number;
  opacity: number;
}

export interface CrumbParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number; // 1.0 to 0.0
}

export interface FloatingEmoteParticle {
  id: string;
  x: number;
  y: number;
  vy: number;
  text: string;
  alpha: number;
  scale: number;
}

export interface ToyBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  active: boolean;
}

export class ParticleManager {
  public bubbles: FoamBubble[] = [];
  public crumbs: CrumbParticle[] = [];
  public emotes: FloatingEmoteParticle[] = [];
  public dirtDecals: DirtDecal[] = [];
  public ball: ToyBall = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 18,
    rotation: 0,
    vRot: 0,
    active: false,
  };

  constructor() {
    this.resetDirtDecals(4);
  }

  public resetDirtDecals(count = 4) {
    this.dirtDecals = [];
    for (let i = 0; i < count; i++) {
      this.dirtDecals.push({
        id: `dirt_${i}`,
        relX: (Math.random() - 0.5) * 0.7,
        relY: (Math.random() - 0.5) * 0.6,
        radius: 10 + Math.random() * 8,
        opacity: 0.75 + Math.random() * 0.25,
      });
    }
  }

  public spawnFoam(x: number, y: number, count = 3) {
    for (let i = 0; i < count; i++) {
      this.bubbles.push({
        id: `bubble_${Math.random()}`,
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 24,
        vx: (Math.random() - 0.5) * 35,
        vy: -20 - Math.random() * 45, // floats up
        radius: 5 + Math.random() * 8,
        alpha: 0.9,
        hue: 190 + Math.random() * 40,
        wobbleSpeed: 4 + Math.random() * 6,
        wobbleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  public spawnCrumbs(x: number, y: number, color: string, count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.crumbs.push({
        id: `crumb_${Math.random()}`,
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30, // upward pop
        color,
        size: 3 + Math.random() * 4,
        life: 1.0,
      });
    }
  }

  public spawnEmote(x: number, y: number, text: string) {
    this.emotes.push({
      id: `emote_${Math.random()}`,
      x,
      y,
      vy: -55 - Math.random() * 20,
      text,
      alpha: 1.0,
      scale: 0.8,
    });
  }

  public spawnBall(x: number, groundY: number) {
    this.ball.x = x;
    this.ball.y = groundY - 140;
    this.ball.vx = (Math.random() - 0.5) * 180;
    this.ball.vy = -160;
    this.ball.active = true;
  }

  public update(dt: number, bounds: { width: number; height: number; groundY: number }, onBallBounce?: (vel: number) => void) {
    const clampedDt = Math.min(dt, 0.05);

    // Update bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.x += b.vx * clampedDt;
      b.y += b.vy * clampedDt;
      b.alpha -= clampedDt * 0.45;
      b.radius += clampedDt * 1.5;
      if (b.alpha <= 0 || b.y < 0) {
        this.bubbles.splice(i, 1);
      }
    }

    // Update crumbs
    const gravity = 480;
    for (let i = this.crumbs.length - 1; i >= 0; i--) {
      const c = this.crumbs[i];
      c.x += c.vx * clampedDt;
      c.y += c.vy * clampedDt;
      c.vy += gravity * clampedDt;
      c.life -= clampedDt * 1.4;

      if (c.y > bounds.groundY) {
        c.y = bounds.groundY;
        c.vx *= 0.5;
      }

      if (c.life <= 0) {
        this.crumbs.splice(i, 1);
      }
    }

    // Update emotes
    for (let i = this.emotes.length - 1; i >= 0; i--) {
      const e = this.emotes[i];
      e.y += e.vy * clampedDt;
      e.alpha -= clampedDt * 0.85;
      e.scale = Math.min(1.3, e.scale + clampedDt * 0.8);
      if (e.alpha <= 0) {
        this.emotes.splice(i, 1);
      }
    }

    // Update ball physics if active
    if (this.ball.active) {
      const ball = this.ball;
      ball.vy += 520 * clampedDt; // Gravity
      ball.x += ball.vx * clampedDt;
      ball.y += ball.vy * clampedDt;
      ball.rotation += ball.vRot * clampedDt;

      // Ground bounce
      const floorY = bounds.groundY - ball.radius;
      if (ball.y > floorY) {
        ball.y = floorY;
        const impactSpeed = Math.abs(ball.vy);
        ball.vy = -ball.vy * 0.72; // restitution
        ball.vx *= 0.88; // friction
        ball.vRot = ball.vx * 0.08;
        if (impactSpeed > 40 && onBallBounce) {
          onBallBounce(Math.min(2.0, impactSpeed / 200));
        }
        if (Math.abs(ball.vy) < 15 && Math.abs(ball.vx) < 5) {
          ball.vy = 0;
        }
      }

      // Left/Right wall bounce
      if (ball.x < ball.radius) {
        ball.x = ball.radius;
        ball.vx = -ball.vx * 0.8;
      } else if (ball.x > bounds.width - ball.radius) {
        ball.x = bounds.width - ball.radius;
        ball.vx = -ball.vx * 0.8;
      }
    }
  }
}
