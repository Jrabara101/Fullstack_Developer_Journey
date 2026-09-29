import React, { useState } from 'react';
import { CardGameState } from '../../types/game.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Flame,
  DoorOpen,
  Sparkles
} from 'lucide-react';

interface TopBarProps {
  gameState: CardGameState | null;
  viewportMode: 'table' | 'controller';
  onToggleViewportMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onLeaveRoom: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  gameState,
  viewportMode,
  onToggleViewportMode,
  isMuted,
  onToggleMute,
  onLeaveRoom
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!gameState) return;
    const inviteUrl = `${window.location.origin}/?code=${gameState.roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case 'LOBBY': return <Badge variant="secondary">LOBBY</Badge>;
      case 'DEALING': return <Badge variant="gold">DEALING HANDS</Badge>;
      case 'PLAYER_TURN': return <Badge variant="felt">ROUND IN PLAY</Badge>;
      case 'BLUFF_CHALLENGE': return <Badge variant="destructive" className="animate-pulse">BLUFF CHALLENGE</Badge>;
      case 'SHOWDOWN_PAYOUT': return <Badge variant="gold" className="animate-bounce">SHOWDOWN PAYOUT</Badge>;
      default: return <Badge variant="outline">{phase}</Badge>;
    }
  };

  return (
    <header className="w-full bg-slate-950/80 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between backdrop-blur-md select-none sticky top-0 z-40">
      {/* Brand & Room PIN */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-md">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="font-mono font-black text-sm text-white hidden sm:inline tracking-wider">
            WILD ANTE
          </span>
        </div>

        {gameState && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
              PIN:
            </span>
            <span className="font-mono font-black text-amber-400 text-xs tracking-wider">
              {gameState.roomCode}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-slate-400 hover:text-white transition p-0.5"
              title="Copy Invite Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Center Phase Badge */}
      {gameState && (
        <div className="hidden md:flex items-center gap-2">
          {getPhaseBadge(gameState.phase)}
        </div>
      )}

      {/* Action Controls: Dual Viewport Toggle, Sound Mute, Leave */}
      <div className="flex items-center gap-2">
        {/* Viewport Mode Switcher (Table Broadcast vs Pocket Controller) */}
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleViewportMode}
          className="text-xs gap-1.5 border-slate-700 bg-slate-900"
          title="Switch between Table Arena Broadcast and Pocket Hand Controller"
        >
          {viewportMode === 'table' ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Pocket Mode</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Table Mode</span>
            </>
          )}
        </Button>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Exit Room Button */}
        {gameState && (
          <button
            onClick={onLeaveRoom}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Leave Table"
          >
            <DoorOpen className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
