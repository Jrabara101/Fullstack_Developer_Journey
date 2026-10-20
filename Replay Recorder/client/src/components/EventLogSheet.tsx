import React, { useState } from 'react';
import {
  X,
  Search,
  Crosshair,
  Skull,
  Zap,
  Flag,
  Award,
  Clock,
  Filter
} from 'lucide-react';
import { ReplayEventMarker, EventCategory } from '../types/replay';

interface EventLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  markers: ReplayEventMarker[];
  currentTick: number;
  onSeekToTick: (tick: number) => void;
}

export const EventLogSheet: React.FC<EventLogSheetProps> = ({
  isOpen,
  onClose,
  markers,
  currentTick,
  onSeekToTick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Events' },
    { key: 'kill', label: 'Eliminations' },
    { key: 'death', label: 'Deaths' },
    { key: 'ability', label: 'Abilities' },
    { key: 'checkpoint', label: 'Checkpoints' },
    { key: 'milestone', label: 'Milestones' }
  ];

  const filteredMarkers = markers.filter(m => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesQuery = m.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const formatTimestamp = (tick: number) => {
    const totalMs = Math.round((tick / 60) * 1000);
    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = totalMs % 1000;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  const getCategoryBadge = (cat: EventCategory) => {
    switch (cat) {
      case 'kill':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
            <Crosshair className="w-3 h-3" /> KILL
          </span>
        );
      case 'death':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded-full">
            <Skull className="w-3 h-3" /> DEATH
          </span>
        );
      case 'ability':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-violet-400 bg-violet-950/60 border border-violet-800/80 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" /> ABILITY
          </span>
        );
      case 'checkpoint':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
            <Flag className="w-3 h-3" /> CHECKPOINT
          </span>
        );
      case 'milestone':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2 py-0.5 rounded-full">
            <Award className="w-3 h-3" /> MILESTONE
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#0E1424] border-l border-slate-800 shadow-2xl flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>MATCH EVENT LOG</span>
              <span className="text-xs bg-slate-800 text-sky-400 px-2 py-0.5 rounded-full font-mono">
                {markers.length} TOTAL
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any milestone to warp playhead to exact tick.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="my-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clutch plays, kills, abilities..."
            className="w-full bg-slate-900/90 text-sm text-slate-200 rounded-lg pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-600 font-sans"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 border-b border-slate-800/60 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.key
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Chronological Event List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredMarkers.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs text-center">
              <Filter className="w-8 h-8 mb-2 opacity-40 text-slate-600" />
              <span>No match bookmarks match your filter criteria.</span>
            </div>
          ) : (
            filteredMarkers.map(m => {
              const isCurrent = Math.abs(m.tick - currentTick) <= 15;

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSeekToTick(m.tick);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isCurrent
                      ? 'bg-sky-950/40 border-sky-500/60 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                      : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(m.category)}
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition">
                        {m.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                      <span className="flex items-center gap-1 text-sky-400">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(m.tick)}
                      </span>
                      <span>·</span>
                      <span>TICK {String(m.tick).padStart(6, '0')}</span>
                    </div>
                  </div>

                  <button className="text-xs font-mono text-sky-400 group-hover:underline opacity-80 group-hover:opacity-100">
                    JUMP →
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
