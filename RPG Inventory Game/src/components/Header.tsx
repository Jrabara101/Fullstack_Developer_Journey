import React, { useState } from 'react';
import { RoomStateMode } from '../types/inventory';
import { 
  Shield, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Wifi, 
  WifiOff, 
  Users, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { getSoundMuted, setSoundMuted } from '../engine/audioEngine';

interface HeaderProps {
  roomId: string;
  onChangeRoomId: (newRoom: string) => void;
  roomMode: RoomStateMode;
  isConnected: boolean;
  partyCount: number;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomId,
  onChangeRoomId,
  roomMode,
  isConnected,
  partyCount,
  onOpenGuide,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMutedState] = useState(getSoundMuted());
  const [editingRoom, setEditingRoom] = useState(false);
  const [tempRoomInput, setTempRoomInput] = useState(roomId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setSoundMuted(next);
    setIsMutedState(next);
  };

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempRoomInput.trim()) {
      onChangeRoomId(tempRoomInput.trim().toUpperCase());
      setEditingRoom(false);
    }
  };

  const getModeBadge = () => {
    switch (roomMode) {
      case 'QUEST_ENCOUNTER':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            QUEST ENCOUNTER
          </span>
        );
      case 'TRADE_ACTIVE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            TRADE CHAMBER ACTIVE
          </span>
        );
      case 'CAMP_LOBBY':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            CAMP LOBBY
          </span>
        );
    }
  };

  return (
    <header className="w-full glass-panel border-b border-white/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      {/* Brand & Crest */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#0c0f17] rounded-[14px] flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-400 stroke-[2.2]" />
          </div>
        </div>

        <div>
          <h1 className="font-['Cinzel'] font-black text-lg tracking-wider text-slate-100 flex items-center gap-2">
            ARCANE ARMORY
            <span className="text-[10px] font-sans font-extrabold uppercase px-2 py-0.5 rounded bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-500/40 text-amber-300 tracking-normal">
              MVP
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Multiplayer Spatial Inventory & Synchronized Party Deck
          </p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="flex items-center gap-3">
        {/* Room Mode Pill */}
        {getModeBadge()}

        {/* Room Code Badge */}
        <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-2.5 py-1">
          {editingRoom ? (
            <form onSubmit={handleRoomSubmit} className="flex items-center gap-1">
              <input
                type="text"
                maxLength={6}
                value={tempRoomInput}
                onChange={e => setTempRoomInput(e.target.value.toUpperCase())}
                className="w-16 bg-white/10 text-white font-mono text-xs px-1.5 py-0.5 rounded outline-none border border-indigo-400"
                autoFocus
              />
              <button type="submit" className="text-[10px] bg-indigo-600 px-1.5 py-0.5 rounded text-white font-mono">
                Go
              </button>
            </form>
          ) : (
            <div 
              onClick={() => setEditingRoom(true)}
              className="flex items-center gap-1.5 cursor-pointer group"
              title="Click to switch room code"
            >
              <span className="text-[10px] text-slate-500 font-mono">ROOM:</span>
              <span className="font-mono font-bold text-xs text-amber-300 group-hover:underline">
                {roomId}
              </span>
            </div>
          )}

          <button
            onClick={handleCopyLink}
            className="ml-2 pl-2 border-l border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Copy invite URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Server Connection Status */}
        <div 
          className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-mono"
          title={isConnected ? 'Connected to Fastify WebSocket Server' : 'Fastify WebSocket Connecting / Offline Fallback'}
        >
          {isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 hidden md:inline">Synced</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 hidden md:inline">Local Sim</span>
            </>
          )}
        </div>
      </div>

      {/* Right Controls: Audio & Help */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
          title="Guide & Keyboard Controls"
        >
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Controls</span>
        </button>

        <button
          onClick={toggleMute}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          title={isMuted ? 'Unmute Procedural Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
