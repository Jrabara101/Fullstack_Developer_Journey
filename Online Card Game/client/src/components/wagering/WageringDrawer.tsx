import React, { useState } from 'react';
import { Sheet } from '../ui/Sheet.js';
import { Slider } from '../ui/Slider.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Coins, Flame, ArrowUpRight, Check, X, ShieldAlert } from 'lucide-react';
import { TablePlayer } from '../../types/game.js';

interface WageringDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: TablePlayer;
  currentAnte: number;
  potChips: number;
  onBetAnte: (amount: number) => void;
  onFold: () => void;
}

export const WageringDrawer: React.FC<WageringDrawerProps> = ({
  open,
  onOpenChange,
  player,
  currentAnte,
  potChips,
  onBetAnte,
  onFold
}) => {
  const minBet = 10;
  const maxBet = player.chips;
  const [raiseAmount, setRaiseAmount] = useState<number>(Math.min(50, maxBet));

  const handleRaiseSubmit = () => {
    onBetAnte(raiseAmount);
    onOpenChange(false);
  };

  const handleQuickAdd = (amount: number) => {
    setRaiseAmount(prev => Math.min(maxBet, prev + amount));
  };

  const handleAllIn = () => {
    setRaiseAmount(maxBet);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} side="bottom">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Coins className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-black uppercase tracking-wider text-white font-mono">
            High Stakes Wagering Desk
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Escalate the table ante, force opponents to match or fold, and claim side pots!
        </p>

        {/* Balance & Table Stakes Cards */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Your Chips</span>
            <span className="text-lg font-black font-mono text-amber-400 mt-0.5">{player.chips}</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Current Ante</span>
            <span className="text-lg font-black font-mono text-cyan-400 mt-0.5">{currentAnte}</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Pot</span>
            <span className="text-lg font-black font-mono text-emerald-400 mt-0.5">{potChips}</span>
          </div>
        </div>

        {/* Chip Slider Zone */}
        <div className="w-full bg-slate-950/90 border border-slate-800 p-5 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Raise Ante by:
            </span>
            <span className="text-2xl font-black font-mono text-amber-400">
              +{raiseAmount} <span className="text-xs text-amber-300/80">CHIPS</span>
            </span>
          </div>

          <Slider
            min={minBet}
            max={maxBet}
            step={10}
            value={raiseAmount}
            onChange={setRaiseAmount}
            className="my-3"
          />

          {/* Quick presets */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAdd(25)}
              className="text-xs flex-1 border-slate-700"
            >
              +25
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAdd(50)}
              className="text-xs flex-1 border-slate-700"
            >
              +50
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAdd(100)}
              className="text-xs flex-1 border-slate-700"
            >
              +100
            </Button>
            <Button
              size="sm"
              variant="crimson"
              onClick={handleAllIn}
              className="text-xs flex-1 font-black"
            >
              ALL IN
            </Button>
          </div>
        </div>

        {/* Action Buttons: Raise, Check, Fold */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <Button
            variant="gold"
            size="lg"
            onClick={handleRaiseSubmit}
            className="col-span-2 text-sm font-black uppercase tracking-wider gap-2"
          >
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            Raise Pot (+{raiseAmount})
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={() => {
              onFold();
              onOpenChange(false);
            }}
            className="text-xs font-black uppercase tracking-wider gap-1.5"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            Fold Hand
          </Button>
        </div>

        {/* Multi-card Meld Multiplier Legend */}
        <div className="mt-5 w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono block mb-1">
            🃏 Poker-Uno Meld Multipliers
          </span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-300">
            <div>• Straight Flush: <strong className="text-amber-300">2.5x Pot</strong></div>
            <div>• Pure Color Flush: <strong className="text-amber-300">2.0x Pot</strong></div>
            <div>• Three-of-a-Kind: <strong className="text-amber-300">1.8x Pot</strong></div>
            <div>• Rainbow Straight: <strong className="text-amber-300">1.6x Pot</strong></div>
          </div>
        </div>
      </div>
    </Sheet>
  );
};
