import { useState } from 'react';
import type { PetEntity } from '../types/pet';
import { sound } from '../lib/sound';
import confetti from 'canvas-confetti';
import { Sparkles, Hand } from 'lucide-react';

interface IncubatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetEntity;
  onHatch: () => void;
}

export const IncubatorModal: React.FC<IncubatorModalProps> = ({
  isOpen,
  onClose,
  pet,
  onHatch,
}) => {
  const [tapCount, setTapCount] = useState(0);
  const [isWobbling, setIsWobbling] = useState(false);

  if (!isOpen || pet.stage !== 'EGG') return null;

  const handleEggTap = () => {
    sound.playEggCrack();
    sound.playPurr();
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 400);

    const nextTaps = tapCount + 1;
    setTapCount(nextTaps);

    if (nextTaps >= 4) {
      // Hatch sequence!
      sound.playEvolutionFanfare();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
      onHatch();
      onClose();
    }
  };

  const getCrackGlyph = () => {
    if (tapCount === 0) return '';
    if (tapCount === 1) return '⚡';
    if (tapCount === 2) return '💥⚡';
    return '✨💥⚡';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="glass-modal w-full max-w-md rounded-3xl p-7 shadow-2xl flex flex-col items-center gap-5 text-center border border-indigo-500/40 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Active Nursery Incubator</span>
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Hatch & Bond Sequence
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Your celestial egg is warm with latent life force. Tap repeatedly to infuse bonding energy and break the shell!
        </p>

        {/* The Interactive Egg */}
        <div
          onClick={handleEggTap}
          className={`relative my-4 p-8 rounded-full bg-gradient-to-b from-indigo-500/10 via-amber-500/10 to-transparent cursor-pointer transition transform active:scale-95 ${
            isWobbling ? 'animate-egg-wobble' : ''
          }`}
        >
          <div className="text-8xl select-none filter drop-shadow-[0_15px_25px_rgba(56,189,248,0.35)]">
            🥚
          </div>

          {/* Crack Overlays */}
          {tapCount > 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-cyan-300 animate-pulse pointer-events-none">
              {getCrackGlyph()}
            </div>
          )}
        </div>

        {/* Tap Progress Bar */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>Shell Integrity</span>
            <span className="text-cyan-400">{Math.max(0, 100 - tapCount * 25)}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-400 transition-all duration-300 rounded-full"
              style={{ width: `${(tapCount / 4) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleEggTap}
          className="w-full py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:opacity-95 text-white shadow-xl flex items-center justify-center gap-2 transition"
        >
          <Hand className="w-4 h-4" />
          <span>{tapCount === 0 ? 'Tap Egg to Begin Bond' : `Tap to Crack (${4 - tapCount} left)`}</span>
        </button>
      </div>
    </div>
  );
};
