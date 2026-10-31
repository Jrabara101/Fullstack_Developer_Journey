import React, { useEffect, useRef } from 'react';

export interface MechanicSandboxParams {
  coyoteTimeMs: number;
  jumpBufferMs: number;
  hitStopMs: number;
  screenShakeIntensity: number;
  squashStretch: boolean;
  particlePooling: boolean;
  raycastDebug: boolean;
}

interface MechanicSandboxCanvasProps {
  params: MechanicSandboxParams;
  onStatsUpdate?: (stats: { frameBudgetMs: number; drawCalls: number; activeParticles: number }) => void;
}

export const MechanicSandboxCanvas: React.FC<MechanicSandboxCanvasProps> = ({
  params,
  onStatsUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 640;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    let animId: number;
    let lastTime = performance.now();
    let freezeTimer = 0;
    let shakeTrauma = 0;

    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (['Space', 'KeyW', 'KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.code)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Arena Level Geometry
    const platforms = [
      { x: 0, y: 310, w: 220, h: 50, label: 'Ledge A' },
      { x: 280, y: 310, w: 360, h: 50, label: 'Ledge B (Coyote Jump Test Gap)' },
      { x: 420, y: 220, w: 140, h: 16, label: 'Elevated Platform' },
      { x: 590, y: 140, w: 50, h: 170, label: 'Test Wall' },
    ];

    // Training Dummy Target
    const dummy = {
      x: 360,
      y: 260,
      w: 30,
      h: 50,
      hp: 100,
      hitFlash: 0,
    };

    // Hero Character
    const hero = {
      x: 80,
      y: 200,
      w: 24,
      h: 36,
      vx: 0,
      vy: 0,
      isGrounded: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      facingRight: true,
      squashX: 1,
      squashY: 1,
      isAttacking: false,
      attackTimer: 0,
    };

    // Particles
    const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const frameStartTime = performance.now();
      let drawCalls = 0;

      if (freezeTimer > 0) {
        freezeTimer -= dt;
      } else {
        // Input
        const moveLeft = keys['KeyA'] || keys['ArrowLeft'];
        const moveRight = keys['KeyD'] || keys['ArrowRight'];
        const jumpPressed = keys['Space'] || keys['KeyW'] || keys['ArrowUp'];
        const attackPressed = keys['KeyJ'] || keys['KeyZ'];

        // Jump Intent Buffering (dynamically parameterized)
        const bufferWindow = params.jumpBufferMs / 1000;
        if (jumpPressed && hero.jumpBufferTimer <= 0) {
          hero.jumpBufferTimer = bufferWindow;
        } else if (hero.jumpBufferTimer > 0) {
          hero.jumpBufferTimer -= dt;
        }

        // Coyote Timer (dynamically parameterized)
        const coyoteWindow = params.coyoteTimeMs / 1000;
        if (hero.isGrounded) {
          hero.coyoteTimer = coyoteWindow;
        } else {
          hero.coyoteTimer -= dt;
        }

        // Horizontal Movement
        const accel = hero.isGrounded ? 2600 : 1400;
        const friction = hero.isGrounded ? 1800 : 600;
        const maxSpeed = 280;

        if (moveLeft && !moveRight) {
          hero.vx = Math.max(hero.vx - accel * dt, -maxSpeed);
          hero.facingRight = false;
        } else if (moveRight && !moveLeft) {
          hero.vx = Math.min(hero.vx + accel * dt, maxSpeed);
          hero.facingRight = true;
        } else {
          if (hero.vx > 0) hero.vx = Math.max(0, hero.vx - friction * dt);
          else if (hero.vx < 0) hero.vx = Math.min(0, hero.vx + friction * dt);
        }

        // Gravity
        hero.vy += 1200 * dt;

        // Jump with buffered intent & coyote grace
        if (hero.jumpBufferTimer > 0 && hero.coyoteTimer > 0) {
          hero.vy = -520;
          hero.coyoteTimer = 0;
          hero.jumpBufferTimer = 0;
          hero.isGrounded = false;
          if (params.squashStretch) {
            hero.squashX = 0.65;
            hero.squashY = 1.4;
          }
        }

        // Attack Target
        if (attackPressed && !hero.isAttacking) {
          hero.isAttacking = true;
          hero.attackTimer = 0.15;

          // Check hit on dummy
          const reach = 55;
          const hitX = hero.facingRight ? hero.x + hero.w : hero.x - reach;
          if (
            hitX < dummy.x + dummy.w &&
            hitX + reach > dummy.x &&
            hero.y + hero.h > dummy.y &&
            hero.y < dummy.y + dummy.h
          ) {
            dummy.hitFlash = 0.2;
            freezeTimer = params.hitStopMs / 1000;
            shakeTrauma = (params.screenShakeIntensity / 100) * 12;

            const sparkCount = params.particlePooling ? 20 : 6;
            for (let i = 0; i < sparkCount; i++) {
              const a = Math.random() * Math.PI * 2;
              const spd = Math.random() * 5 + 2;
              particles.push({
                x: dummy.x + dummy.w / 2,
                y: dummy.y + dummy.h / 2,
                vx: Math.cos(a) * spd,
                vy: Math.sin(a) * spd - 1,
                life: 1,
                color: '#f59e0b',
              });
            }
          }
        }

        if (hero.isAttacking) {
          hero.attackTimer -= dt;
          if (hero.attackTimer <= 0) hero.isAttacking = false;
        }

        // Move & Collide
        hero.x += hero.vx * dt;
        for (const p of platforms) {
          if (hero.x < p.x + p.w && hero.x + hero.w > p.x && hero.y < p.y + p.h && hero.y + hero.h > p.y) {
            if (hero.vx > 0) hero.x = p.x - hero.w;
            else if (hero.vx < 0) hero.x = p.x + p.w;
            hero.vx = 0;
          }
        }

        hero.y += hero.vy * dt;
        let groundCheck = false;
        for (const p of platforms) {
          if (hero.x < p.x + p.w && hero.x + hero.w > p.x && hero.y < p.y + p.h && hero.y + hero.h > p.y) {
            if (hero.vy > 0) {
              hero.y = p.y - hero.h;
              hero.vy = 0;
              groundCheck = true;
              if (!hero.isGrounded && params.squashStretch) {
                hero.squashX = 1.35;
                hero.squashY = 0.65;
              }
            } else if (hero.vy < 0) {
              hero.y = p.y + p.h;
              hero.vy = 0;
            }
          }
        }
        hero.isGrounded = groundCheck;

        // Squash/Stretch recovery
        if (params.squashStretch) {
          hero.squashX += (1 - hero.squashX) * 12 * dt;
          hero.squashY += (1 - hero.squashY) * 12 * dt;
        } else {
          hero.squashX = 1;
          hero.squashY = 1;
        }

        if (hero.y > height) {
          hero.x = 80;
          hero.y = 150;
          hero.vy = 0;
        }
      }

      if (shakeTrauma > 0) {
        shakeTrauma = Math.max(0, shakeTrauma - dt * 20);
      }
      if (dummy.hitFlash > 0) dummy.hitFlash -= dt;

      // --- RENDER ---
      ctx.save();
      if (shakeTrauma > 0) {
        const sx = (Math.random() - 0.5) * shakeTrauma * 2;
        const sy = (Math.random() - 0.5) * shakeTrauma * 2;
        ctx.translate(sx, sy);
      }

      // Background
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, width, height);
      drawCalls++;

      // Arena Platforms
      platforms.forEach((p) => {
        ctx.fillStyle = '#141d2f';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        drawCalls += 2;

        if (params.raycastDebug) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.font = '9px monospace';
          ctx.fillText(p.label, p.x + 6, p.y + 16);
          drawCalls++;
        }
      });

      // Dummy Target
      ctx.fillStyle = dummy.hitFlash > 0 ? '#f43f5e' : '#334155';
      ctx.fillRect(dummy.x, dummy.y, dummy.w, dummy.h);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(dummy.x, dummy.y, dummy.w, dummy.h);
      drawCalls += 2;

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('DUMMY [HIT ME]', dummy.x - 12, dummy.y - 8);

      // Hero
      ctx.save();
      ctx.translate(hero.x + hero.w / 2, hero.y + hero.h);
      ctx.scale(hero.squashX, hero.squashY);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-hero.w / 2, -hero.h, hero.w, hero.h);
      ctx.restore();
      drawCalls++;

      // Attack Arc
      if (hero.isAttacking) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const ax = hero.facingRight ? hero.x + hero.w : hero.x;
        const ay = hero.y + hero.h / 2;
        ctx.arc(ax, ay, 28, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
        drawCalls++;
      }

      // Raycast Debug Vectors Overlay
      if (params.raycastDebug) {
        // Ground Probe Ray
        ctx.strokeStyle = hero.isGrounded ? '#10b981' : '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hero.x + hero.w / 2, hero.y + hero.h);
        ctx.lineTo(hero.x + hero.w / 2, hero.y + hero.h + 20);
        ctx.stroke();

        // Velocity Direction Vector
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(hero.x + hero.w / 2, hero.y + hero.h / 2);
        ctx.lineTo(hero.x + hero.w / 2 + hero.vx * 0.15, hero.y + hero.h / 2 + hero.vy * 0.15);
        ctx.stroke();

        // Hurtbox AABB
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.strokeRect(hero.x, hero.y, hero.w, hero.h);
        drawCalls += 3;
      }

      // Sparks
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= dt * 2.5;
        if (pt.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 3, 3);
        drawCalls++;
      }

      // Live On-Screen Telemetry HUD
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(8, 8, 260, 48);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(`Coyote Grace: ${params.coyoteTimeMs}ms (Active: ${Math.max(0, hero.coyoteTimer).toFixed(2)}s)`, 14, 22);
      ctx.fillText(`Jump Buffer: ${params.jumpBufferMs}ms (Intent: ${Math.max(0, hero.jumpBufferTimer).toFixed(2)}s)`, 14, 34);
      ctx.fillText(`Hit-Stop: ${params.hitStopMs}ms • Shake: ${params.screenShakeIntensity}%`, 14, 46);

      ctx.restore();

      const frameDuration = performance.now() - frameStartTime;
      if (onStatsUpdate) {
        onStatsUpdate({
          frameBudgetMs: Number(frameDuration.toFixed(2)),
          drawCalls,
          activeParticles: particles.length,
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [params, onStatsUpdate]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center bg-black/80 rounded-lg overflow-hidden border border-cyan-500/30">
      <canvas ref={canvasRef} className="w-full max-w-[640px] aspect-[16/9] object-contain focus:outline-none" tabIndex={0} />
      <div className="w-full bg-slate-900/90 px-4 py-2 flex items-center justify-between border-t border-slate-800 text-[11px] font-mono text-slate-400">
        <span>Controls: [A/D] Walk • [SPACE] Jump Gap • [J] Slash Dummy</span>
        <span className="text-cyan-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Interactive Physics Active
        </span>
      </div>
    </div>
  );
};
