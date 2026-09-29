import React, { useState } from 'react';
import { Trophy, Skull, Share2, Check, RotateCcw, Clock, ShieldAlert } from 'lucide-react';
import type { GameOverPayload } from '../../../../shared/types';
import { audioEngine } from '../../lib/audio';

interface EndgameModalProps {
  payload: GameOverPayload | null;
  isOpen: boolean;
  onRestart: () => void;
  dailyMode?: boolean;
}

export const EndgameModal: React.FC<EndgameModalProps> = ({
  payload,
  isOpen,
  onRestart,
  dailyMode = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payload) return null;

  const isWon = payload.status === 'WON';
  const elapsedSec = Math.floor(payload.elapsedMs / 1000);

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(payload.shareText);
      setCopied(true);
      audioEngine.playKeyClick();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-lg bg-surface-low border ${
          isWon ? 'border-primary/50 shadow-[0_0_40px_rgba(78,222,163,0.2)]' : 'border-secondary/50 shadow-[0_0_40px_rgba(255,180,171,0.2)]'
        } rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center space-y-5`}
      >
        {/* Status Emblem */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
            isWon
              ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_#4edea3]'
              : 'bg-secondary/20 border-secondary text-secondary shadow-[0_0_20px_#ffb4ab]'
          }`}
        >
          {isWon ? <Trophy className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
        </div>

        {/* Title */}
        <div className="space-y-1">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {dailyMode ? 'DAILY CIPHER EVALUATION' : 'TACTICAL CADENCE COMPLETED'}
          </span>
          <h2
            className={`font-sans text-2xl sm:text-3xl font-extrabold uppercase tracking-wide ${
              isWon ? 'text-primary' : 'text-secondary'
            }`}
          >
            {isWon ? 'CIPHER DECRYPTED' : 'STRUCTURAL COLLAPSE'}
          </h2>
        </div>

        {/* Secret Word Reveal Box */}
        <div className="w-full bg-surface-container p-4 rounded-xl border border-surface-high/60 space-y-2">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">
            TARGET CODEWORD:
          </span>
          <div className="font-mono text-3xl font-extrabold tracking-widest text-[#eae1da]">
            {payload.word}
          </div>
          {payload.partOfSpeech && (
            <span className="inline-block font-mono text-[11px] text-tertiary bg-tertiary/10 px-2 py-0.5 rounded italic">
              {payload.partOfSpeech}
            </span>
          )}
          {payload.definition && (
            <p className="font-mono text-xs text-muted-foreground mt-2 leading-relaxed">
              "{payload.definition}"
            </p>
          )}
        </div>

        {/* Tactical Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="bg-surface-container-low p-3 rounded-lg border border-surface-high/40 flex flex-col items-center">
            <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-secondary" /> STRIKES
            </span>
            <span className="font-mono text-lg font-bold text-secondary">
              {payload.strikesUsed} / 6
            </span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-lg border border-surface-high/40 flex flex-col items-center">
            <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" /> TIME
            </span>
            <span className="font-mono text-lg font-bold text-primary">
              {elapsedSec}s
            </span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-lg border border-surface-high/40 flex flex-col items-center">
            <span className="font-mono text-[10px] text-muted-foreground">TOTAL TRIES</span>
            <span className="font-mono text-lg font-bold text-tertiary">
              {payload.totalGuesses}
            </span>
          </div>
        </div>

        {/* Share Preview Snippet */}
        <div className="w-full bg-surface-high/30 p-2.5 rounded-lg border border-surface-high/40 font-mono text-xs text-muted-foreground break-words text-left">
          <pre className="whitespace-pre-wrap font-mono text-[11px]">{payload.shareText}</pre>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          <button
            type="button"
            onClick={handleCopyShare}
            className="flex-1 py-3 px-4 bg-primary text-[#12100e] hover:bg-primary-container rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'SHARE TRANSMISSION'}</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="py-3 px-5 bg-surface-high hover:bg-surface-bright text-[#eae1da] border border-surface-high rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-primary" />
            <span>NEW DECK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
