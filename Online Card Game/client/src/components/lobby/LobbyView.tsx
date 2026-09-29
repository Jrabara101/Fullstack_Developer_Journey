import React, { useState } from 'react';
import { CardGameState } from '../../types/game.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Avatar } from '../ui/Avatar.js';
import {
  Crown,
  Bot,
  Play,
  Copy,
  Check,
  QrCode,
  Smartphone,
  PlusCircle,
  Sparkles,
  Shield,
  Coins
} from 'lucide-react';

interface LobbyViewProps {
  gameState: CardGameState | null;
  onJoinRoom: (username: string, roomCode?: string, avatarUrl?: string) => void;
  onStartGame: () => void;
  onAddBot: () => void;
  onSwitchMode?: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  gameState,
  onJoinRoom,
  onStartGame,
  onAddBot,
  onSwitchMode
}) => {
  const [username, setUsername] = useState('AceHigh');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // If already joined a room in LOBBY phase
  if (gameState && gameState.phase === 'LOBBY') {
    const isHost = gameState.players.find(p => p.id === gameState.myPlayerId)?.isHost;
    const canStart = gameState.players.length >= 2;
    const inviteUrl = `${window.location.origin}/?code=${gameState.roomCode}`;

    const handleCopyInvite = () => {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    };

    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center p-6 bg-slate-900/90 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
        {/* Room Header */}
        <Badge variant="gold" className="text-xs font-mono uppercase tracking-widest px-3 py-1 mb-2">
          HIGH-STAKES FELT TABLE
        </Badge>
        <h2 className="text-3xl font-black text-white font-mono tracking-tight">
          ROOM: <span className="text-amber-400">{gameState.roomCode}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Share your 4-letter room code or link to seat opponents.
        </p>

        {/* Room Invite Share Bar */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl w-full max-w-md mb-6">
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="bg-transparent text-xs text-slate-300 font-mono w-full px-2 outline-none truncate"
          />
          <Button
            size="sm"
            variant="gold"
            onClick={handleCopyInvite}
            className="gap-1.5 shrink-0 text-xs font-bold"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Copied' : 'Invite Link'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowQrModal(true)}
            className="p-2 border-slate-700"
            title="Scan QR Code with Phone"
          >
            <QrCode className="w-4 h-4 text-slate-300" />
          </Button>
        </div>

        {/* QR Code Modal for Dual-Device Pocket Controller */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border-2 border-amber-500/60 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl">
              <h3 className="text-lg font-black text-white font-mono uppercase flex items-center justify-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                Dual-Device Play
              </h3>
              <p className="text-xs text-slate-300 mt-1 mb-4">
                Scan with your phone to use it as a private tactile hand controller with haptic feedback!
              </p>
              {/* QR Image using QuickChart QR API */}
              <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(inviteUrl + '&mode=controller')}`}
                  alt="Room QR Code"
                  className="w-44 h-44"
                />
              </div>
              <div className="text-xs font-mono text-amber-300 mb-4 font-bold">
                Room Code: {gameState.roomCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQrModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Seated Players Grid */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Seated Players ({gameState.players.length}/6)
            </span>
            <span className="text-[11px] text-amber-400 font-mono">
              Minimum 2 players to deal
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gameState.players.map((p) => (
              <div
                key={p.id}
                className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3 relative shadow-md"
              >
                <div className="relative">
                  <Avatar
                    src={p.avatarUrl}
                    fallback={p.username}
                    size="md"
                    className="border-slate-700"
                  />
                  {p.isHost && (
                    <div className="absolute -top-1.5 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow">
                      <Crown className="w-3 h-3 fill-current" />
                    </div>
                  )}
                  {p.isBot && (
                    <div className="absolute -bottom-1 -left-1 bg-purple-600 text-white p-0.5 rounded-full shadow">
                      <Bot className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col text-left truncate flex-1">
                  <span className="text-xs font-bold text-white truncate">
                    {p.username}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-amber-400 mt-0.5">
                    <Coins className="w-3 h-3" />
                    <span>{p.chips}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty Seat Slot */}
            {gameState.players.length < 6 && (
              <div
                onClick={onAddBot}
                className="border-2 border-dashed border-slate-800 hover:border-purple-500/60 hover:bg-purple-950/10 p-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition text-slate-400 hover:text-purple-300"
              >
                <PlusCircle className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold font-mono">Add Bot</span>
              </div>
            )}
          </div>
        </div>

        {/* Start Game CTA for Host */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {isHost ? (
            <Button
              variant="gold"
              size="lg"
              disabled={!canStart}
              onClick={onStartGame}
              className="w-full font-black text-sm tracking-wider uppercase gap-2 py-6 shadow-xl shadow-amber-500/20"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Card Arena Match
            </Button>
          ) : (
            <div className="w-full text-center py-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400 italic">
              Waiting for Host to start the match...
            </div>
          )}

          {gameState.players.length < 6 && (
            <Button
              variant="outline"
              size="lg"
              onClick={onAddBot}
              className="w-full sm:w-auto shrink-0 border-purple-500/50 text-purple-300 hover:bg-purple-950/30 font-bold text-xs uppercase tracking-wider gap-2 py-6"
            >
              <Bot className="w-4 h-4" />
              Add AI Seat
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Initial Join / Create Screen
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center text-center p-6 bg-slate-900/90 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
      {/* Brand Hero */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-600 p-0.5 shadow-[0_0_35px_rgba(245,158,11,0.4)] mb-4">
        <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      <Badge variant="gold" className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 mb-2">
        UNO × POKER HYBRID ARENA
      </Badge>
      <h1 className="text-3xl font-black text-white font-mono tracking-tight">
        WILD ANTE ARENA
      </h1>
      <p className="text-xs text-slate-400 mt-1 mb-6">
        High-stakes color matching, poker melds, and psychological bluff calls.
      </p>

      {/* Username Input */}
      <div className="w-full text-left mb-4">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block mb-1.5">
          Player Call-Sign
        </label>
        <input
          type="text"
          value={username}
          maxLength={14}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
        />
      </div>

      {/* Primary Actions: Host or Join */}
      <div className="w-full space-y-4">
        {/* Create Table */}
        <Button
          variant="gold"
          size="lg"
          onClick={() => onJoinRoom(username)}
          className="w-full font-black text-sm tracking-wider uppercase py-6 shadow-lg shadow-amber-500/20 gap-2"
        >
          <Crown className="w-5 h-5 fill-current" />
          Create New Table (Host)
        </Button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            OR JOIN EXISTING
          </span>
        </div>

        {/* Join by Code */}
        <div className="flex gap-2">
          <input
            type="text"
            value={roomCodeInput}
            maxLength={4}
            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
            placeholder="4-LETTER CODE"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-sm text-amber-400 font-mono font-black uppercase tracking-widest outline-none focus:border-amber-400"
          />
          <Button
            variant="felt"
            disabled={roomCodeInput.trim().length !== 4}
            onClick={() => onJoinRoom(username, roomCodeInput)}
            className="px-6 font-black text-xs uppercase tracking-wider shrink-0"
          >
            Join Table
          </Button>
        </div>
      </div>

      {/* Feature Badges */}
      <div className="mt-8 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 w-full text-[10px] text-slate-400 font-mono">
        <div className="flex flex-col items-center">
          <Shield className="w-4 h-4 text-emerald-400 mb-1" />
          <span>Anti-Cheat Fog</span>
        </div>
        <div className="flex flex-col items-center">
          <Smartphone className="w-4 h-4 text-cyan-400 mb-1" />
          <span>Dual-Device Sync</span>
        </div>
        <div className="flex flex-col items-center">
          <Coins className="w-4 h-4 text-amber-400 mb-1" />
          <span>Escalating Ante</span>
        </div>
      </div>
    </div>
  );
};
