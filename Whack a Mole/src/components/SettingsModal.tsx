import React from 'react';
import { useArcadeStore } from '../store/useArcadeStore';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Difficulty, GridDimension } from '../types';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const difficulty = useArcadeStore((s) => s.difficulty);
  const gridDimension = useArcadeStore((s) => s.gridDimension);
  const soundActive = useArcadeStore((s) => s.soundActive);
  const setDifficulty = useArcadeStore((s) => s.setDifficulty);
  const setGridDimension = useArcadeStore((s) => s.setGridDimension);
  const toggleSound = useArcadeStore((s) => s.toggleSound);

  const handleResetHighScore = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('synth_runner_hiscore');
      useArcadeStore.setState({ highScore: 0, isNewRecord: false });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-cyan-400">
          <span className="material-symbols-outlined text-2xl">settings</span>
          <span className="font-['Righteous'] text-lg uppercase tracking-wider">
            OUTRUN OPERATOR MANUAL & CONFIG
          </span>
        </div>
      }
    >
      {/* Target Field Guide */}
      <div className="flex flex-col gap-2 bg-black/60 border border-fuchsia-900/80 p-3">
        <span className="text-xs text-yellow-300 font-['Righteous'] tracking-widest uppercase">
          TARGET RECOGNITION GUIDE
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-['Righteous'] text-xs">
          {/* Normal Cassette */}
          <div className="bg-[#18072b] border border-pink-500/60 p-2 flex flex-col items-center text-center">
            <span className="text-pink-400 font-bold text-sm">SYNTH CASSETTE</span>
            <span className="text-white font-['VT323'] text-xl text-glow-pink my-0.5">+50 MPH</span>
            <span className="text-[10px] text-pink-300/80">Secures groove, adds +1 turbo multiplier</span>
          </div>

          {/* DeLorean Boost */}
          <div className="bg-[#241704] border border-yellow-400/60 p-2 flex flex-col items-center text-center">
            <span className="text-yellow-400 font-bold text-sm">88 MPH DELOREAN</span>
            <span className="text-yellow-300 font-['VT323'] text-xl text-glow-gold my-0.5">+150 MPH</span>
            <span className="text-[10px] text-yellow-200/80">Brief window! Adds +2 turbo multiplier</span>
          </div>

          {/* Cyber Skull Hazard */}
          <div className="bg-[#240409] border border-red-500/60 p-2 flex flex-col items-center text-center">
            <span className="text-red-400 font-bold text-sm">CYBER SKULL</span>
            <span className="text-red-400 font-['VT323'] text-xl my-0.5">-100 MPH</span>
            <span className="text-[10px] text-red-300/80">Crash penalty! Drops speed & resets multiplier</span>
          </div>
        </div>
      </div>

      {/* Configurations */}
      <div className="flex flex-col gap-3 text-xs font-['Righteous']">
        {/* Sound toggle */}
        <div className="flex items-center justify-between bg-black/50 border border-cyan-900/60 p-2">
          <div className="flex flex-col">
            <span className="text-cyan-300">SYNTHWAVE FM BROADCAST</span>
            <span className="text-[10px] text-cyan-200/60">Web Audio API 80s procedural synthesizer</span>
          </div>
          <Button
            onClick={toggleSound}
            variant={soundActive ? 'neon-pink' : 'outline'}
            size="sm"
          >
            {soundActive ? 'ENABLED' : 'MUTED'}
          </Button>
        </div>

        {/* Arena Grid Size */}
        <div className="flex items-center justify-between bg-black/50 border border-fuchsia-900/60 p-2">
          <div className="flex flex-col">
            <span className="text-pink-300">ARENA MATRIX GRID</span>
            <span className="text-[10px] text-pink-200/60">3x3 Classic (9 slots) or 4x4 Hyper (16 slots)</span>
          </div>
          <div className="inline-flex gap-1">
            {([3, 4] as GridDimension[]).map((dim) => (
              <Button
                key={dim}
                onClick={() => setGridDimension(dim)}
                variant={gridDimension === dim ? 'neon-cyan' : 'outline'}
                size="sm"
              >
                {dim}x{dim}
              </Button>
            ))}
          </div>
        </div>

        {/* Difficulty Profile */}
        <div className="flex items-center justify-between bg-black/50 border border-yellow-900/60 p-2">
          <div className="flex flex-col">
            <span className="text-yellow-300">OVERCLOCK FREQUENCY</span>
            <span className="text-[10px] text-yellow-200/60">Spawn frequency & target lifespan</span>
          </div>
          <div className="inline-flex gap-1">
            {(['easy', 'normal', 'hyper'] as Difficulty[]).map((diff) => (
              <Button
                key={diff}
                onClick={() => setDifficulty(diff)}
                variant={difficulty === diff ? 'neon-gold' : 'outline'}
                size="sm"
              >
                {diff.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between gap-2 border-t border-fuchsia-900/60 pt-3">
        <button
          onClick={handleResetHighScore}
          className="text-xs font-['Righteous'] text-red-400 hover:text-red-300 underline uppercase tracking-wider"
        >
          RESET ALL-TIME HIGH SCORE
        </button>

        <Button onClick={onClose} variant="neon-cyan" size="md">
          CLOSE MANUAL
        </Button>
      </div>
    </Dialog>
  );
};
