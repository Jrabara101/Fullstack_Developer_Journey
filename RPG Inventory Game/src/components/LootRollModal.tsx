import React, { useState, useEffect } from 'react';
import { ActiveLootDrop, ItemEntity, LootRollType } from '../types/inventory';
import { ItemIcon } from './ItemIcon';
import { playDiceRollSound } from '../engine/audioEngine';
import { 
  Trophy, 
  Clock, 
  Dices, 
  Check, 
  Sparkles, 
  Flame, 
  XCircle,
  HelpCircle,
  Coins
} from 'lucide-react';

interface LootRollModalProps {
  drop: ActiveLootDrop;
  localPlayerId: string;
  onSubmitRoll: (dropId: string, rollType: LootRollType) => void;
  onHoverItemForTooltip: (item: ItemEntity | null, e?: React.MouseEvent) => void;
  onClose?: () => void;
}

export const LootRollModal: React.FC<LootRollModalProps> = ({
  drop,
  localPlayerId,
  onSubmitRoll,
  onHoverItemForTooltip,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(drop.durationSeconds);
  const myRoll = drop.rolls[localPlayerId];

  // Auto-dismiss when resolved
  useEffect(() => {
    if (drop.resolved && onClose) {
      const dismissTimer = setTimeout(() => {
        onClose();
      }, 7000);
      return () => clearTimeout(dismissTimer);
    }
  }, [drop.resolved, onClose]);

  // Countdown timer
  useEffect(() => {
    if (drop.resolved) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((drop.expiresAt - now) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [drop.expiresAt, drop.resolved]);

  const handleRollClick = (type: LootRollType) => {
    playDiceRollSound();
    onSubmitRoll(drop.dropId, type);
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-amber-500/20 via-amber-600/10 to-transparent border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)]';
      case 'epic':
        return 'from-purple-500/20 via-purple-600/10 to-transparent border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.35)]';
      default:
        return 'from-blue-500/20 via-blue-600/10 to-transparent border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative max-w-lg w-full bg-gradient-to-b ${getRarityGlow(
          drop.item.rarity
        )} bg-[#0e121c] rounded-3xl border-2 p-6 shadow-2xl flex flex-col items-center gap-5 overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Pulsing Podium Beam */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="font-['Cinzel'] font-bold text-sm tracking-wider text-slate-100 uppercase">
              Loot Podium • Need / Greed
            </span>
          </div>

          {/* Radial Countdown Timer */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-2.5 py-1 rounded-full text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className={`font-bold ${secondsRemaining <= 4 ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
              {drop.resolved ? 'RESOLVED' : `${secondsRemaining}s`}
            </span>
          </div>
        </div>

        {/* Item Showcase Podium */}
        <div
          onMouseEnter={e => onHoverItemForTooltip(drop.item, e)}
          onMouseLeave={() => onHoverItemForTooltip(null)}
          className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-black/50 border border-white/15 w-full cursor-pointer hover:border-amber-400/60 transition-all hover:scale-[1.02] relative group"
        >
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
            <ItemIcon iconType={drop.item.iconType} rarity={drop.item.rarity} className="w-16 h-16" />
          </div>

          <div className="text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
              {drop.item.rarity} {drop.item.category}
            </span>
            <h3 className="font-['Cinzel'] font-black text-xl text-slate-100 tracking-wide mt-0.5">
              {drop.item.name}
            </h3>
            <p className="text-xs text-slate-400 italic max-w-sm mt-1">
              "{drop.item.description}"
            </p>
          </div>

          <div className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-full">
            Hover to inspect full stats & comparison
          </div>
        </div>

        {/* Live Rollers Standings */}
        <div className="w-full space-y-2 bg-black/40 p-3.5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-white/5 pb-1.5">
            <span>Party Rollers</span>
            <span>Decision & D100 Roll</span>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {Object.values(drop.rolls).length === 0 ? (
              <div className="text-center py-2 text-xs text-slate-500 italic">
                Awaiting player decisions...
              </div>
            ) : (
              Object.values(drop.rolls).map((roll, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{roll.playerName}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                        roll.rollType === 'need'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : roll.rollType === 'greed'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {roll.rollType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-100">
                    <Dices className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{roll.rollValue}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resolution Winner Podium or Action Buttons */}
        {drop.resolved ? (
          <div className="w-full p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-center animate-in zoom-in-95 duration-200">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-1 animate-bounce" />
            <h4 className="font-['Cinzel'] font-bold text-base text-amber-300">
              {drop.winnerName ? `${drop.winnerName} Claims Victory!` : 'No Winner (All Passed)'}
            </h4>
            <p className="text-xs text-amber-200/80 font-mono mt-0.5">
              {drop.winnerName
                ? `Winning Roll: ${drop.winningType?.toUpperCase()} (${drop.winningRoll}) • Deposited into Bag`
                : 'Item returned to Vault.'}
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="mt-3 px-5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono transition-transform hover:scale-105 active:scale-95 shadow"
              >
                Dismiss & Return to Camp
              </button>
            )}
          </div>
        ) : (
          <div className="w-full flex items-center justify-center gap-3 pt-1">
            {myRoll ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 border border-white/10 text-xs font-mono text-slate-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>You voted <strong>{myRoll.rollType.toUpperCase()}</strong> (Rolled: {myRoll.rollValue})</span>
              </div>
            ) : (
              <>
                {/* Need Button */}
                <button
                  onClick={() => handleRollClick('need')}
                  className="flex-1 flex flex-col items-center justify-center py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 border border-rose-400/40"
                >
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span>NEED</span>
                  </div>
                  <span className="text-[9px] opacity-80 font-normal">Primary Upgrade</span>
                </button>

                {/* Greed Button */}
                <button
                  onClick={() => handleRollClick('greed')}
                  className="flex-1 flex flex-col items-center justify-center py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 border border-amber-400/40"
                >
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-200" />
                    <span>GREED</span>
                  </div>
                  <span className="text-[9px] opacity-80 font-normal">Off-Spec / Gold</span>
                </button>

                {/* Pass Button */}
                <button
                  onClick={() => handleRollClick('pass')}
                  className="flex-1 flex flex-col items-center justify-center py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs transition-colors border border-white/10"
                >
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-slate-400" />
                    <span>PASS</span>
                  </div>
                  <span className="text-[9px] opacity-70 font-normal">Yield to Party</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
