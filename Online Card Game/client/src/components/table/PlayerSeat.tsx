import React from 'react';
import { TablePlayer } from '../../types/game.js';
import { Avatar } from '../ui/Avatar.js';
import { Badge } from '../ui/Badge.js';
import { Crown, Bot, Layers, Coins } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface PlayerSeatProps {
  player: TablePlayer;
  isCurrentTurn: boolean;
  turnTimeRemainingMs: number;
  totalTurnTimeMs?: number;
  isLocalPlayer?: boolean;
  className?: string;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentTurn,
  turnTimeRemainingMs,
  totalTurnTimeMs = 15000,
  isLocalPlayer = false,
  className
}) => {
  // SVG Ring calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.max(0, Math.min(1, turnTimeRemainingMs / totalTurnTimeMs));
  const strokeDashoffset = circumference - progressRatio * circumference;

  const isUrgent = isCurrentTurn && turnTimeRemainingMs < 5000;

  // Ring color transition
  const getRingColor = () => {
    if (!isCurrentTurn) return '#334155';
    if (turnTimeRemainingMs < 4000) return '#ef233c'; // Crimson warning
    if (turnTimeRemainingMs < 8000) return '#f59e0b'; // Amber warning
    return '#10b981'; // Green active
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center transition-all duration-300',
        isCurrentTurn && 'scale-105',
        player.hasPassed && 'opacity-60 grayscale',
        className
      )}
    >
      {/* Avatar Container with SVG Turn Countdown Ring */}
      <div className="relative flex items-center justify-center p-1">
        {/* SVG Progress Ring */}
        <svg
          className={cn(
            'absolute inset-0 w-full h-full -rotate-90 pointer-events-none',
            isUrgent && 'animate-pulse'
          )}
          viewBox="0 0 68 68"
        >
          {/* Background circle */}
          <circle
            cx="34"
            cy="34"
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth="3.5"
          />
          {/* Animated active turn beam */}
          {isCurrentTurn && (
            <circle
              cx="34"
              cy="34"
              r={radius}
              fill="transparent"
              stroke={getRingColor()}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              style={{
                strokeDashoffset,
                transition: 'stroke-dashoffset 0.4s linear, stroke 0.3s ease'
              }}
            />
          )}
        </svg>

        {/* Player Avatar */}
        <div className="relative m-1.5">
          <Avatar
            src={player.avatarUrl}
            fallback={player.username}
            size="lg"
            className={cn(
              'border-2 shadow-xl transition-all',
              isCurrentTurn
                ? isUrgent
                  ? 'border-red-500 shadow-[0_0_20px_rgba(239,35,60,0.8)]'
                  : 'border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.7)]'
                : 'border-slate-700/80',
              isLocalPlayer && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950'
            )}
          />

          {/* Host Crown */}
          {player.isHost && (
            <div className="absolute -top-2.5 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow-md">
              <Crown className="w-3.5 h-3.5 fill-current" />
            </div>
          )}

          {/* Bot Indicator */}
          {player.isBot && (
            <div className="absolute -bottom-1 -left-1 bg-purple-600 text-white p-1 rounded-full shadow-md">
              <Bot className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {/* Player Meta Info Card */}
      <div className="mt-1 flex flex-col items-center text-center">
        <div className="flex items-center gap-1 max-w-[110px]">
          <span className="text-xs font-bold text-slate-200 truncate drop-shadow">
            {player.username}
          </span>
          {isLocalPlayer && (
            <span className="text-[10px] text-blue-400 font-extrabold">(YOU)</span>
          )}
        </div>

        {/* Badges: Chips & Card Count */}
        <div className="flex items-center gap-1.5 mt-1">
          {/* Chips */}
          <Badge variant="gold" className="px-2 py-0 text-[11px] gap-1 flex items-center font-bold">
            <Coins className="w-3 h-3 text-amber-400" />
            <span>{player.chips}</span>
          </Badge>

          {/* Card Count */}
          <Badge
            variant="secondary"
            className={cn(
              "px-1.5 py-0 text-[10px] gap-1 flex items-center font-mono border border-slate-700/80",
              player.cardCount <= 2 && "bg-rose-950/80 text-rose-300 border-rose-500 animate-pulse font-extrabold"
            )}
          >
            <Layers className="w-2.5 h-2.5 text-slate-400" />
            <span>{player.cardCount}</span>
          </Badge>
        </div>

        {/* Current Turn / Passed Status Banner */}
        {isCurrentTurn ? (
          <span className={cn(
            "text-[10px] uppercase font-black tracking-wider mt-1 px-2 py-0.5 rounded-full shadow-sm",
            isUrgent
              ? "bg-red-500 text-white animate-pulse"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
          )}>
            {isUrgent ? `HURRY! ${(turnTimeRemainingMs / 1000).toFixed(0)}s` : 'THINKING...'}
          </span>
        ) : player.hasPassed ? (
          <span className="text-[9px] uppercase font-bold text-slate-500 mt-1">PASSED</span>
        ) : null}
      </div>
    </div>
  );
};
