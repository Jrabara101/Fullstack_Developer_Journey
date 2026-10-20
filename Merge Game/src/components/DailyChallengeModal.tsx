// ----------------------------------------------------
// Daily Challenge & Anti-Cheat Ledger Verification Modal
// ----------------------------------------------------

import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ShieldCheck, Copy, Check, X, AlertCircle, Share2 } from 'lucide-react';

export const DailyChallengeModal: React.FC = () => {
  const {
    isVerificationModalOpen,
    setIsVerificationModalOpen,
    isVerifying,
    verificationResult,
    dailySeed,
    movesRemaining,
  } = useGameStore();

  const [copied, setCopied] = useState(false);

  if (!isVerificationModalOpen) return null;

  const handleCopyBadge = () => {
    if (!verificationResult) return;
    navigator.clipboard.writeText(verificationResult.badgeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100 p-5 sm:p-6">
        {/* Close Button */}
        <button
          onClick={() => setIsVerificationModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-600/60 flex items-center justify-center text-emerald-400 text-2xl shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Server-Authoritative Ledger
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Seed: <span className="text-cyan-300 font-bold">{dailySeed}</span>
            </p>
          </div>
        </div>

        {/* Verification Status Area */}
        {isVerifying ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-3" />
            <p className="text-sm font-mono text-slate-300">
              Replaying input ledger on headless deterministic engine...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Validating move timestamps & anti-cheat hash integrity
            </p>
          </div>
        ) : verificationResult?.valid ? (
          <div>
            {/* Success Verification Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/60 flex items-center gap-2.5 mb-4 text-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Verified Run!</span> Deterministic simulation
                matched all client moves with 0 desyncs.
              </div>
            </div>

            {/* Run Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 font-mono text-center">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">FINAL SCORE</span>
                <span className="text-sm font-bold text-amber-300">
                  {verificationResult.score.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">HIGHEST TIER</span>
                <span className="text-sm font-bold text-cyan-300">
                  Tier {verificationResult.highestTier}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">MERGES</span>
                <span className="text-sm font-bold text-purple-300">
                  {verificationResult.totalMerges}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">OVERFLOWS</span>
                <span className="text-sm font-bold text-slate-200">
                  {verificationResult.boardOverflows}
                </span>
              </div>
            </div>

            {/* Discord / Social Copyable Performance Badge */}
            <div className="mb-4">
              <label className="text-xs font-mono text-slate-400 block mb-1.5 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Discord & Social Performance Badge:</span>
              </label>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-200 select-all break-all leading-relaxed shadow-inner">
                {verificationResult.badgeText}
              </div>

              <button
                onClick={handleCopyBadge}
                className="mt-2.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Copied Badge to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Badge for Discord</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4">
            {/* Error / Discrepancy Notice */}
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-700/60 flex items-start gap-3 mb-4 text-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Authoritative Validation Failed</h4>
                <p className="text-xs text-rose-300/90 mt-1">
                  {verificationResult?.errorReason || 'Desynchronized input buffer detected.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Authoritative UTC Seed Rules</span>
          <span>Moves remaining: {movesRemaining}</span>
        </div>
      </div>
    </div>
  );
};
