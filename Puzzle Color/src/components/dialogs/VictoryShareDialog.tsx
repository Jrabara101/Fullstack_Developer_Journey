import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Copy, ShieldCheck, Share2, Award, ArrowRight, RotateCcw } from 'lucide-react';
import { ColorData, MixOperation, VerificationResponse } from '../../types/color';
import { getDeltaEInterpretation } from '../../lib/colorMath';
import { generateShareString } from '../../lib/share';

interface VictoryShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  puzzleId: string;
  targetColor: ColorData;
  currentColor: ColorData;
  deltaE: number;
  toleranceThreshold: number;
  history: MixOperation[];
  movesUsed: number;
  maxMoves: number;
  volumeUsedMl: number;
  timeElapsedMs: number;
  isDaily: boolean;
  onVerify: () => Promise<VerificationResponse>;
}

export const VictoryShareDialog: React.FC<VictoryShareDialogProps> = ({
  isOpen,
  onClose,
  onRestart,
  puzzleId,
  targetColor,
  currentColor,
  deltaE,
  history,
  movesUsed,
  maxMoves,
  volumeUsedMl,
  timeElapsedMs,
  isDaily,
  onVerify,
}) => {
  const [copied, setCopied] = useState(false);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [verifying, setVerifying] = useState(false);

  const { rating, accuracy } = getDeltaEInterpretation(deltaE);

  // Trigger celebratory confetti on open
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#f43f5e', '#eab308', '#22c55e'],
      });

      // Automatically request server-authoritative certification
      setVerifying(true);
      onVerify()
        .then((res) => {
          setVerification(res);
        })
        .catch(() => {
          // Handled gracefully
        })
        .finally(() => {
          setVerifying(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shareText = generateShareString(
    puzzleId,
    history,
    deltaE,
    movesUsed,
    maxMoves,
    timeElapsedMs,
    isDaily,
    verification?.verified ?? true
  );

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-surface-low border border-surface-high rounded-2xl p-6 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: targetColor.hex }}
        />

        {/* Header Title */}
        <div className="flex flex-col items-center text-center gap-1.5 z-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-1 shadow-lg shadow-emerald-500/20">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="font-mono text-xl font-black text-slate-100 uppercase tracking-tight">
            Chromatic Synthesis Solved!
          </h2>
          <p className="font-mono text-xs text-slate-400">
            {puzzleId} • Tolerance threshold ΔE ≤ 2.0
          </p>
        </div>

        {/* Side-by-Side Swatch Comparison */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface-lowest border border-surface-container">
          <div className="flex flex-col gap-1.5 items-center">
            <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">
              Target Reference
            </span>
            <div
              className="w-full h-16 rounded-lg shadow-inner border border-white/10"
              style={{ backgroundColor: targetColor.hex }}
            />
            <span className="font-mono text-xs font-bold text-slate-200">{targetColor.hex}</span>
          </div>

          <div className="flex flex-col gap-1.5 items-center">
            <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">
              Crucible Formulation
            </span>
            <div
              className="w-full h-16 rounded-lg shadow-inner border border-white/10"
              style={{ backgroundColor: currentColor.hex }}
            />
            <span className="font-mono text-xs font-bold text-slate-200">{currentColor.hex}</span>
          </div>
        </div>

        {/* Performance Metrics & Precision Breakdown */}
        <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
          <div className="p-2.5 rounded-xl bg-surface-container border border-surface-high">
            <span className="text-[10px] text-slate-400 block uppercase">Accuracy</span>
            <span className="text-base font-black text-emerald-400">{accuracy}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container border border-surface-high">
            <span className="text-[10px] text-slate-400 block uppercase">ΔE Precision</span>
            <span className="text-base font-black text-amber-300">{deltaE.toFixed(2)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container border border-surface-high">
            <span className="text-[10px] text-slate-400 block uppercase">Injections</span>
            <span className="text-base font-black text-primary">
              {movesUsed} / {maxMoves}
            </span>
          </div>
        </div>

        {/* Server Authoritative Certification Pill */}
        <div className="p-3 rounded-xl bg-surface-lowest border border-surface-container flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Spectrophotometric Certification:</span>
          </div>
          <span className="font-bold text-emerald-400">
            {verifying ? 'Authorizing...' : verification?.verified ? 'Certified (Ranked ✓)' : 'Validated'}
          </span>
        </div>

        {/* Formulation Steps Visual Emoji Sequence */}
        <div className="flex flex-col gap-1 font-mono text-xs bg-surface-container/60 p-3 rounded-xl border border-surface-high">
          <span className="text-[10px] text-slate-400 uppercase font-bold">
            Formulation History:
          </span>
          <div className="text-slate-200 text-sm tracking-widest overflow-x-auto py-1">
            {history.map((h, i) => (
              <span key={i} title={`${h.volumeAddedMl}ml ${h.reagentId}`}>
                {h.reagentId === 'cyan'
                  ? '🟦'
                  : h.reagentId === 'magenta'
                  ? '🟪'
                  : h.reagentId === 'yellow'
                  ? '🟨'
                  : h.reagentId === 'carbon'
                  ? '⬛'
                  : '⬜'}
              </span>
            ))}{' '}
            🧪
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          {/* Copy Emoji Share String */}
          <button
            onClick={handleCopyShare}
            className="flex-1 py-3 px-4 rounded-xl bg-primary text-slate-950 font-mono text-xs font-bold hover:bg-sky-300 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Results Grid</span>
              </>
            )}
          </button>

          {/* Replay / Next */}
          <button
            onClick={onRestart}
            className="py-3 px-4 rounded-xl bg-surface-container border border-surface-high text-slate-300 hover:text-slate-100 font-mono text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5"
            title="Formulate again"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
