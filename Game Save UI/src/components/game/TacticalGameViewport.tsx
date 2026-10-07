import React, { useEffect, useState, useCallback } from 'react';
import type { GameSavePayload, PlayerProgressSummary } from '../../types/save';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { sfx } from '../../sounds/sfx';
import {
  Crosshair,
  Shield,
  Zap,
  Sword,
  Heart,
  Coins,
  MapPin,
  Camera,
  Sparkles
} from 'lucide-react';

interface TacticalGameViewportProps {
  activeSavePayload: GameSavePayload;
  onQuickSave: (canvas: HTMLCanvasElement | null) => void;
  onManualSave: (canvas: HTMLCanvasElement | null) => void;
  onQuickLoad: () => void;
  onUpdatePlayer: (summaryUpdate: Partial<PlayerProgressSummary>, worldUpdate?: Record<string, any>) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const TacticalGameViewport: React.FC<TacticalGameViewportProps> = ({
  activeSavePayload,
  onQuickSave,
  onManualSave,
  onQuickLoad,
  onUpdatePlayer,
  canvasRef
}) => {
  const summary = activeSavePayload.metadata.summary;
  const worldState = activeSavePayload.worldState;
  const [combatLog, setCombatLog] = useState<string[]>([
    'SYSTEM INITIALIZED: Neural link calibrated to Operative Kaelen-07.',
    'SECURITY PATROL DETECTED: Sector telemetry online.'
  ]);
  const [operativePos, setOperativePos] = useState({ x: 160, y: 110 });
  const [dronePos, setDronePos] = useState({ x: 260, y: 70 });
  const [isFiring, setIsFiring] = useState(false);

  // Keyboard shortcuts [F5] and [F9]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        onQuickSave(canvasRef.current);
      } else if (e.key === 'F9') {
        e.preventDefault();
        onQuickLoad();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onQuickSave, onQuickLoad, canvasRef]);

  // Live Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Biome Background
      const biome = (worldState.biome as string) || 'orbital_colony';
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      if (biome === 'cryo_vault') {
        grad.addColorStop(0, '#040d1a');
        grad.addColorStop(1, '#071626');
      } else if (biome === 'deep_trench') {
        grad.addColorStop(0, '#021213');
        grad.addColorStop(1, '#03080e');
      } else if (biome === 'neon_city') {
        grad.addColorStop(0, '#0b0d19');
        grad.addColorStop(1, '#111322');
      } else {
        // orbital_colony
        grad.addColorStop(0, '#0d0b1a');
        grad.addColorStop(1, '#080c18');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 2. Horizon Perspective Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      const horizonY = h * 0.62;
      for (let x = -w; x < w * 2; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x + (tick % 32), horizonY);
        ctx.lineTo((x - w / 2) * 2.5 + w / 2, h);
        ctx.stroke();
      }
      for (let y = horizonY; y < h; y += 14) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 3. Cybernetic Backdrop Structures & Holograms
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(30, horizonY - 45, 45, 45);
      ctx.fillRect(95, horizonY - 60, 40, 60);
      ctx.fillRect(190, horizonY - 75, 55, 75);
      ctx.fillRect(270, horizonY - 50, 35, 50);

      // Pulsing Neon Window Lines on Buildings
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.beginPath();
      ctx.moveTo(105, horizonY - 50);
      ctx.lineTo(125, horizonY - 50);
      ctx.moveTo(200, horizonY - 60);
      ctx.lineTo(235, horizonY - 60);
      ctx.stroke();

      // Atmospheric Dust Particles
      for (let i = 0; i < 15; i++) {
        const px = ((i * 37 + tick * 0.8) % w);
        const py = ((i * 23 + Math.sin(tick * 0.05 + i) * 20 + 30) % h);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(168, 85, 247, 0.4)';
        ctx.fillRect(px, py, 1.5, 1.5);
      }

      // 4. Enemy Recon Drone (Hovering)
      const droneY = dronePos.y + Math.sin(tick * 0.08) * 8;
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      // Drone Chassis
      ctx.beginPath();
      ctx.ellipse(dronePos.x, droneY, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Scanner Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dronePos.x - 4, droneY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Scanning Cone
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.beginPath();
      ctx.moveTo(dronePos.x, droneY);
      ctx.lineTo(dronePos.x - 35, h * 0.85);
      ctx.lineTo(dronePos.x + 35, h * 0.85);
      ctx.closePath();
      ctx.fill();

      // 5. Operative Character (Kaelen-07)
      const opX = operativePos.x;
      const opY = operativePos.y;

      // Character Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(opX, opY + 28, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Operative Glow Aura
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      // Head / Tactical Visor
      ctx.beginPath();
      ctx.arc(opX, opY, 5, 0, Math.PI * 2);
      ctx.fill();
      // Visor Glint
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(opX + 1, opY - 1, 3, 2);

      // Torso / Tactical Exosuit
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(opX - 4, opY + 5, 8, 12);
      // Chest Conduit
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(opX - 1, opY + 7, 2, 6);

      // Weapon
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(opX + 4, opY + 9, 8, 3);
      ctx.shadowBlur = 0;

      // Laser Pointer
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(opX + 12, opY + 10);
      ctx.lineTo(dronePos.x, droneY);
      ctx.stroke();

      // Muzzle Flash / Laser Bolt when firing
      if (isFiring) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(opX + 14, opY + 10, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(opX + 14, opY + 10);
        ctx.lineTo(dronePos.x, droneY);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // HUD Watermark in Viewport
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`CAM // REC-LIVE [${summary.characterName}]`, 12, 20);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.fillText(`${summary.currentLocation}`, 12, 32);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [worldState, summary, operativePos, dronePos, isFiring, canvasRef]);

  // Interactive In-Game Actions
  const handleAttackDrone = useCallback(() => {
    setIsFiring(true);
    sfx.playClick();
    setTimeout(() => setIsFiring(false), 140);

    const goldGained = Math.floor(Math.random() * 250) + 120;
    const newGold = summary.gold + goldGained;
    const newCompletion = Math.min(100, summary.completionPercentage + 1);

    // Minor damage taken / defensive retaliation
    const damageTaken = Math.floor(Math.random() * 40) + 15;
    const newHp = Math.max(120, summary.hp - damageTaken);

    onUpdatePlayer({
      gold: newGold,
      completionPercentage: newCompletion,
      hp: newHp
    });

    setCombatLog(prev => [
      `TARGET ENGAGED: Discharged plasma burst against Sentinel Drone (+${goldGained} CREDITS).`,
      `SHIELD FLUX: Deflected counter-fire (-${damageTaken} HP).`,
      ...prev.slice(0, 4)
    ]);

    // Relocate drone
    setDronePos({
      x: Math.floor(Math.random() * 80) + 220,
      y: Math.floor(Math.random() * 40) + 50
    });
  }, [summary, onUpdatePlayer]);

  const handleUseMedkit = useCallback(() => {
    sfx.playSyncSuccess();
    const healAmount = 180;
    const healedHp = Math.min(summary.maxHp, summary.hp + healAmount);
    onUpdatePlayer({ hp: healedHp });
    setCombatLog(prev => [
      `NANITE INJECTION: Consumed Medkit. Restored +${healAmount} HP.`,
      ...prev.slice(0, 4)
    ]);
  }, [summary, onUpdatePlayer]);

  const handleNextBiome = useCallback(() => {
    sfx.playClick();
    const biomes = ['orbital_colony', 'cryo_vault', 'deep_trench', 'neon_city'] as const;
    const currentBiome = (worldState.biome as string) || 'orbital_colony';
    const nextIdx = (biomes.indexOf(currentBiome as any) + 1) % biomes.length;
    const nextBiome = biomes[nextIdx];

    const locationNames: Record<string, { loc: string; chap: string }> = {
      orbital_colony: { loc: 'Orbital Spire // Relay Deck 4', chap: 'Act III: Shattered Zenith' },
      cryo_vault: { loc: 'Sector Zero Cryo-Archive', chap: 'Act III: Memory Awakening' },
      deep_trench: { loc: 'Sub-Abyssal Cryo-Lab', chap: 'Act II: Hadal Trench' },
      neon_city: { loc: 'Neo-Shinjuku Slums Underbelly', chap: 'Act I: Neon Fugitive' }
    };

    const target = locationNames[nextBiome];
    onUpdatePlayer(
      {
        currentLocation: target.loc,
        currentChapter: target.chap
      },
      { biome: nextBiome }
    );

    setCombatLog(prev => [
      `TACTICAL TRANSITION: Deployed to [${target.loc}].`,
      ...prev.slice(0, 4)
    ]);
  }, [worldState, onUpdatePlayer]);

  return (
    <div className="w-full bg-[#0D121F]/90 border border-[#1E293B] rounded-xl p-4 shadow-2xl relative overflow-hidden">
      {/* Top Ambient Glow Conduit */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/80 via-indigo-500/80 to-purple-500/80" />

      {/* Viewport Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Crosshair size={18} className="animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                ACTIVE GAME SIMULATOR
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                60 FPS STREAM
              </span>
            </div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              {summary.characterName}
              <span className="text-xs font-mono font-normal text-slate-400">
                [LVL {summary.level}]
              </span>
            </h2>
          </div>
        </div>

        {/* Viewport Telemetry Quick Badges */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-rose-400">
            <Heart size={14} />
            <span>
              {summary.hp} / {summary.maxHp} HP
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <Coins size={14} />
            <span>{summary.gold.toLocaleString()} CR</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-cyan-400">
            <MapPin size={14} />
            <span className="truncate max-w-[140px]">{summary.currentLocation}</span>
          </div>
        </div>
      </div>

      {/* Main Viewport Split: Canvas on Left, Interactive Controls & Log on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: The 320x180 Scaled Tactical Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black group shadow-lg">
            <canvas
              ref={canvasRef}
              width={320}
              height={180}
              className="w-full h-full object-cover select-none cursor-crosshair scanlines"
              onClick={handleAttackDrone}
            />

            {/* Viewport Overlay Hotkey Badges */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
              <button
                onClick={() => onQuickSave(canvasRef.current)}
                className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-black/70 border border-amber-500/60 text-amber-300 hover:bg-amber-500/20 backdrop-blur transition-colors cursor-pointer"
              >
                [F5] QUICK SAVE
              </button>
              <button
                onClick={onQuickLoad}
                className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-black/70 border border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/20 backdrop-blur transition-colors cursor-pointer"
              >
                [F9] QUICK LOAD
              </button>
            </div>

            {/* Camera Snapshot Flash Indicator */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 border border-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-1">
              <Camera size={11} className="text-cyan-400" />
              <span>320x180 LIVE DIORAMA</span>
            </div>
          </div>

          {/* Quick HUD Progress Meter */}
          <div className="w-full mt-2 flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>STORY PROGRESS:</span>
            <Progress value={summary.completionPercentage} color="cyan" className="flex-1" />
            <span className="text-cyan-400 font-bold">{summary.completionPercentage}%</span>
          </div>
        </div>

        {/* Right: Tactile Simulation Controls & Telemetry Stream */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="amber"
              size="sm"
              onClick={handleAttackDrone}
              className="w-full flex items-center gap-1.5 py-2"
            >
              <Sword size={13} />
              <span>FIRE PLASMA MK-IV</span>
            </Button>

            <Button
              variant="emerald"
              size="sm"
              onClick={handleUseMedkit}
              className="w-full flex items-center gap-1.5 py-2"
            >
              <Shield size={13} />
              <span>INJECT NANITE MED</span>
            </Button>

            <Button
              variant="violet"
              size="sm"
              onClick={handleNextBiome}
              className="w-full flex items-center gap-1.5 py-2"
            >
              <Zap size={13} />
              <span>JUMP BIOME SECTOR</span>
            </Button>

            <Button
              variant="cyan"
              size="sm"
              onClick={() => onManualSave(canvasRef.current)}
              className="w-full flex items-center gap-1.5 py-2"
            >
              <Sparkles size={13} />
              <span>COMMIT CHECKPOINT</span>
            </Button>
          </div>

          {/* Combat / Telemetry Terminal Log */}
          <div className="bg-[#07090E]/90 border border-slate-800/80 rounded-lg p-2.5 flex-1 min-h-[90px] font-mono text-[11px] flex flex-col justify-end space-y-1 overflow-hidden">
            <div className="text-[10px] text-slate-500 uppercase font-semibold border-b border-slate-800 pb-1 mb-1 flex items-center justify-between">
              <span>TACTICAL STREAM FEED</span>
              <span className="text-cyan-400">NEURAL ARCHIVE ACTIVE</span>
            </div>
            {combatLog.map((line, idx) => (
              <div
                key={idx}
                className={idx === 0 ? 'text-cyan-300 font-semibold' : 'text-slate-400'}
              >
                <span className="text-slate-600 mr-1">&gt;</span>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
