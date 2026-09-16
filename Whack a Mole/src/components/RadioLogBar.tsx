import React from 'react';
import { useArcadeStore } from '../store/useArcadeStore';

interface RadioLogBarProps {
  onShowSummary: () => void;
}

export const RadioLogBar: React.FC<RadioLogBarProps> = ({ onShowSummary }) => {
  const radioLog = useArcadeStore((s) => s.radioLog);

  return (
    <div className="w-full max-w-3xl mt-4 bg-black/80 border border-purple-900/80 p-2.5 flex items-center justify-between text-xs font-['Righteous'] select-none">
      <div className="flex items-center gap-2 overflow-hidden truncate">
        <span className="text-yellow-400 tracking-wider shrink-0">RADIO LOG:</span>
        <span className="text-cyan-200 truncate tracking-wide">
          {radioLog}
        </span>
      </div>
      <button
        onClick={onShowSummary}
        className="shrink-0 text-pink-400 hover:text-pink-200 underline uppercase tracking-wider px-2 cursor-pointer transition-colors"
      >
        CYCLE STATS
      </button>
    </div>
  );
};
