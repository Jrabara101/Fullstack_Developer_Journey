import React, { useState, useEffect, useRef } from 'react';
import { Swords, X, Bot, Zap, Trophy, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ColorData } from '../../types/color';

interface DuelLobbyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playerDeltaE: number;
  playerColor: ColorData;
  playerMoves: number;
  targetColor: ColorData;
}

export const DuelLobbyDialog: React.FC<DuelLobbyDialogProps> = ({
  isOpen,
  onClose,
  playerDeltaE,
  playerColor,
  playerMoves,
  targetColor,
}) => {
  const [inMatch, setInMatch] = useState(false);
  const [opponentName] = useState('Dr_Quantum_AI');
  const [opponentDeltaE, setOpponentDeltaE] = useState(18.5);
  const [opponentMoves, setOpponentMoves] = useState(0);
  const [opponentHex, setOpponentHex] = useState('#8B5CF6');
  const [matchWinner, setMatchWinner] = useState<'player' | 'opponent' | null>(null);
  const [duelLog, setDuelLog] = useState<string[]>([]);

  // Simulation timer for opponent AI progression
  const simIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && inMatch && !matchWinner) {
      simIntervalRef.current = window.setInterval(() => {
        setOpponentDeltaE((prev) => {
          if (prev <= 1.8) {
            setMatchWinner('opponent');
            setDuelLog((l) => [`${opponentName} reached convergence first!`, ...l]);
            return prev;
          }
          const step = 0.8 + Math.random() * 1.5;
          const next = Math.max(1.2, Math.round((prev - step) * 100) / 100);
          setOpponentMoves((m) => m + 1);
          setDuelLog((l) => [`${opponentName} titrated 0.5ml reagent (ΔE: ${next})`, ...l]);
          return next;
        });
      }, 3500);
    }

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isOpen, inMatch, matchWinner, opponentName]);

  // Check if player won
  useEffect(() => {
    if (inMatch && !matchWinner && playerDeltaE <= 2.0) {
      setMatchWinner('player');
      setDuelLog((l) => ['You achieved target synthesis and won the Color Clash!', ...l]);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    }
  }, [inMatch, matchWinner, playerDeltaE]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-surface-low border border-surface-high rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-high">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-rose-400" />
            <h2 className="font-mono text-base font-bold text-slate-100">
              1v1 Color Clash Duel Bay
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-high text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!inMatch ? (
          <div className="flex flex-col gap-4 items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Zap className="w-8 h-8" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-mono text-lg font-bold text-slate-200">
                Synchronized Speed Synthesis
              </h3>
              <p className="font-mono text-xs text-slate-400 max-w-xs">
                Race against a live opponent or sparring AI to match the target swatch under identical constraints!
              </p>
            </div>

            <button
              onClick={() => {
                setInMatch(true);
                setMatchWinner(null);
                setOpponentDeltaE(18.5);
                setOpponentMoves(0);
                setDuelLog(['Match commenced! Target swatch broadcasted.']);
              }}
              className="py-3 px-6 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-mono text-xs font-bold active:scale-95 transition-all shadow-lg shadow-rose-500/30"
            >
              Enter Matchmaking Arena
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 font-mono">
            {/* Duel Scoreboard */}
            <div className="grid grid-cols-2 gap-3">
              {/* Player Side */}
              <div className="p-3 rounded-xl bg-surface-lowest border border-primary/40 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">You (Alchemist)</span>
                  <span className="text-[10px] text-slate-400">{playerMoves} drops</span>
                </div>
                <div
                  className="w-full h-10 rounded-lg shadow-inner border border-white/10"
                  style={{ backgroundColor: playerColor.hex }}
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">ΔE:</span>
                  <span className="font-bold text-amber-300">{playerDeltaE.toFixed(2)}</span>
                </div>
              </div>

              {/* Opponent Side */}
              <div className="p-3 rounded-xl bg-surface-lowest border border-rose-500/40 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-400 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" /> {opponentName}
                  </span>
                  <span className="text-[10px] text-slate-400">{opponentMoves} drops</span>
                </div>
                <div
                  className="w-full h-10 rounded-lg shadow-inner border border-white/10"
                  style={{ backgroundColor: opponentHex }}
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">ΔE:</span>
                  <span className="font-bold text-amber-300">{opponentDeltaE.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Winner Announcement Banner */}
            {matchWinner && (
              <div
                className={`p-3 rounded-xl border text-center font-bold text-sm flex items-center justify-center gap-2 ${
                  matchWinner === 'player'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>{matchWinner === 'player' ? 'VICTORY! You won the clash!' : 'DEFEAT! Opponent converged first.'}</span>
              </div>
            )}

            {/* Live Combat Telemetry Feed */}
            <div className="flex flex-col gap-1 bg-surface-container/60 p-3 rounded-xl border border-surface-high text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Live Combat Log:</span>
              <div className="flex flex-col gap-1 max-h-24 overflow-y-auto text-[11px] text-slate-300">
                {duelLog.map((log, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setInMatch(false)}
              className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-high text-slate-300 text-xs font-semibold transition-all border border-surface-high"
            >
              Exit Arena
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
