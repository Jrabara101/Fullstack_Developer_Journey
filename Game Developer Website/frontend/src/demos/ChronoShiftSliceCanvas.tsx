import React, { useEffect, useRef, useState } from 'react';

interface TelemetryUpdate {
  fps: number;
  frameTimeMs: number;
  entitiesCount: number;
  gamepadConnected: boolean;
}

interface ChronoShiftSliceCanvasProps {
  onTelemetryUpdate?: (data: TelemetryUpdate) => void;
  isMuted?: boolean;
}

export const ChronoShiftSliceCanvas: React.FC<ChronoShiftSliceCanvasProps> = ({
  onTelemetryUpdate,
  isMuted = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound generator via Web Audio API (zero external assets needed)
  const playSound = (type: 'jump' | 'dash' | 'hit' | 'parry' | 'land') => {
    if (isMuted || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'jump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'dash') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // AudioContext unavailable or restricted
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize Web Audio on user gesture
    const initAudio = () => {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
          setAudioEnabled(true);
        }
      }
    };

    // State Variables
    let animationFrameId: number;
    let lastTime = performance.now();
    let fpsSmoothed = 60;
    let freezeTimer = 0; // Hit-stop
    let screenShake = 0;

    // Keys
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      initAudio();
      keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // World & Level Geometry
    const width = 800;
    const height = 450;
    canvas.width = width;
    canvas.height = height;

    const platforms = [
      { x: 0, y: 390, w: 800, h: 60, type: 'ground' },
      { x: 120, y: 290, w: 160, h: 18, type: 'platform' },
      { x: 360, y: 240, w: 180, h: 18, type: 'platform' },
      { x: 600, y: 310, w: 150, h: 18, type: 'platform' },
      { x: 740, y: 150, w: 60, h: 240, type: 'wall' },
      { x: 0, y: 150, w: 40, h: 240, type: 'wall' },
    ];

    // Player State
    const player = {
      x: 180,
      y: 200,
      w: 24,
      h: 36,
      vx: 0,
      vy: 0,
      isGrounded: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      facingRight: true,
      isDashing: false,
      dashCooldown: 0,
      dashTimer: 0,
      isAttacking: false,
      attackCooldown: 0,
      attackTimer: 0,
      comboStep: 0,
      ghostTrails: [] as { x: number; y: number; alpha: number; facingRight: boolean }[],
      squashX: 1,
      squashY: 1,
      health: 100,
    };

    // Practice Training Drones
    const enemies = [
      { id: 1, x: 440, y: 195, w: 32, h: 36, hp: 100, maxHp: 100, hitTimer: 0, baseY: 195, floatAngle: 0 },
      { id: 2, x: 670, y: 265, w: 32, h: 36, hp: 100, maxHp: 100, hitTimer: 0, baseY: 265, floatAngle: 2 },
    ];

    // Particles & Floating Damage
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }
    let particles: Particle[] = [];

    interface FloatingText {
      x: number;
      y: number;
      text: string;
      color: string;
      life: number;
    }
    let floatingTexts: FloatingText[] = [];

    const spawnSparks = (x: number, y: number, count = 16, color = '#06b6d4') => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 1,
          maxLife: Math.random() * 20 + 15,
          color,
          size: Math.random() * 3 + 2,
        });
      }
    };

    // Game Loop
    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;
      const currentFps = 1 / (dt || 0.016);
      fpsSmoothed = fpsSmoothed * 0.9 + currentFps * 0.1;

      // Check Gamepads
      let gpConnected = false;
      let gpAxisX = 0;
      let gpJump = false;
      let gpDash = false;
      let gpAttack = false;

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      if (gamepads && gamepads[0]) {
        const gp = gamepads[0];
        gpConnected = true;
        if (Math.abs(gp.axes[0]) > 0.2) gpAxisX = gp.axes[0];
        if (gp.buttons[0]?.pressed) gpJump = true; // A / Cross
        if (gp.buttons[5]?.pressed || gp.buttons[7]?.pressed) gpDash = true; // RB / R2
        if (gp.buttons[2]?.pressed || gp.buttons[1]?.pressed) gpAttack = true; // X / Square
      }

      // Hit-stop freeze frame processing
      if (freezeTimer > 0) {
        freezeTimer -= dt;
      } else {
        // --- INPUT HANDLING ---
        const moveLeft = keys['KeyA'] || keys['ArrowLeft'] || gpAxisX < -0.3;
        const moveRight = keys['KeyD'] || keys['ArrowRight'] || gpAxisX > 0.3;
        const jumpPressed = keys['Space'] || keys['KeyW'] || keys['ArrowUp'] || gpJump;
        const dashPressed = keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyK'] || gpDash;
        const attackPressed = keys['KeyJ'] || keys['KeyZ'] || gpAttack;

        // Jump Intent Buffering
        if (jumpPressed && player.jumpBufferTimer <= 0) {
          player.jumpBufferTimer = 0.15; // 150ms buffer
        } else if (player.jumpBufferTimer > 0) {
          player.jumpBufferTimer -= dt;
        }

        // Coyote Timer
        if (player.isGrounded) {
          player.coyoteTimer = 0.15; // 150ms coyote time
        } else {
          player.coyoteTimer -= dt;
        }

        // Horizontal Acceleration & Velocity
        const accel = player.isGrounded ? 3200 : 1800;
        const friction = player.isGrounded ? 2200 : 800;
        const maxSpeed = 380;

        if (moveLeft && !moveRight) {
          player.vx = Math.max(player.vx - accel * dt, -maxSpeed);
          player.facingRight = false;
        } else if (moveRight && !moveLeft) {
          player.vx = Math.min(player.vx + accel * dt, maxSpeed);
          player.facingRight = true;
        } else {
          if (player.vx > 0) player.vx = Math.max(0, player.vx - friction * dt);
          else if (player.vx < 0) player.vx = Math.min(0, player.vx + friction * dt);
        }

        // Dash Execution
        if (player.dashCooldown > 0) player.dashCooldown -= dt;
        if (dashPressed && player.dashCooldown <= 0 && !player.isDashing) {
          player.isDashing = true;
          player.dashTimer = 0.18;
          player.dashCooldown = 0.65;
          player.vx = (player.facingRight ? 1 : -1) * 850;
          player.vy = 0;
          screenShake = 6;
          spawnSparks(player.x + player.w / 2, player.y + player.h / 2, 18, '#38bdf8');
          playSound('dash');
        }

        if (player.isDashing) {
          player.dashTimer -= dt;
          if (player.dashTimer <= 0) {
            player.isDashing = false;
            player.vx *= 0.4;
          }
          // Spawn Ghost Trails
          if (Math.random() < 0.6) {
            player.ghostTrails.push({
              x: player.x,
              y: player.y,
              alpha: 0.7,
              facingRight: player.facingRight,
            });
          }
        }

        // Gravity & Vertical Physics
        if (!player.isDashing) {
          const gravity = player.vy > 0 ? 1800 : 1250; // Faster fall for snappy feel
          player.vy += gravity * dt;
        }

        // Jump Execution with Coyote & Buffer
        if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
          player.vy = -620;
          player.coyoteTimer = 0;
          player.jumpBufferTimer = 0;
          player.isGrounded = false;
          player.squashX = 0.7;
          player.squashY = 1.35;
          spawnSparks(player.x + player.w / 2, player.y + player.h, 8, '#10b981');
          playSound('jump');
        }

        // Variable Jump Cutoff
        if (!jumpPressed && player.vy < -200) {
          player.vy *= 0.65;
        }

        // Attack Handling
        if (player.attackCooldown > 0) player.attackCooldown -= dt;
        if (attackPressed && player.attackCooldown <= 0 && !player.isAttacking) {
          player.isAttacking = true;
          player.attackTimer = 0.16;
          player.attackCooldown = 0.28;
          player.comboStep = (player.comboStep + 1) % 3;
          screenShake = 4;
          playSound('hit');

          // Check hit against practice drones
          const slashRange = 75;
          const slashX = player.facingRight ? player.x + player.w : player.x - slashRange;
          enemies.forEach((enemy) => {
            if (
              slashX < enemy.x + enemy.w &&
              slashX + slashRange > enemy.x &&
              player.y + player.h > enemy.y &&
              player.y < enemy.y + enemy.h
            ) {
              const damage = Math.floor(Math.random() * 15) + 35;
              enemy.hp = Math.max(0, enemy.hp - damage);
              enemy.hitTimer = 0.2;
              freezeTimer = 0.08; // 80ms Visceral Hit-stop
              screenShake = 12; // Camera trauma

              spawnSparks(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 24, '#f59e0b');
              floatingTexts.push({
                x: enemy.x + (Math.random() * 20 - 10),
                y: enemy.y - 10,
                text: `${damage} CRIT!`,
                color: '#f59e0b',
                life: 1,
              });

              if (enemy.hp <= 0) {
                spawnSparks(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 40, '#f43f5e');
                floatingTexts.push({
                  x: enemy.x,
                  y: enemy.y - 25,
                  text: 'CORE DESTROYED',
                  color: '#f43f5e',
                  life: 1.2,
                });
                setTimeout(() => {
                  enemy.hp = enemy.maxHp;
                }, 1800);
              }
            }
          });
        }

        if (player.isAttacking) {
          player.attackTimer -= dt;
          if (player.attackTimer <= 0) {
            player.isAttacking = false;
          }
        }

        // Move Player & Resolve Swept Collisions
        player.x += player.vx * dt;
        // Horizontal Collision
        for (const p of platforms) {
          if (
            player.x < p.x + p.w &&
            player.x + player.w > p.x &&
            player.y < p.y + p.h &&
            player.y + player.h > p.y
          ) {
            if (player.vx > 0) player.x = p.x - player.w;
            else if (player.vx < 0) player.x = p.x + p.w;
            player.vx = 0;
          }
        }

        player.y += player.vy * dt;
        // Vertical Collision
        let groundedNow = false;
        for (const p of platforms) {
          if (
            player.x < p.x + p.w &&
            player.x + player.w > p.x &&
            player.y < p.y + p.h &&
            player.y + player.h > p.y
          ) {
            if (player.vy > 0) {
              player.y = p.y - player.h;
              player.vy = 0;
              groundedNow = true;
              if (!player.isGrounded) {
                player.squashX = 1.3;
                player.squashY = 0.7; // Squash on impact
                spawnSparks(player.x + player.w / 2, player.y + player.h, 6, '#64748b');
              }
            } else if (player.vy < 0) {
              player.y = p.y + p.h;
              player.vy = 0;
            }
          }
        }
        player.isGrounded = groundedNow;

        // Smooth Squash/Stretch recovery
        player.squashX += (1 - player.squashX) * 12 * dt;
        player.squashY += (1 - player.squashY) * 12 * dt;

        // Boundaries
        if (player.x < 10) player.x = 10;
        if (player.x > width - player.w - 10) player.x = width - player.w - 10;
        if (player.y > height) {
          player.y = 100;
          player.vy = 0;
        }

        // Enemies update
        enemies.forEach((enemy) => {
          enemy.floatAngle += dt * 3;
          enemy.y = enemy.baseY + Math.sin(enemy.floatAngle) * 8;
          if (enemy.hitTimer > 0) enemy.hitTimer -= dt;
        });
      }

      // Screen Shake decay
      if (screenShake > 0) {
        screenShake = Math.max(0, screenShake - dt * 25);
      }

      // --- RENDERING ---
      ctx.save();
      // Apply screen shake
      if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake * 2;
        const shakeY = (Math.random() - 0.5) * screenShake * 2;
        ctx.translate(shakeX, shakeY);
      }

      // Background Cyberpunk Grid
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Platforms
      platforms.forEach((p) => {
        // Platform body
        ctx.fillStyle = p.type === 'ground' ? '#0d131f' : '#141c2e';
        ctx.fillRect(p.x, p.y, p.w, p.h);

        // Neon Top Edge
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(p.x, p.y, p.w, 2);

        // Tech accent markings
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        for (let bx = p.x + 8; bx < p.x + p.w - 8; bx += 24) {
          ctx.fillRect(bx, p.y + 6, 8, 3);
        }
      });

      // Draw Ghost Trails
      for (let i = player.ghostTrails.length - 1; i >= 0; i--) {
        const trail = player.ghostTrails[i];
        trail.alpha -= dt * 3.5;
        if (trail.alpha <= 0) {
          player.ghostTrails.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = trail.alpha * 0.5;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(trail.x, trail.y, player.w, player.h);
        ctx.restore();
      }

      // Draw Practice Enemies
      enemies.forEach((enemy) => {
        ctx.save();
        // Glow
        ctx.shadowColor = enemy.hitTimer > 0 ? '#f43f5e' : '#f59e0b';
        ctx.shadowBlur = enemy.hitTimer > 0 ? 25 : 12;

        // Drone Core Body
        ctx.fillStyle = enemy.hitTimer > 0 ? '#ffffff' : '#1a2234';
        ctx.strokeStyle = enemy.hitTimer > 0 ? '#f43f5e' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.w, enemy.h);
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);

        // Eye Sensor
        ctx.fillStyle = enemy.hitTimer > 0 ? '#f43f5e' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 5, 0, Math.PI * 2);
        ctx.fill();

        // Health Bar
        const barW = 40;
        const barH = 5;
        const barX = enemy.x + (enemy.w - barW) / 2;
        const barY = enemy.y - 12;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = enemy.hp > 30 ? '#10b981' : '#f43f5e';
        ctx.fillRect(barX, barY, (enemy.hp / enemy.maxHp) * barW, barH);
        ctx.restore();
      });

      // Draw Player Character with Squash & Stretch
      ctx.save();
      const centerX = player.x + player.w / 2;
      const bottomY = player.y + player.h;
      ctx.translate(centerX, bottomY);
      ctx.scale(player.squashX, player.squashY);

      // Neon Shadow Glow
      ctx.shadowColor = player.isDashing ? '#38bdf8' : '#10b981';
      ctx.shadowBlur = 15;

      // Character Capsule Body
      ctx.fillStyle = player.isDashing ? '#e0f2fe' : '#10b981';
      ctx.fillRect(-player.w / 2, -player.h, player.w, player.h);

      // Visor
      ctx.fillStyle = '#06b6d4';
      const visorX = player.facingRight ? 2 : -10;
      ctx.fillRect(visorX, -player.h + 6, 8, 4);

      // Kinetic Backpack core
      ctx.fillStyle = '#f59e0b';
      const packX = player.facingRight ? -player.w / 2 - 2 : player.w / 2;
      ctx.fillRect(packX, -player.h + 12, 3, 10);

      ctx.restore();

      // Draw Katana Slash Arc
      if (player.isAttacking) {
        ctx.save();
        ctx.strokeStyle = player.comboStep === 2 ? '#f59e0b' : '#38bdf8';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;

        const arcCenterX = player.facingRight ? player.x + player.w : player.x;
        const arcCenterY = player.y + player.h / 2;
        ctx.beginPath();
        if (player.facingRight) {
          ctx.arc(arcCenterX, arcCenterY, 36, -Math.PI / 3, Math.PI / 3);
        } else {
          ctx.arc(arcCenterX, arcCenterY, 36, (2 * Math.PI) / 3, (4 * Math.PI) / 3);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw Sparks
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.life++;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      }

      // Draw Floating Texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 0.8;
        ft.life -= dt * 1.5;
        if (ft.life <= 0) {
          floatingTexts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, ft.life);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // Controls overlay instructions in bottom left
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('[A/D] Run • [SPACE] Jump (Coyote/Buffer) • [SHIFT] Dash • [J] Slash', 20, height - 16);

      ctx.restore();

      // Emit Telemetry to parent
      if (onTelemetryUpdate) {
        onTelemetryUpdate({
          fps: Math.round(fpsSmoothed),
          frameTimeMs: Number(dt.toFixed(2)),
          entitiesCount: 1 + enemies.length + particles.length,
          gamepadConnected: gpConnected,
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [onTelemetryUpdate, isMuted]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/60 rounded-lg overflow-hidden border border-cyan-500/20">
      <canvas
        ref={canvasRef}
        className="w-full h-auto max-w-[800px] aspect-[16/9] object-contain shadow-2xl focus:outline-none"
        tabIndex={0}
      />
      {!audioEnabled && (
        <button
          onClick={() => {
            if (!audioCtxRef.current) {
              const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioCtx) {
                audioCtxRef.current = new AudioCtx();
                setAudioEnabled(true);
              }
            }
          }}
          className="absolute top-3 right-3 px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 rounded text-[11px] font-mono text-cyan-300 backdrop-blur"
        >
          🔊 Enable Audio FX
        </button>
      )}
    </div>
  );
};
