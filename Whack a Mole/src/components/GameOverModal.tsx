import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useArcadeStore } from '../store/useArcadeStore';
import { formatNum, calculateAccuracy, calculateRank } from '../utils/formatters';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';

interface GameOverModalProps {
  open: boolean;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ open, onClose }) => {
  const score = useArcadeStore((s) => s.score);
  const maxCombo = useArcadeStore((s) => s.maxCombo);
  const totalClicks = useArcadeStore((s) => s.totalClicks);
  const successfulHits = useArcadeStore((s) => s.successfulHits);
  const goldHits = useArcadeStore((s) => s.goldHits);
  const bombHits = useArcadeStore((s) => s.bombHits);
  const isNewRecord = useArcadeStore((s) => s.isNewRecord);
  const startGame = useArcadeStore((s) => s.startGame);

  useEffect(() => {
    if (open && isNewRecord && score > 0) {
      // Confetti burst for record breaking run
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#00f0ff', '#facc15', '#a855f7'],
        });
      } catch (e) {
        // Safe confetti
      }
    }
  }, [open, isNewRecord, score]);

  const accuracy = calculateAccuracy(successfulHits, totalClicks);
  const rankInfo = calculateRank(score);

  const handleRestart = () => {
    onClose();
    startGame();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        <>
          <div className="flex items-center gap-2 text-pink-400">
            <span className="material-symbols-outlined text-2xl animate-bounce">flag</span>
            <span className="font-['Righteous'] text-lg sm:text-xl uppercase tracking-wider chrome-text italic">
              OUTRUN FINISH LINE
            </span>
          </div>
          <span className="text-xs text-cyan-300 font-['Righteous'] bg-cyan-950/80 border border-cyan-500 px-2 py-0.5 tracking-widest">
            LAP CONCLUDED
          </span>
        </>
      }
    >
      {/* Main Final Score Display */}
      <div className="flex flex-col items-center justify-center py-3 bg-black/70 border border-fuchsia-900 relative overflow-hidden">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-pink-500/20 blur-2xl pointer-events-none" />
        <span className="text-xs font-['Righteous'] text-pink-300 uppercase tracking-widest">
          FINAL CRUISE VELOCITY
        </span>
        <span className="font-['VT323'] text-5xl sm:text-6xl text-cyan-300 font-black tracking-widest my-1 tabular-nums text-glow-cyan">
          {formatNum(score)}
        </span>
        <span className="text-xs text-fuchsia-400 font-bold -mt-1 tracking-widest">
          MILES PER HOUR
        </span>

        {isNewRecord && score > 0 && (
          <div className="flex items-center gap-1 bg-yellow-400/20 border border-yellow-400 text-yellow-300 font-['Righteous'] text-xs px-3 py-0.5 mt-2 animate-pulse">
            <span className="material-symbols-outlined text-sm">military_tech</span>
            NEW MIAMI GRID RECORD!
          </div>
        )}
      </div>

      {/* Detailed Stat Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-['Righteous'] text-xs">
        {/* Max Boost */}
        <div className="bg-black/60 border border-yellow-500/50 p-2.5 flex flex-col">
          <span className="text-yellow-300">MAX BOOST</span>
          <span className="text-2xl font-['VT323'] font-bold text-yellow-400">
            x{maxCombo}
          </span>
          <span className="text-fuchsia-400 text-[10px]">CONSECUTIVE</span>
        </div>

        {/* Precision */}
        <div className="bg-black/60 border border-cyan-500/50 p-2.5 flex flex-col">
          <span className="text-cyan-300">PRECISION</span>
          <span className="text-2xl font-['VT323'] font-bold text-cyan-400">
            {accuracy}%
          </span>
          <span className="text-cyan-200 text-[10px]">HIT ACCURACY</span>
        </div>

        {/* Cassettes Secured */}
        <div className="bg-black/60 border border-fuchsia-500/50 p-2.5 flex flex-col">
          <span className="text-pink-300">CASSETTES</span>
          <span className="text-2xl font-['VT323'] font-bold text-white">
            {successfulHits}
          </span>
          <span className="text-fuchsia-300 text-[10px]">TAPES SECURED</span>
        </div>

        {/* DeLorean Boosts */}
        <div className="bg-black/60 border border-yellow-400/60 p-2.5 flex flex-col">
          <span className="text-yellow-300">DELOREANS</span>
          <span className="text-2xl font-['VT323'] font-bold text-yellow-300">
            {goldHits}
          </span>
          <span className="text-yellow-200 text-[10px]">HYPER BOOSTS</span>
        </div>

        {/* Cyber Skulls Hit */}
        <div className="bg-black/60 border border-red-500/60 p-2.5 flex flex-col">
          <span className="text-red-400">CYBER SKULLS</span>
          <span className="text-2xl font-['VT323'] font-bold text-red-400">
            {bombHits}
          </span>
          <span className="text-red-300 text-[10px]">COLLISIONS</span>
        </div>

        {/* Driver Rank */}
        <div className="bg-black/60 border border-purple-500/60 p-2.5 flex flex-col">
          <span className="text-purple-300">DRIVER RANK</span>
          <span className={`text-2xl font-['VT323'] font-bold ${rankInfo.color}`}>
            {rankInfo.rank}
          </span>
          <span className="text-purple-200 text-[10px]">{rankInfo.desc}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
        <Button
          onClick={handleRestart}
          variant="neon-pink"
          size="lg"
          className="w-full sm:flex-1 py-2.5 font-bold"
        >
          <span className="material-symbols-outlined text-lg">play_arrow</span>
          INSERT COIN / PLAY AGAIN
        </Button>
        <Button
          onClick={onClose}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto px-5 py-2.5"
        >
          DISMISS
        </Button>
      </div>
    </Dialog>
  );
};
