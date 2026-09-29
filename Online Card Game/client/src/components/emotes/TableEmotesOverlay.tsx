import React from 'react';
import { TableEmote } from '../../types/game.js';

interface TableEmotesOverlayProps {
  emotes: TableEmote[];
}

export const TableEmotesOverlay: React.FC<TableEmotesOverlayProps> = ({ emotes }) => {
  if (emotes.length === 0) return null;

  const getEmoteEmoji = (type: string) => {
    switch (type) {
      case 'tomato': return '🍅';
      case 'chips': return '🪙';
      case 'slam': return '💥';
      case 'fire': return '🔥';
      case 'clapping': return '👏';
      default: return '🃏';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {emotes.map((e, index) => {
        // Randomize floating trajectory around center/sides
        const posX = 30 + ((index * 23) % 45);
        const posY = 40 + ((index * 17) % 30);

        return (
          <div
            key={e.id}
            style={{ left: `${posX}%`, top: `${posY}%` }}
            className="absolute flex flex-col items-center animate-float-emote"
          >
            <span className="text-5xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
              {getEmoteEmoji(e.emote)}
            </span>
            <span className="text-[10px] font-black font-mono tracking-wider text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-500/40 shadow mt-1">
              {e.senderName}
            </span>
          </div>
        );
      })}
    </div>
  );
};
