import React, { useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Trophy, Sparkles, Coins, ArrowRight, Layers } from 'lucide-react';
import { CardGameState } from '../../types/game.js';
import { Avatar } from '../ui/Avatar.js';
import confetti from 'canvas-confetti';

interface RoundPayoutModalProps {
  gameState: CardGameState;
  onNextRound: () => void;
  playFanfare?: () => void;
}

export const RoundPayoutModal: React.FC<RoundPayoutModalProps> = ({
  gameState,
  onNextRound,
  playFanfare
}) => {
  const isPayoutActive = gameState.phase === 'SHOWDOWN_PAYOUT';
  const winner = gameState.roundWinner;
  const isLocalHost = gameState.players.find(p => p.id === gameState.myPlayerId)?.isHost;

  useEffect(() => {
    if (isPayoutActive) {
      playFanfare?.();

      // Launch victory fireworks
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    }
  }, [isPayoutActive, playFanfare]);

  if (!isPayoutActive || !winner) return null;

  return (
    <Dialog open={isPayoutActive}>
      <div className="flex flex-col items-center text-center p-2">
        {/* Trophy Icon */}
        <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4 shadow-[0_0_35px_rgba(245,158,11,0.6)] animate-bounce">
          <Trophy className="w-10 h-10 text-amber-400 fill-current" />
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-black uppercase tracking-wider text-amber-400 font-mono flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6" />
            SHOWDOWN VICTORY!
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-300 font-medium">
            Round concluded and the pot has been awarded!
          </DialogDescription>
        </DialogHeader>

        {/* Winner Showcase Card */}
        <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 p-5 rounded-3xl my-4 flex flex-col items-center shadow-xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/90 font-mono mb-2">
            POT CHAMPION
          </span>

          <Avatar
            fallback={winner.playerName}
            size="xl"
            className="border-4 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] my-1"
          />

          <h4 className="text-xl font-black text-white mt-2">
            {winner.playerName}
          </h4>

          {/* Winning Combo Badge */}
          <Badge variant="gold" className="text-xs font-bold font-mono px-3 py-1 my-2">
            🏆 Combo: {winner.comboName}
          </Badge>

          {/* Chips Claimed */}
          <div className="flex items-center gap-1.5 mt-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-black font-mono text-white">
              +{winner.potWon}
            </span>
            <span className="text-xs font-bold text-amber-400">CHIPS CLAIMED</span>
          </div>
        </div>

        {/* Standings Summary */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-left">
            Table Chip Standings
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {gameState.players.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900/60 border border-slate-800/60"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">#{idx + 1}</span>
                  <span className="font-bold text-slate-200 truncate">{p.username}</span>
                  {p.id === winner.playerId && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 rounded">WINNER</span>
                  )}
                </div>
                <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
                  <Coins className="w-3 h-3" />
                  <span>{p.chips}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Next Hand CTA */}
        <DialogFooter className="w-full">
          {isLocalHost ? (
            <Button
              variant="gold"
              size="lg"
              onClick={onNextRound}
              className="w-full font-black text-sm tracking-wider uppercase gap-2 py-5 shadow-lg shadow-amber-500/20"
            >
              Deal Next Hand
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Button>
          ) : (
            <div className="w-full text-center py-2 text-xs text-slate-400 italic">
              Waiting for Table Host to deal the next hand...
            </div>
          )}
        </DialogFooter>
      </div>
    </Dialog>
  );
};
