import React, { useState, useEffect } from 'react';
import type { PetEntity, PeerPetState, HybridSeed } from '../types/pet';
import { SPECIES_CATALOG } from '../lib/speciesData';
import { X, Users, QrCode, Dna, Wifi } from 'lucide-react';
import QRCode from 'qrcode';

interface PlaydateLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetEntity;
  isConnected: boolean;
  roomId: string | null;
  peers: PeerPetState[];
  newSeedAlert: HybridSeed | null;
  onConnectRoom: (code: string) => void;
  onDisconnectRoom: () => void;
  onSendEmote: (emote: string) => void;
  onRequestPollenSwap: (targetPetId: string) => void;
  onDismissSeedAlert: () => void;
}

export const PlaydateLobbyModal: React.FC<PlaydateLobbyModalProps> = ({
  isOpen,
  onClose,
  pet,
  isConnected,
  roomId,
  peers,
  newSeedAlert,
  onConnectRoom,
  onDisconnectRoom,
  onSendEmote,
  onRequestPollenSwap,
  onDismissSeedAlert,
}) => {
  const [inputRoomCode, setInputRoomCode] = useState('PARK');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const activeRoom = roomId || inputRoomCode;

  // Generate QR code for the 4-char room code
  useEffect(() => {
    if (activeRoom) {
      QRCode.toDataURL(
        `https://aethelpet.game/join?room=${activeRoom}`,
        {
          width: 140,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (err, url) => {
          if (!err && url) setQrDataUrl(url);
        }
      );
    }
  }, [activeRoom]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="glass-modal w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-hidden border border-slate-700/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                "Playdate Park" Peer Lobbies
                {isConnected && (
                  <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    <Wifi className="w-3 h-3 animate-pulse" /> Live Relay
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Wander shared playfields, bounce balls cooperatively, and exchange hybrid genetic pollen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Harvested Hybrid Seed Banner */}
        {newSeedAlert && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500/25 to-indigo-500/25 border border-fuchsia-500/50 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-1 bg-fuchsia-950/80 rounded-xl border border-fuchsia-500/40">🧬</span>
              <div>
                <h4 className="font-bold text-xs text-white">Hybrid Seed Synthesized!</h4>
                <p className="text-[11px] text-fuchsia-200">
                  Transferred pollen with {newSeedAlert.donorPetName}! Rarity:{' '}
                  <strong className="text-amber-300">{newSeedAlert.rarity}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onDismissSeedAlert}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
            >
              Vault Seed
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-hidden">
          {/* Left: Room Connection & QR Code */}
          <div className="glass-hud rounded-2xl p-4 flex flex-col items-center justify-between gap-4 border border-slate-700/60">
            <div className="w-full flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                4-Character Room Code
              </span>

              {isConnected ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono font-black text-cyan-400 tracking-widest">{roomId}</span>
                    <span className="text-[11px] text-slate-400">({peers.length + 1}/4 pets)</span>
                  </div>
                  <button
                    onClick={onDisconnectRoom}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600/40 hover:bg-rose-500/50 text-rose-200 border border-rose-500"
                  >
                    Leave
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputRoomCode}
                    onChange={(e) => setInputRoomCode(e.target.value.toUpperCase().slice(0, 4))}
                    maxLength={4}
                    placeholder="PARK"
                    className="w-28 text-center uppercase font-mono font-black text-lg bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => onConnectRoom(inputRoomCode || 'PARK')}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow transition"
                  >
                    Join Park Lobby
                  </button>
                </div>
              )}
            </div>

            {/* QR Code Preview */}
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/95 border border-slate-300 shadow-md">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Room QR Code" className="w-32 h-32 rounded-lg" />
              ) : (
                <div className="w-32 h-32 bg-slate-200 animate-pulse rounded-lg" />
              )}
              <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                <QrCode className="w-3 h-3" /> Camera Scan to Join
              </span>
            </div>
          </div>

          {/* Right: Guest List & Live Peer Interactions */}
          <div className="glass-hud rounded-2xl p-4 flex flex-col justify-between gap-3 border border-slate-700/60 max-h-[50vh] overflow-y-auto">
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Sanctuary Guest List</span>
                <span className="text-cyan-400 font-mono text-[11px]">{peers.length} Visiting</span>
              </span>

              {/* Host Pet (Self) */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {SPECIES_CATALOG[pet.speciesId]?.avatarEmoji || '🐾'}
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-white flex items-center gap-1">
                      {pet.name} <span className="text-[10px] text-cyan-400">(You)</span>
                    </h5>
                    <span className="text-[10px] text-slate-400">Mood: {pet.mood}</span>
                  </div>
                </div>
              </div>

              {/* Connected Peers */}
              {peers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  {isConnected
                    ? 'Waiting for companions to wander into the park...'
                    : 'Join a room to play with other companions!'}
                </div>
              ) : (
                peers.map((peer) => {
                  const sp = SPECIES_CATALOG[peer.speciesId] || SPECIES_CATALOG.blobkin;
                  return (
                    <div
                      key={peer.petId}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{sp.avatarEmoji}</span>
                        <div>
                          <h5 className="font-bold text-xs text-white">{peer.name}</h5>
                          <span className="text-[10px] text-slate-400">
                            {sp.name} • {peer.mood}
                          </span>
                        </div>
                      </div>

                      {/* Pollen Swap Button */}
                      <button
                        onClick={() => onRequestPollenSwap(peer.petId)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-fuchsia-600/30 hover:bg-fuchsia-500/40 border border-fuchsia-500/60 text-fuchsia-200 flex items-center gap-1"
                        title="Exchange genetic pollen"
                      >
                        <Dna className="w-3 h-3 text-fuchsia-300" />
                        Pollen Swap
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Emote Reactions */}
            {isConnected && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-around gap-1">
                {['❤️', '🎉', '⚽', '😋', '✨', '💤'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onSendEmote(emoji)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-lg transition"
                    title={`Send ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
