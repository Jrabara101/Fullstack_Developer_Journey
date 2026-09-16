import React from 'react';
import { useArcadeStore } from '../store/useArcadeStore';
import { Button } from './ui/Button';
import { Difficulty, GridDimension } from '../types';

export const ControlRibbon: React.FC = () => {
  const status = useArcadeStore((s) => s.status);
  const difficulty = useArcadeStore((s) => s.difficulty);
  const gridDimension = useArcadeStore((s) => s.gridDimension);
  const togglePause = useArcadeStore((s) => s.togglePause);
  const startGame = useArcadeStore((s) => s.startGame);
  const resetGame = useArcadeStore((s) => s.resetGame);
  const setDifficulty = useArcadeStore((s) => s.setDifficulty);
  const setGridDimension = useArcadeStore((s) => s.setGridDimension);

  let toggleBtnLabel = 'START NITRO';
  let toggleBtnIcon = 'play_arrow';

  if (status === 'PLAYING') {
    toggleBtnLabel = 'HALT NITRO';
    toggleBtnIcon = 'pause';
  } else if (status === 'PAUSED') {
    toggleBtnLabel = 'RESUME CRUISE';
    toggleBtnIcon = 'play_arrow';
  } else if (status === 'GAME_OVER') {
    toggleBtnLabel = 'NEW RUN';
    toggleBtnIcon = 'refresh';
  }

  const handleToggleClick = () => {
    if (status === 'IDLE' || status === 'GAME_OVER') {
      startGame();
    } else {
      togglePause();
    }
  };

  const handleRestart = () => {
    resetGame();
    startGame();
  };

  const difficulties: { key: Difficulty; label: string }[] = [
    { key: 'easy', label: 'CRUISE' },
    { key: 'normal', label: 'TURBO' },
    { key: 'hyper', label: 'OUTRUN' },
  ];

  return (
    <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-2.5 mb-4 px-1">
      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Toggle Nitro / Pause / Start */}
        <Button
          onClick={handleToggleClick}
          variant="neon-pink"
          size="md"
        >
          <span className="material-symbols-outlined text-sm">{toggleBtnIcon}</span>
          <span>{toggleBtnLabel}</span>
        </Button>

        {/* Rewind Cassette / Reset */}
        <Button
          onClick={handleRestart}
          variant="neon-cyan"
          size="md"
        >
          <span className="material-symbols-outlined text-sm">fast_rewind</span>
          <span>CASSETTE REWIND</span>
        </Button>
      </div>

      {/* Difficulty & Matrix Size Selectors */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Matrix Grid Size */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-cyan-300 tracking-widest font-['Righteous']">ARENA:</span>
          <div className="inline-flex bg-black/80 border border-cyan-800/80 p-0.5">
            {([3, 4] as GridDimension[]).map((dim) => (
              <button
                key={dim}
                onClick={() => setGridDimension(dim)}
                className={`px-2 py-0.5 text-xs font-['Righteous'] transition-colors ${
                  gridDimension === dim
                    ? 'bg-cyan-500 text-black font-black shadow-[0_0_8px_#00f0ff]'
                    : 'text-cyan-300/80 hover:text-white'
                }`}
              >
                {dim}x{dim}
              </button>
            ))}
          </div>
        </div>

        {/* Overclock Freq Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-pink-300 tracking-widest font-['Righteous']">CRUISE MODE:</span>
          <div className="inline-flex bg-black/80 border border-fuchsia-700/80 p-0.5">
            {difficulties.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={`px-2.5 py-0.5 text-xs font-['Righteous'] transition-colors ${
                  difficulty === key
                    ? 'bg-pink-600 text-white shadow-[0_0_8px_#ec4899]'
                    : 'text-fuchsia-300/80 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
