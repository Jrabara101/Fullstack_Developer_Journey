import React from 'react';
import { CardGameState, Card } from '../../types/game.js';
import { PlayerSeat } from './PlayerSeat.js';
import { Card3D } from '../3d/Card3D.js';
import { Badge } from '../ui/Badge.js';
import { Coins, Flame, RotateCw, RotateCcw, AlertTriangle, Layers } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface FeltTableArenaProps {
  gameState: CardGameState;
  onDrawCard: () => void;
  onSelectColor?: (color: string) => void;
  className?: string;
}

export const FeltTableArena: React.FC<FeltTableArenaProps> = ({
  gameState,
  onDrawCard,
  className
}) => {
  const {
    activeColor,
    topDiscard,
    drawDeckCount,
    potChips,
    currentAnte,
    currentTurnPlayerId,
    turnTimeRemainingMs,
    players,
    myPlayerId,
    lastAction,
    turnDirection
  } = gameState;

  const isMyTurn = currentTurnPlayerId === myPlayerId;
  const isUrgent = isMyTurn && turnTimeRemainingMs < 5000;

  // Filter opponent players (exclude local player who sits in the bottom Action Dock)
  const opponentPlayers = players.filter(p => p.id !== myPlayerId);

  // Active color halo styling
  const getColorHaloClass = () => {
    switch (activeColor) {
      case 'red': return 'glow-red border-red-500/60 text-red-400';
      case 'blue': return 'glow-blue border-blue-500/60 text-blue-400';
      case 'green': return 'glow-green border-emerald-500/60 text-emerald-400';
      case 'yellow': return 'glow-yellow border-amber-500/60 text-amber-400';
      case 'wild': return 'glow-wild border-purple-500/60 text-purple-400';
    }
  };

  return (
    <div
      className={cn(
        'relative w-full aspect-[16/9] max-h-[580px] rounded-[48px] felt-surface felt-rim p-6 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-500',
        isUrgent && 'ring-8 ring-red-600/70 ring-offset-4 ring-offset-slate-950 animate-pulse-crimson',
        className
      )}
    >
      {/* Dynamic Active Color Outer Ambient Aura */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none rounded-[44px] transition-all duration-700 opacity-30',
          activeColor === 'red' && 'bg-radial-gradient from-red-600/20 to-transparent',
          activeColor === 'blue' && 'bg-radial-gradient from-blue-600/20 to-transparent',
          activeColor === 'green' && 'bg-radial-gradient from-emerald-600/20 to-transparent',
          activeColor === 'yellow' && 'bg-radial-gradient from-amber-600/20 to-transparent'
        )}
      />

      {/* Opponent Player Seats (Arranged along the top perimeter) */}
      <div className="relative z-10 w-full flex items-center justify-around px-4 pt-2">
        {opponentPlayers.length === 0 ? (
          <div className="text-xs text-slate-400 bg-slate-900/60 px-4 py-2 rounded-full border border-slate-700/50">
            Waiting for players to join... (Share 4-character Room Code)
          </div>
        ) : (
          opponentPlayers.map(player => (
            <PlayerSeat
              key={player.id}
              player={player}
              isCurrentTurn={player.id === currentTurnPlayerId}
              turnTimeRemainingMs={turnTimeRemainingMs}
            />
          ))
        )}
      </div>

      {/* Central Arena: Pot Counter, Active Suit Orb, Discard & Draw Stacks */}
      <div className="relative z-10 flex-1 flex items-center justify-center gap-12 my-auto">
        {/* Draw Deck Stack */}
        <div className="flex flex-col items-center">
          <div
            onClick={isMyTurn ? onDrawCard : undefined}
            className={cn(
              'relative transition-transform duration-200 select-none group',
              isMyTurn ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-85'
            )}
          >
            {/* Layered Card Deck Depth Effect */}
            <div className="absolute -top-1.5 -left-1.5 w-28 h-40 rounded-xl bg-slate-900 border border-slate-800 shadow-md transform rotate-[-3deg]" />
            <div className="absolute -top-0.5 -left-0.5 w-28 h-40 rounded-xl bg-slate-950 border border-amber-600/40 shadow-lg transform rotate-[2deg]" />

            {/* Top Deck Card */}
            <div className="relative w-28 h-40 rounded-xl bg-slate-950 border-2 border-amber-500/60 p-2 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
              <div className="w-full h-full rounded-lg border border-amber-500/40 flex flex-col items-center justify-center bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:8px_8px]">
                <Layers className="w-8 h-8 text-amber-400 mb-1 drop-shadow" />
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">DRAW</span>
                <span className="text-[10px] font-mono font-bold text-amber-200/80">({drawDeckCount})</span>
              </div>
            </div>

            {/* Prompt pulse when it's local player's turn */}
            {isMyTurn && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-wider text-amber-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-500/50 shadow animate-bounce">
                Click to Draw
              </span>
            )}
          </div>
        </div>

        {/* Center Felt Nexus: Real-time Pot Badge & Active Color Indicator */}
        <div className="flex flex-col items-center justify-center gap-3">
          {/* Central Chip Pot */}
          <div className="flex flex-col items-center bg-slate-950/80 border-2 border-amber-500/50 px-6 py-3 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.3)] backdrop-blur-md">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/90 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              TABLE POT
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black font-mono tracking-tight text-white drop-shadow">
                {potChips}
              </span>
              <span className="text-xs font-bold text-amber-400">CHIPS</span>
            </div>

            {/* Current Ante Badge */}
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="gold" className="text-[10px] font-mono py-0 px-2">
                Ante: {currentAnte}
              </Badge>
              {/* Turn Direction Orb */}
              <div className="flex items-center text-slate-400" title={`Turn direction: ${turnDirection === 1 ? 'Clockwise' : 'Counter-Clockwise'}`}>
                {turnDirection === 1 ? <RotateCw className="w-3 h-3 text-emerald-400" /> : <RotateCcw className="w-3 h-3 text-cyan-400" />}
              </div>
            </div>
          </div>

          {/* Active Suit / Color Indicator */}
          <div className={cn(
            'flex items-center gap-2 px-4 py-1.5 rounded-full border-2 bg-slate-950/90 shadow-xl backdrop-blur-md transition-all duration-300',
            getColorHaloClass()
          )}>
            <div className={cn(
              'w-3.5 h-3.5 rounded-full animate-ping opacity-75',
              activeColor === 'red' && 'bg-red-500',
              activeColor === 'blue' && 'bg-blue-500',
              activeColor === 'green' && 'bg-emerald-500',
              activeColor === 'yellow' && 'bg-amber-400',
              activeColor === 'wild' && 'bg-purple-500'
            )} />
            <span className="text-xs font-black uppercase tracking-widest font-mono">
              SUIT: {activeColor}
            </span>
          </div>
        </div>

        {/* Central Discard Pile */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Under-card shadow representing discard depth */}
            <div className="absolute top-1 left-1 w-28 h-40 rounded-xl bg-slate-950/80 transform rotate-[-6deg]" />
            <div className="absolute -top-1 -left-1 w-28 h-40 rounded-xl bg-slate-950/70 transform rotate-[4deg]" />

            {/* Top Discard Card */}
            {topDiscard ? (
              <Card3D
                card={topDiscard}
                interactive={false}
                size="md"
                className="transform rotate-[-2deg] pointer-events-none"
              />
            ) : (
              <div className="w-28 h-40 rounded-xl border-2 border-dashed border-slate-700/60 flex items-center justify-center text-slate-500 text-xs font-bold uppercase">
                Empty Pile
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Felt Strip: Live Combat / Action Log Ticker */}
      <div className="relative z-10 w-full flex items-center justify-between bg-slate-950/75 border border-slate-800/80 rounded-xl px-4 py-2 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2 truncate">
          <span className="font-extrabold uppercase tracking-wider text-amber-400 font-mono text-[11px]">
            TABLE LOG:
          </span>
          {lastAction ? (
            <span className="text-slate-300 truncate">
              <strong className="text-white font-bold">{lastAction.playerName}</strong> {lastAction.action}
              {lastAction.details && <span className="text-slate-400 ml-1.5 italic font-mono text-[11px]">({lastAction.details})</span>}
            </span>
          ) : (
            <span className="text-slate-400 italic">Game in progress... Waiting for first play.</span>
          )}
        </div>

        {/* Turn countdown display for local spectator */}
        <div className="flex items-center gap-2 font-mono text-xs pl-3 shrink-0">
          <span className="text-slate-400">TURN TIME:</span>
          <span className={cn(
            "font-black px-2 py-0.5 rounded",
            turnTimeRemainingMs < 5000 ? "bg-red-500 text-white animate-pulse" : "bg-slate-800 text-emerald-400"
          )}>
            {(turnTimeRemainingMs / 1000).toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
};
