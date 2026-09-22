import React from 'react';
import { ActivePowerUp, PowerUpType } from '../game/types';
import { Zap, Shield, Clock, Magnet, Flame, Disc } from 'lucide-react';
import { cn } from '../lib/utils';

interface PowerUpTrayProps {
  activePowerUps: ActivePowerUp[];
}

const POWERUP_METADATA: Record<PowerUpType, { label: string; icon: React.ReactNode; color: string; border: string }> = {
  multi_ball: {
    label: 'TRI-PHOTON',
    icon: <Disc className="w-3.5 h-3.5" />,
    color: 'text-cyan-300 bg-cyan-950/70',
    border: 'border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.35)]',
  },
  laser: {
    label: 'LASER CANNONS',
    icon: <Zap className="w-3.5 h-3.5" />,
    color: 'text-rose-300 bg-rose-950/70',
    border: 'border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)]',
  },
  wide_paddle: {
    label: 'SHIELD EXPANSION',
    icon: <Shield className="w-3.5 h-3.5" />,
    color: 'text-emerald-300 bg-emerald-950/70',
    border: 'border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.35)]',
  },
  slow_mo: {
    label: 'CHRONO FIELD',
    icon: <Clock className="w-3.5 h-3.5" />,
    color: 'text-violet-300 bg-violet-950/70',
    border: 'border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.35)]',
  },
  magnetic: {
    label: 'TRACTOR CLAMP',
    icon: <Magnet className="w-3.5 h-3.5" />,
    color: 'text-amber-300 bg-amber-950/70',
    border: 'border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.35)]',
  },
  explosive: {
    label: 'PLASMA BURST',
    icon: <Flame className="w-3.5 h-3.5" />,
    color: 'text-fuchsia-300 bg-fuchsia-950/70',
    border: 'border-fuchsia-500/50 shadow-[0_0_12px_rgba(217,70,239,0.35)]',
  },
};

export const PowerUpTray: React.FC<PowerUpTrayProps> = ({ activePowerUps }) => {
  if (activePowerUps.length === 0) return null;

  const now = Date.now();

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center py-1">
      {activePowerUps.map((p) => {
        const meta = POWERUP_METADATA[p.type];
        if (!meta) return null;

        const remainingMs = Math.max(0, p.expiresAt - now);
        const remainingSec = (remainingMs / 1000).toFixed(1);
        const pct = Math.max(0, Math.min(100, (remainingMs / p.totalDuration) * 100));

        return (
          <div
            key={p.type}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md transition-all font-mono text-xs font-semibold relative overflow-hidden",
              meta.color,
              meta.border
            )}
          >
            {/* Background depletion bar */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white/10 transition-all pointer-events-none"
              style={{ width: `${pct}%` }}
            />
            
            <span className="relative z-10 flex items-center gap-1">
              {meta.icon}
              <span>{meta.label}</span>
            </span>

            <span className="relative z-10 text-[10px] tabular-nums font-bold opacity-80 pl-1 border-l border-white/20">
              {remainingSec}s
            </span>
          </div>
        );
      })}
    </div>
  );
};
