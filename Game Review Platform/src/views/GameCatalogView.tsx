import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { fetchGames } from '../lib/api';
import { GameCatalogItem } from '../types';
import { Search, Filter, Sparkles, Star, Gamepad2, ArrowUpDown } from 'lucide-react';

const GENRES = [
  'ALL',
  'Action RPG',
  'CRPG',
  'Souls-like',
  'Sci-Fi',
  'Roguelike',
  'Horror',
  'Open World',
  'JRPG',
  'Platformer',
];

export const GameCatalogView: React.FC = () => {
  const { navigateToGame, setComposerOpen, resetReviewDraft } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [sortBy, setSortBy] = useState('rating');

  const { data, isLoading } = useQuery({
    queryKey: ['games', search, selectedGenre, selectedPlatform, sortBy],
    queryFn: () =>
      fetchGames({
        q: search,
        genre: selectedGenre,
        platform: selectedPlatform,
        sort: sortBy,
      }),
  });

  const games = data?.games || [];

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gamepad2 className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Verified Game Catalog
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
            Curated Titles & Masterworks
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Explore 25+ benchmark video game titles, audited with 5-pillar telemetry, completion stamps, and anti-brigading integrity filters.
          </p>
        </div>

        {/* Global Catalog Metrics */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-[#10141F] border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-slate-500 block text-[10px]">Database Volume</span>
            <span className="text-white font-bold">{games.length} Masterworks</span>
          </div>
          <div className="bg-[#10141F] border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-slate-500 block text-[10px]">Verification Model</span>
            <span className="text-cyan-400 font-bold">5-Pillar Radar</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filtering Trays */}
      <div className="bg-[#10141F] border border-[#1E293B] rounded-2xl p-4 shadow-lg mb-8 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by title, developer, or keyword..."
              className="w-full bg-[#151B2B] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Platform Selector */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-[#151B2B] border border-slate-700/80 text-xs text-slate-200 rounded-xl px-3 py-2 font-mono focus:border-cyan-500"
          >
            <option value="ALL">All Platforms</option>
            <option value="PC">PC</option>
            <option value="PS5">PlayStation 5</option>
            <option value="XBOX">Xbox Series X</option>
            <option value="SWITCH">Switch</option>
            <option value="DECK">Steam Deck</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#151B2B] border border-slate-700/80 text-xs text-slate-200 rounded-xl px-3 py-2 font-mono focus:border-cyan-500"
          >
            <option value="rating">Highest Rated (★)</option>
            <option value="reviews">Review Volume</option>
            <option value="year">Release Year</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>

        {/* Genre Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
          {GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                selectedGenre === genre
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {genre === 'ALL' ? 'All Genres' : genre}
            </button>
          ))}
        </div>
      </div>

      {/* Games Poster Grid */}
      {isLoading ? (
        <div className="py-20 text-center font-mono text-slate-500 text-sm">
          Loading catalog masterworks...
        </div>
      ) : games.length === 0 ? (
        <div className="bg-[#10141F] border border-slate-800 rounded-2xl p-16 text-center text-slate-500 font-mono text-sm">
          No games match your current filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => navigateToGame(game.id)}
              className="group cursor-pointer flex flex-col bg-[#10141F] border border-[#1E293B] rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/60 hover:-translate-y-1 shadow-lg hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.2)]"
            >
              {/* Poster 2:3 container */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Top specular highlight line */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-white/20" />

                {/* Rating Badge Overlay */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-amber-500/30 text-amber-400 font-mono font-bold text-xs shadow-md">
                  <span>{game.metrics.averageRating.toFixed(1)}</span>
                  <span>★</span>
                </div>

                {/* Platform Badge Strip */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {game.platforms.slice(0, 3).map((p) => (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-mono font-bold text-slate-300 border border-white/10"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Game Metadata Footer */}
              <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                <div>
                  <h3 className="text-sm font-display font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {game.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
                    <span>{game.developer}</span>
                    <span>{game.releaseYear}</span>
                  </div>
                </div>

                {/* 5-Pillar Micro Sparkline Preview */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Pillar Balance</span>
                    <span className="text-cyan-400">
                      G {game.metrics.communityPillars.gameplay.toFixed(0)} • N {game.metrics.communityPillars.narrative.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full"
                      style={{ width: `${(game.metrics.communityPillars.gameplay / 5) * 100}%` }}
                    />
                    <div
                      className="bg-amber-400 h-full"
                      style={{ width: `${(game.metrics.communityPillars.narrative / 5) * 100}%` }}
                    />
                    <div
                      className="bg-rose-400 h-full"
                      style={{ width: `${(game.metrics.communityPillars.visuals / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
