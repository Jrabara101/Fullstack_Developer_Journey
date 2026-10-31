import React, { useState, useEffect, useRef } from 'react';

export const SweptAabbCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'discrete' | 'continuous'>('continuous');
  const [velocitySpeed, setVelocitySpeed] = useState<number>(36); // pixels per step

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 560;
    const height = 220;
    canvas.width = width;
    canvas.height = height;

    let animId: number;
    let projX = 40;
    const projY = 90;
    const projW = 24;
    const projH = 24;

    const wallX = 320;
    const wallY = 40;
    const wallW = 10; // Thin 10px steel barrier
    const wallH = 140;

    let tunneled = false;
    let collisionImpact = false;

    const render = () => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Thin Barrier
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(wallX, wallY, wallW, wallH);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText('10px Thin Wall', wallX - 30, wallY - 10);

      // Advance Projectile
      const nextX = projX + velocitySpeed;

      if (mode === 'discrete') {
        // Discrete Step (v0.4 bug): checks overlap only at start and end of frame
        const currentOverlap = projX < wallX + wallW && projX + projW > wallX;
        const nextOverlap = nextX < wallX + wallW && nextX + projW > wallX;

        if (projX < wallX && nextX > wallX + wallW && !currentOverlap && !nextOverlap) {
          // Tunneling occurred!
          tunneled = true;
          collisionImpact = false;
        } else if (nextOverlap) {
          collisionImpact = true;
        }

        projX = nextX;
      } else {
        // Continuous Swept AABB (v0.5 solution): calculates entry fraction t in [0, 1]
        const invEntry = wallX - (projX + projW);
        const invExit = (wallX + wallW) - projX;

        const tEntry = invEntry / velocitySpeed;
        const tExit = invExit / velocitySpeed;

        if (tEntry >= 0 && tEntry <= 1) {
          // Swept hit confirmed! Clamp at wall edge
          projX = projX + velocitySpeed * tEntry;
          collisionImpact = true;
          tunneled = false;
        } else {
          projX = nextX;
        }
      }

      // Draw Swept Ghost Volume (v0.5)
      if (mode === 'continuous') {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(projX - velocitySpeed, projY, velocitySpeed + projW, projH);
        ctx.setLineDash([]);
      }

      // Draw Projectile
      ctx.save();
      ctx.fillStyle = tunneled ? '#f43f5e' : collisionImpact ? '#f59e0b' : '#38bdf8';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fillRect(projX, projY, projW, projH);
      ctx.restore();

      // Telemetry Status Display
      ctx.font = '11px monospace';
      if (tunneled) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('❌ TUNNELING DETECTED: Projectile skipped barrier cleanly!', 20, height - 20);
      } else if (collisionImpact) {
        ctx.fillStyle = '#10b981';
        ctx.fillText('✔ SWEPT CONTACT CLAMPED: Impact registered at entry normal (t ∈ [0,1])', 20, height - 20);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Air-Dash Velocity: ${(velocitySpeed * 60).toFixed(0)} px/sec (Step: ${velocitySpeed}px)`, 20, height - 20);
      }

      // Reset when offscreen
      if (projX > width) {
        projX = 40;
        tunneled = false;
        collisionImpact = false;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [mode, velocitySpeed]);

  return (
    <div className="my-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
            Live Simulation Widget
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-300">Continuous Swept AABB Solver</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('discrete')}
            className={`px-3 py-1 rounded text-xs font-mono transition-all ${
              mode === 'discrete'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Discrete Step (v0.4 Bug)
          </button>
          <button
            onClick={() => setMode('continuous')}
            className={`px-3 py-1 rounded text-xs font-mono transition-all ${
              mode === 'continuous'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Continuous Swept (v0.5 Fix)
          </button>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-slate-800 flex justify-center bg-black">
        <canvas ref={canvasRef} className="w-full max-w-[560px] aspect-[560/220]" />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Step Speed: {velocitySpeed}px / frame</span>
        <input
          type="range"
          min="12"
          max="64"
          value={velocitySpeed}
          onChange={(e) => setVelocitySpeed(Number(e.target.value))}
          className="w-48 accent-cyan-400"
        />
        <span className="text-[11px] text-slate-500">Drag slider to test higher sub-step velocities</span>
      </div>
    </div>
  );
};
