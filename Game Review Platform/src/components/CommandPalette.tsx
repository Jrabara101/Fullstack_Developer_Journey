import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { searchGlobal } from '../lib/api';
import { Search, Gamepad2, User, BookOpen, X, ArrowRight } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, navigateToGame, navigateToProfile, setCurrentView } =
    useAppStore();
  const [query, setQuery] = useState('');

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  const { data } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchGlobal(query),
    enabled: query.trim().length > 0,
  });

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0D111C] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#10141F]">
          <Search className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, critics, or curated quest lists... (Cmd+K)"
            className="w-full bg-transparent text-white placeholder-slate-500 font-sans text-sm focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!query && (
            <div className="p-4 text-center text-xs font-mono text-slate-500">
              Type to search 25+ iconic titles, critic profiles, and quest lists
            </div>
          )}

          {/* Games Category */}
          {data?.games && data.games.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Games</span>
              </div>
              <div className="space-y-1 mt-1">
                {data.games.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => {
                      navigateToGame(g.id);
                      setCommandPaletteOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#181F30] cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={g.coverUrl}
                        alt={g.title}
                        className="w-8 h-11 object-cover rounded-md border border-slate-800"
                      />
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {g.title}
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          {g.releaseYear} • {g.developer}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {g.metrics.averageRating.toFixed(1)} ★
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critics Category */}
          {data?.critics && data.critics.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                <span>Critics</span>
              </div>
              <div className="space-y-1 mt-1">
                {data.critics.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      navigateToProfile(c.id);
                      setCommandPaletteOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#181F30] cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={c.avatarUrl}
                        alt={c.username}
                        className="w-9 h-9 rounded-full object-cover border border-amber-500/30"
                      />
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                          {c.username}
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          {c.criticTier} • {c.stats.totalReviewsWritten} reviews
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quest Lists Category */}
          {data?.lists && data.lists.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Curated Quest Lists</span>
              </div>
              <div className="space-y-1 mt-1">
                {data.lists.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      setCurrentView('lists');
                      setCommandPaletteOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#181F30] cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {l.title}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1">
                        {l.description}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && data?.games?.length === 0 && data?.critics?.length === 0 && data?.lists?.length === 0 && (
            <div className="p-6 text-center text-xs font-mono text-slate-500">
              No matching games or critics found for "{query}"
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2 bg-[#10141F] border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Navigation: Click or Enter</span>
          <span>Close: Esc</span>
        </div>
      </div>
    </div>
  );
};
