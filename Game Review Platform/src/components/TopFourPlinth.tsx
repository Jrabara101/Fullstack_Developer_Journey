import React, { useState } from 'react';
import { GameCatalogItem } from '../types';
import { useAppStore } from '../store';
import { Crown, Sparkles, ExternalLink } from 'lucide-react';
import { formatShelfStatus } from '../lib/utils';

interface TopFourPlinthProps {
  games: GameCatalogItem[];
  criticUsername: string;
  isOwner?: boolean;
}

export const TopFourPlinth: React.FC<TopFourPlinthProps> = ({
  games,
  criticUsername,
  isOwner = false,
}) => {
  const { navigateToGame } = useAppStore();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Fill up to 4 slots
  const slots = Array.from({ length: 4 }).map((_, i) => games[i] || null);

  return (
    <div className="relative my-8">
      {/* Plinth Base Pedestal Background Lighting */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent blur-2xl pointer-events-none" />

      {/* Header Label */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display font-bold text-white text-sm tracking-widest uppercase">
            The Top 4 Plinth Showcase
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Curated Museum of {criticUsername}
        </span>
      </div>

      {/* Holographic 4-Slot Plinth Platform */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0D111C]/80 border border-cyan-500/20 backdrop-blur-md shadow-plinth relative">
        {/* Glowing Platform Surface Sheen */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        {slots.map((game, index) => {
          if (!game) {
            return (
              <div
                key={`empty-slot-${index}`}
                className="aspect-[2/3] rounded-xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center p-4 text-center text-slate-600"
              >
                <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center font-mono text-xs mb-2">
                  0{index + 1}
                </div>
                <span className="text-xs font-mono">Empty Plinth Slot</span>
              </div>
            );
          }

          const isHovered = hoveredIdx === index;

          return (
            <div
              key={game.id}
              onClick={() => navigateToGame(game.id)}
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="group cursor-pointer relative aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 ease-out perspective-[1000px]"
              style={{
                transform: isHovered
                  ? 'perspective(1000px) rotateX(4deg) rotateY(-4deg) scale(1.04)'
                  : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
                boxShadow: isHovered
                  ? '0 20px 30px -10px rgba(0,0,0,0.8), 0 0 25px 2px rgba(6,182,212,0.35)'
                  : '0 10px 20px -5px rgba(0,0,0,0.6)',
              }}
            >
              {/* Box Art Poster */}
              <img
                src={game.coverUrl}
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Specular Highlight Sheen */}
              <div
                className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Crisp 1px top-edge specular line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-white/25 pointer-events-none" />

              {/* Plinth Rank Badge (01, 02, 03, 04) */}
              <div className="absolute top-2.5 left-2.5 w-7 h-7 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-cyan-300 shadow-md">
                #{index + 1}
              </div>

              {/* Masterpiece Crown Badge */}
              <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-rose-950/80 backdrop-blur-md border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-md">
                <Crown className="w-4 h-4 fill-rose-500 text-rose-400" />
              </div>

              {/* Bottom Telemetry Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-8 flex flex-col justify-end">
                <h4 className="text-sm font-display font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                  {game.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>{game.releaseYear}</span>
                  <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    <span>5.0</span>
                    <span>★</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
