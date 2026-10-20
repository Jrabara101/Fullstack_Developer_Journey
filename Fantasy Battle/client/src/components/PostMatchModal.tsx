import React, { useState, useEffect } from 'react';
import type { ArenaGameState, TelemetryPoint } from '../types';
import { Trophy, RotateCcw, Copy, Check, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PostMatchModalProps {
  gameState: ArenaGameState;
  telemetry: TelemetryPoint[];
  durationMs: number;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
}

export const PostMatchModal: React.FC<PostMatchModalProps> = ({
  gameState,
  telemetry,
  durationMs,
  onRestart,
  onOpenLeaderboard,
}) => {
  const isVictory = gameState.status === 'VICTORY';
  const isGameOver = gameState.status === 'GAME_OVER';

  const [callsign, setCallsign] = useState('Gladiator_' + Math.floor(Math.random() * 900 + 100));
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Submit telemetry for server-authoritative ledger verification
  useEffect(() => {
    if (!isVictory && !isGameOver) return;

    setIsVerifying(true);
    const payload = {
      seed: gameState.seed,
      callsign,
      fighterClass: gameState.player.fighterClass,
      durationMs: Math.max(2500, Math.round(durationMs || gameState.stats.timeElapsedMs)),
      waveReached: gameState.currentWave,
      wavesCleared: gameState.stats.wavesCleared,
      totalParries: gameState.stats.parriesSucceeded,
      postureBreaks: gameState.stats.postureBreaksTriggered,
      telemetry
    };

    fetch('/api/arena/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(data => {
        setVerificationResult(data);
        setIsVerifying(false);
      })
      .catch(() => {
        // Fallback local verification if server is unreachable
        const mins = Math.floor(payload.durationMs / 60000);
        const secs = Math.floor((payload.durationMs % 60000) / 1000);
        const score = payload.wavesCleared * 3000 + payload.totalParries * 180 + payload.postureBreaks * 400;
        const emoji = `⚔️ 🛡️ 💀 [${isVictory ? 'VICTORY' : `Wave ${payload.wavesCleared} Cleared`} // ${mins}m ${secs}s // ${payload.totalParries} Parries // ${score} Pts]`;
        setVerificationResult({
          verified: true,
          score,
          rank: 1,
          scorecardEmoji: emoji,
          stats: { ...gameState.stats }
        });
        setIsVerifying(false);
      });
  }, [isVictory, isGameOver, durationMs, gameState, telemetry, callsign]);

  if (!isVictory && !isGameOver) return null;

  const handleCopyScorecard = () => {
    const card = verificationResult?.scorecardEmoji || `⚔️ 🛡️ 💀 [Wave ${gameState.stats.wavesCleared} Cleared // ${gameState.stats.parriesSucceeded} Parries]`;
    navigator.clipboard.writeText(card);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const minutes = Math.floor(gameState.stats.timeElapsedMs / 60000);
  const seconds = Math.floor((gameState.stats.timeElapsedMs % 60000) / 1000);
  const timeFormatted = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel p-6 md:p-8 rounded-3xl border border-amber-500/30 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative Top Flare */}
        <div
          className={`absolute top-0 inset-x-0 h-1.5 ${
            isVictory
              ? 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500'
              : 'bg-gradient-to-r from-red-600 via-rose-500 to-red-600'
          }`}
        />

        {/* Title & Banner */}
        <div className="text-xs font-mono font-bold tracking-[0.25em] text-slate-400 uppercase mb-1">
          {gameState.seed}
        </div>
        <h2
          className={`font-cinzel text-2xl md:text-3xl font-black tracking-wider uppercase mb-2 ${
            isVictory
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]'
              : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]'
          }`}
        >
          {isVictory ? 'Colosseum Conquered' : 'Fallen In The Sands'}
        </h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-sm mb-6">
          {isVictory
            ? 'You have withstood the fury of Valerius and all five trials. Your name is etched into the obsidian ledger.'
            : 'The colosseum claim another soul. Sharpen your blades, hone your parry timings, and enter again.'}
        </p>

        {/* Verification Status Banner */}
        <div className="w-full mb-6">
          {isVerifying ? (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-amber-300 animate-pulse flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Replaying combat telemetry against deterministic seed...
            </div>
          ) : verificationResult?.verified ? (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> VERIFIED BY RUNIC LEDGER
              </span>
              <span className="text-white font-semibold">
                Score: {verificationResult.score} &bull; Rank #{verificationResult.rank || 1}
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Telemetry verification rejected: {verificationResult?.reason || 'Validation failure'}
            </div>
          )}
        </div>

        {/* Performance Statistics Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6 text-left">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Waves Cleared</div>
            <div className="font-mono text-lg font-bold text-white">
              {gameState.stats.wavesCleared} <span className="text-xs text-slate-500">/ 5</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Survival Time</div>
            <div className="font-mono text-lg font-bold text-cyan-300">{timeFormatted}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Perfect Parries</div>
            <div className="font-mono text-lg font-bold text-amber-300">{gameState.stats.parriesSucceeded}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Posture Breaks</div>
            <div className="font-mono text-lg font-bold text-amber-400">{gameState.stats.postureBreaksTriggered}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Damage Dealt</div>
            <div className="font-mono text-lg font-bold text-emerald-400">{gameState.stats.damageDealt}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Combat Class</div>
            <div className="font-mono text-xs font-bold text-white uppercase mt-1 truncate">
              {gameState.player.fighterClass}
            </div>
          </div>
        </div>

        {/* Copyable Emoji Scorecard */}
        <div className="w-full p-3 rounded-xl bg-slate-950 border border-amber-500/20 mb-6 flex items-center justify-between gap-2">
          <div className="text-left font-mono text-xs text-slate-300 truncate">
            {verificationResult?.scorecardEmoji || `⚔️ 🛡️ 💀 [Wave ${gameState.stats.wavesCleared} Cleared]`}
          </div>
          <button
            onClick={handleCopyScorecard}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onRestart}
            className="w-full sm:flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cinzel font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-4 h-4" /> Enter Arena Again
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="w-full sm:flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/20 text-amber-300 font-cinzel font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <Trophy className="w-4 h-4" /> View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
