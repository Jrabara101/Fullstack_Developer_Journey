import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  EntityState,
  PlayerInputPacket,
  KeyframeSnapshot,
  INPUT_BITS,
  ReplaySessionState,
  EventCategory
} from '../types/replay';

interface CyberArenaGameProps {
  sessionState: ReplaySessionState;
  interpolatedEntities: EntityState[];
  ghostEntities: EntityState[];
  currentInput: PlayerInputPacket | null;
  onRecordTick: (input: PlayerInputPacket, snapshot?: KeyframeSnapshot) => void;
  onAddMarker: (category: EventCategory, label: string) => void;
  canvasRefOut?: React.RefObject<HTMLCanvasElement>;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface GameHazard {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  radius: number;
}

interface CheckpointRing {
  id: string;
  x: number;
  y: number;
  radius: number;
  passed: boolean;
}

export const CyberArenaGame: React.FC<CyberArenaGameProps> = ({
  sessionState,
  interpolatedEntities,
  ghostEntities,
  currentInput,
  onRecordTick,
  onAddMarker,
  canvasRefOut
}) => {
  const localCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = canvasRefOut || localCanvasRef;

  // Active inputs bitmask held in ref
  const currentKeyMaskRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 600, y: 400 });

  // Live game simulation state
  const liveTickRef = useRef<number>(0);
  const playerRef = useRef({
    x: 300,
    y: 400,
    vx: 0,
    vy: 0,
    angle: 0,
    shield: 100,
    score: 0,
    boostEnergy: 100
  });

  const hazardsRef = useRef<GameHazard[]>([
    { id: 'sentinel_1', x: 650, y: 300, vx: 1.5, vy: 1.0, hp: 100, maxHp: 100, radius: 22 },
    { id: 'sentinel_2', x: 850, y: 550, vx: -1.2, vy: 1.8, hp: 100, maxHp: 100, radius: 22 },
    { id: 'sentinel_3', x: 1050, y: 350, vx: 0.8, vy: -1.5, hp: 120, maxHp: 120, radius: 26 }
  ]);

  const checkpointsRef = useRef<CheckpointRing[]>([
    { id: 'gate_1', x: 500, y: 400, radius: 36, passed: false },
    { id: 'gate_2', x: 800, y: 250, radius: 36, passed: false },
    { id: 'gate_3', x: 1050, y: 500, radius: 36, passed: false }
  ]);

  const bulletsRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number }[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Key event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing into an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      let mask = currentKeyMaskRef.current;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') mask |= INPUT_BITS.UP;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') mask |= INPUT_BITS.DOWN;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') mask |= INPUT_BITS.LEFT;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') mask |= INPUT_BITS.RIGHT;
      if (e.code === 'Space') mask |= INPUT_BITS.BOOST;
      if (e.code === 'ShiftLeft' || e.code === 'KeyE') {
        mask |= INPUT_BITS.ABILITY;
        // Trigger Sonic Dash ability event
        if (sessionState.status === 'RECORDING') {
          onAddMarker('ability', 'Sonic Dash Burst');
        }
      }

      currentKeyMaskRef.current = mask;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      let mask = currentKeyMaskRef.current;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') mask &= ~INPUT_BITS.UP;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') mask &= ~INPUT_BITS.DOWN;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') mask &= ~INPUT_BITS.LEFT;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') mask &= ~INPUT_BITS.RIGHT;
      if (e.code === 'Space') mask &= ~INPUT_BITS.BOOST;
      if (e.code === 'ShiftLeft' || e.code === 'KeyE') mask &= ~INPUT_BITS.ABILITY;

      currentKeyMaskRef.current = mask;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [sessionState.status, onAddMarker]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mousePosRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      currentKeyMaskRef.current |= INPUT_BITS.FIRE;

      // Fire projectile in live mode
      if (sessionState.status === 'RECORDING') {
        const p = playerRef.current;
        const dx = mousePosRef.current.x - p.x;
        const dy = mousePosRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 900;

        bulletsRef.current.push({
          x: p.x + (dx / dist) * 20,
          y: p.y + (dy / dist) * 20,
          vx: (dx / dist) * speed,
          vy: (dy / dist) * speed,
          life: 55
        });

        // Spawn firing muzzle flash particles
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 80 + (dx / dist) * 120,
            vy: (Math.random() - 0.5) * 80 + (dy / dist) * 120,
            color: '#38BDF8',
            size: Math.random() * 3 + 1,
            life: 12,
            maxLife: 12
          });
        }
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      currentKeyMaskRef.current &= ~INPUT_BITS.FIRE;
    }
  };

  // Main 60Hz Render & Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear with obsidian void
      ctx.fillStyle = '#07090E';
      ctx.fillRect(0, 0, width, height);

      // Draw Tactical Holographic Background Grid
      drawArenaGrid(ctx, width, height);

      const isLiveRecording = sessionState.status === 'RECORDING';

      if (isLiveRecording) {
        // -------------------------------------------------------------
        // LIVE SIMULATION & TELEMETRY STREAMING
        // -------------------------------------------------------------
        const dt = 1 / 60;
        liveTickRef.current += 1;
        const tick = liveTickRef.current;
        const mask = currentKeyMaskRef.current;
        const p = playerRef.current;

        // Kinematics
        let ax = 0;
        let ay = 0;
        if (mask & INPUT_BITS.UP) ay -= 1;
        if (mask & INPUT_BITS.DOWN) ay += 1;
        if (mask & INPUT_BITS.LEFT) ax -= 1;
        if (mask & INPUT_BITS.RIGHT) ax += 1;

        const len = Math.sqrt(ax * ax + ay * ay);
        if (len > 0) {
          ax /= len;
          ay /= len;
        }

        const isBoosting = (mask & INPUT_BITS.BOOST) !== 0 && p.boostEnergy > 5;
        const accel = 1200 * (isBoosting ? 1.5 : 1.0);
        const maxSpd = isBoosting ? 780 : 420;

        if (isBoosting) {
          p.boostEnergy = Math.max(0, p.boostEnergy - 0.8);
          // Boost particles
          particlesRef.current.push({
            x: p.x - Math.cos(p.angle) * 16 + (Math.random() - 0.5) * 8,
            y: p.y - Math.sin(p.angle) * 16 + (Math.random() - 0.5) * 8,
            vx: -p.vx * 0.3 + (Math.random() - 0.5) * 40,
            vy: -p.vy * 0.3 + (Math.random() - 0.5) * 40,
            color: '#38BDF8',
            size: Math.random() * 4 + 2,
            life: 20,
            maxLife: 20
          });
        } else {
          p.boostEnergy = Math.min(100, p.boostEnergy + 0.3);
        }

        p.vx += ax * accel * dt;
        p.vy += ay * accel * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > maxSpd) {
          p.vx = (p.vx / spd) * maxSpd;
          p.vy = (p.vy / spd) * maxSpd;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Clamp arena boundaries
        p.x = Math.max(30, Math.min(width - 30, p.x));
        p.y = Math.max(30, Math.min(height - 30, p.y));

        // Aim angle towards cursor
        const dx = mousePosRef.current.x - p.x;
        const dy = mousePosRef.current.y - p.y;
        p.angle = Math.atan2(dy, dx);

        // Update Bullets
        for (let b = bulletsRef.current.length - 1; b >= 0; b--) {
          const bullet = bulletsRef.current[b];
          bullet.x += bullet.vx * dt;
          bullet.y += bullet.vy * dt;
          bullet.life--;

          // Bullet vs Hazards collision
          for (const h of hazardsRef.current) {
            const hdx = bullet.x - h.x;
            const hdy = bullet.y - h.y;
            if (Math.sqrt(hdx * hdx + hdy * hdy) < h.radius) {
              h.hp -= 35;
              bullet.life = 0;

              // Bullet impact explosion
              for (let i = 0; i < 8; i++) {
                particlesRef.current.push({
                  x: bullet.x,
                  y: bullet.y,
                  vx: (Math.random() - 0.5) * 160,
                  vy: (Math.random() - 0.5) * 160,
                  color: '#F59E0B',
                  size: Math.random() * 3 + 1,
                  life: 18,
                  maxLife: 18
                });
              }

              if (h.hp <= 0 && h.hp + 35 > 0) {
                // Sentry eliminated! Milestone trigger!
                onAddMarker('kill', `Sentry Drone Neutralized (+500pts)`);
                p.score += 500;
              }
            }
          }

          if (bullet.life <= 0 || bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height) {
            bulletsRef.current.splice(b, 1);
          }
        }

        // Update Hazards Patrol
        for (const h of hazardsRef.current) {
          h.x += h.vx;
          h.y += h.vy;
          if (h.x < 100 || h.x > width - 100) h.vx *= -1;
          if (h.y < 100 || h.y > height - 100) h.vy *= -1;

          // Check player hazard collision
          const pdx = p.x - h.x;
          const pdy = p.y - h.y;
          if (Math.sqrt(pdx * pdx + pdy * pdy) < h.radius + 18 && h.hp > 0) {
            p.shield = Math.max(0, p.shield - 0.4);
            if (p.shield === 0) {
              onAddMarker('death', 'Shield Overload Failure');
              p.shield = 100; // Reset for continuous play
            }
          }
        }

        // Update Checkpoints
        for (const cp of checkpointsRef.current) {
          const cdx = p.x - cp.x;
          const cdy = p.y - cp.y;
          if (!cp.passed && Math.sqrt(cdx * cdx + cdy * cdy) < cp.radius) {
            cp.passed = true;
            onAddMarker('checkpoint', `Sector Gate ${cp.id.toUpperCase()} Cleared`);
            // Flash particles
            for (let i = 0; i < 20; i++) {
              particlesRef.current.push({
                x: cp.x,
                y: cp.y,
                vx: Math.cos((i / 20) * Math.PI * 2) * 120,
                vy: Math.sin((i / 20) * Math.PI * 2) * 120,
                color: '#10B981',
                size: 3,
                life: 30,
                maxLife: 30
              });
            }
          }
        }

        // Emit Input Packet
        const inputPacket: PlayerInputPacket = {
          tick,
          dt,
          keys: mask,
          cursor: { x: mousePosRef.current.x, y: mousePosRef.current.y }
        };

        // Emit Keyframe Snapshot (every 60 ticks = 1s)
        let keyframe: KeyframeSnapshot | undefined = undefined;
        if (tick % 60 === 0) {
          keyframe = {
            tick,
            timestampMs: Math.round((tick / 60) * 1000),
            entities: [
              {
                id: 'player_drone',
                type: 'player',
                pos: { x: p.x, y: p.y },
                velocity: { x: p.vx, y: p.vy },
                stateFlags: isBoosting ? 1 : 0,
                rotation: p.angle,
                health: p.shield
              },
              ...hazardsRef.current.map(h => ({
                id: h.id,
                type: 'hazard',
                pos: { x: h.x, y: h.y },
                velocity: { x: h.vx, y: h.vy },
                stateFlags: h.hp > 0 ? 1 : 0,
                health: h.hp
              }))
            ]
          };
        }

        onRecordTick(inputPacket, keyframe);

        // Draw Live Elements
        drawCheckpoints(ctx, checkpointsRef.current);
        drawBullets(ctx, bulletsRef.current);
        drawHazards(ctx, hazardsRef.current);
        drawPlayerDrone(ctx, p.x, p.y, p.angle, isBoosting, '#38BDF8', 1.0);

      } else {
        // -------------------------------------------------------------
        // PLAYBACK MODE (INTERPOLATED ENTITIES & GHOST SIMULATION)
        // -------------------------------------------------------------
        drawCheckpoints(ctx, checkpointsRef.current);

        // Render Primary Playback Entities
        for (const ent of interpolatedEntities) {
          if (ent.type === 'player') {
            const isBoost = (ent.stateFlags & 1) !== 0;
            const angle = ent.rotation !== undefined ? ent.rotation : Math.atan2(ent.velocity.y, ent.velocity.x);
            drawPlayerDrone(ctx, ent.pos.x, ent.pos.y, angle, isBoost, '#38BDF8', 1.0);
          } else if (ent.type === 'hazard') {
            drawHazardDrone(ctx, ent.pos.x, ent.pos.y, 22, ent.health ?? 100, 1.0);
          }
        }

        // Render Ghost Echo Comparative Layer (if loaded and enabled)
        if (sessionState.isGhostEnabled && ghostEntities.length > 0) {
          for (const gEnt of ghostEntities) {
            if (gEnt.type === 'player') {
              const angle = gEnt.rotation !== undefined ? gEnt.rotation : Math.atan2(gEnt.velocity.y, gEnt.velocity.x);
              // Draw Translucent Ghost with Glowing Trail
              drawPlayerDrone(ctx, gEnt.pos.x, gEnt.pos.y, angle, false, '#06B6D4', 0.45);
              drawGhostMarkerBadge(ctx, gEnt.pos.x, gEnt.pos.y, 'GHOST RUN');
            }
          }
        }
      }

      // Draw Particles
      drawParticles(ctx, particlesRef.current);

      // On-Canvas Virtual Telemetry HUD (Keypress Display)
      const displayKeys = isLiveRecording
        ? currentKeyMaskRef.current
        : currentInput?.keys ?? 0;
      drawVirtualInputHUD(ctx, displayKeys, mousePosRef.current);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [sessionState.status, sessionState.isGhostEnabled, interpolatedEntities, ghostEntities, currentInput, onRecordTick, onAddMarker]);

  // -------------------------------------------------------------
  // Canvas Rendering Sub-Routines
  // -------------------------------------------------------------

  function drawArenaGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
    ctx.lineWidth = 1;

    const gridSize = 60;
    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Radar Concentric Calibration Circles in Center
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 180, 0, Math.PI * 2);
    ctx.arc(width / 2, height / 2, 340, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayerDrone(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    boosting: boolean,
    color: string,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Engine Exhaust Flame
    ctx.fillStyle = boosting ? '#38BDF8' : '#0EA5E9';
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.lineTo(-28 - (boosting ? 12 : 4), 0);
    ctx.lineTo(-16, 6);
    ctx.closePath();
    ctx.fill();

    // Drone Chassis Body
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(20, 0);   // Nose
    ctx.lineTo(-14, -14); // Left Wing
    ctx.lineTo(-8, 0);   // Core Indent
    ctx.lineTo(-14, 14);  // Right Wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Cockpit Core
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(2, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawHazards(ctx: CanvasRenderingContext2D, hazards: GameHazard[]) {
    for (const h of hazards) {
      if (h.hp <= 0) continue;
      drawHazardDrone(ctx, h.x, h.y, h.radius, h.hp, 1.0);
    }
  }

  function drawHazardDrone(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    hp: number,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);

    // Hazard Orb Outer Ring
    ctx.strokeStyle = hp > 40 ? '#F43F5E' : '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Core
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
    ctx.fill();

    // Spikes
    ctx.strokeStyle = '#F43F5E';
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(radius - 2, 0);
      ctx.lineTo(radius + 7, 0);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawCheckpoints(ctx: CanvasRenderingContext2D, checkpoints: CheckpointRing[]) {
    for (const cp of checkpoints) {
      ctx.save();
      ctx.strokeStyle = cp.passed ? '#10B981' : '#64748B';
      ctx.lineWidth = 2.5;
      ctx.setLineDash(cp.passed ? [] : [6, 6]);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, cp.radius, 0, Math.PI * 2);
      ctx.stroke();

      if (cp.passed) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawBullets(ctx: CanvasRenderingContext2D, bullets: { x: number; y: number }[]) {
    ctx.save();
    ctx.fillStyle = '#38BDF8';
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 8;
    for (const b of bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    ctx.save();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      p.life--;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGhostMarkerBadge(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string
  ) {
    ctx.save();
    ctx.font = '10px JetBrains Mono';
    ctx.fillStyle = '#06B6D4';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - 24);
    ctx.restore();
  }

  function drawVirtualInputHUD(
    ctx: CanvasRenderingContext2D,
    keys: number,
    cursor: { x: number; y: number }
  ) {
    ctx.save();
    const hudX = 24;
    const hudY = 670;

    // Background panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.roundRect(hudX, hudY, 210, 96, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = '10px JetBrains Mono';
    ctx.fillStyle = '#64748B';
    ctx.fillText('FRAME BITMASK TELEMETRY', hudX + 12, hudY + 16);

    const renderKeyBox = (
      label: string,
      x: number,
      y: number,
      w: number,
      h: number,
      active: boolean
    ) => {
      ctx.fillStyle = active ? '#38BDF8' : '#1E293B';
      ctx.roundRect(x, y, w, h, 4);
      ctx.fill();

      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillStyle = active ? '#07090E' : '#94A3B8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + h / 2);
    };

    // Keys Layout:
    //      [W]
    //   [A][S][D]
    renderKeyBox('W', hudX + 38, hudY + 24, 22, 22, (keys & INPUT_BITS.UP) !== 0);
    renderKeyBox('A', hudX + 12, hudY + 50, 22, 22, (keys & INPUT_BITS.LEFT) !== 0);
    renderKeyBox('S', hudX + 38, hudY + 50, 22, 22, (keys & INPUT_BITS.DOWN) !== 0);
    renderKeyBox('D', hudX + 64, hudY + 50, 22, 22, (keys & INPUT_BITS.RIGHT) !== 0);

    // Modifiers: [BOOST] [FIRE] [DASH]
    renderKeyBox('SPC', hudX + 96, hudY + 24, 48, 22, (keys & INPUT_BITS.BOOST) !== 0);
    renderKeyBox('FIRE', hudX + 150, hudY + 24, 48, 22, (keys & INPUT_BITS.FIRE) !== 0);
    renderKeyBox('DASH', hudX + 96, hudY + 50, 102, 22, (keys & INPUT_BITS.ABILITY) !== 0);

    // Coordinates string
    ctx.textAlign = 'left';
    ctx.font = '9px JetBrains Mono';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`AIM: (${Math.round(cursor.x)}, ${Math.round(cursor.y)})`, hudX + 12, hudY + 86);

    ctx.restore();
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#07090E] overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1280}
        height={780}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`w-full max-w-[1280px] h-auto aspect-[16/9.75] rounded-xl border border-slate-800 shadow-2xl transition-all duration-300 ${
          sessionState.playbackSpeed < 1.0 && sessionState.status === 'SLOW_MO'
            ? 'slowmo-vignette border-cyan-500/50'
            : ''
        }`}
      />
    </div>
  );
};
