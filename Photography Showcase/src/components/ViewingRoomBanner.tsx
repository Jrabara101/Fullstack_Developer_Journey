import React from 'react';
import type { ViewingRoomState } from '../types';
import { Sparkles, X } from 'lucide-react';

interface ViewingRoomBannerProps {
  roomState: ViewingRoomState;
  onExitRoom: () => void;
}

export const ViewingRoomBanner: React.FC<ViewingRoomBannerProps> = ({
  roomState,
  onExitRoom,
}) => {
  return (
    <div
      className="w-full border-b px-6 md:px-16 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
      style={{
        backgroundColor: 'var(--canvas-elevated)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div className="flex items-start md:items-center gap-3">
        <div className="p-2 rounded-full bg-[#D93829]/10 text-[#D93829] shrink-0 mt-0.5 md:mt-0">
          <Sparkles size={16} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-400">
              PRIVATE VIEWING ROOM
            </span>
            <span className="text-[10px] font-mono text-[#D93829] font-medium">
              [{roomState.selectedIds.length} PLATES CURATED]
            </span>
          </div>
          <h2 className="font-serif italic text-xl md:text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {roomState.title}
          </h2>
          {roomState.note && (
            <p className="font-serif italic text-xs md:text-sm text-neutral-500 mt-0.5 max-w-2xl">
              “{roomState.note}”
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onExitRoom}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors hover:border-neutral-500"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <X size={12} />
          <span>Exit to Full Archive</span>
        </button>
      </div>
    </div>
  );
};
