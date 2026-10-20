import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { fetchLists, likeList } from '../lib/api';
import { BookOpen, ThumbsUp, Sparkles, ExternalLink, User } from 'lucide-react';

export const QuestListsView: React.FC = () => {
  const queryClient = useQueryClient();
  const { navigateToGame, navigateToProfile } = useAppStore();

  const { data, isLoading } = useQuery({
    queryKey: ['lists'],
    queryFn: fetchLists,
  });

  const likeMutation = useMutation({
    mutationFn: (listId: string) => likeList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  const lists = data?.lists || [];

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              Curated Quest Lists
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
            Thematic Collections & Deep Dives
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Ranked anthologies, intellectual essays, and niche design studies authored by vetted critics with bespoke per-game annotations.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center font-mono text-slate-500 text-sm">
          Loading quest lists...
        </div>
      ) : (
        <div className="space-y-8">
          {lists.map((list) => (
            <div
              key={list.id}
              className="bg-[#10141F] border border-[#1E293B] rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-6"
            >
              {/* List Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                      {list.title}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-2xl">
                    {list.description}
                  </p>
                </div>

                {/* Curator & Like Action */}
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => navigateToProfile(list.curator.id)}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <img
                      src={list.curator.avatarUrl}
                      alt={list.curator.username}
                      className="w-9 h-9 rounded-full object-cover border border-purple-500/40 group-hover:border-cyan-400 transition-colors"
                    />
                    <div className="text-left font-mono">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors block">
                        {list.curator.username}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {list.curator.criticTier}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => likeMutation.mutate(list.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{list.likesCount}</span>
                  </button>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {list.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Games & Curator Notes Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {list.games.map((game, i) => {
                  const note = list.notes[game.id];

                  return (
                    <div
                      key={game.id}
                      className="bg-[#151B2B] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3 group hover:border-purple-500/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={game.coverUrl}
                          alt={game.title}
                          onClick={() => navigateToGame(game.id)}
                          className="w-16 h-24 object-cover rounded-lg border border-slate-700 cursor-pointer group-hover:scale-105 transition-transform"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-purple-400 font-bold">
                            <span>ENTRY #{i + 1}</span>
                          </div>
                          <h4
                            onClick={() => navigateToGame(game.id)}
                            className="font-display font-bold text-white text-sm hover:text-cyan-300 cursor-pointer transition-colors"
                          >
                            {game.title}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400 block">
                            {game.developer} • {game.releaseYear}
                          </span>
                          <span className="text-amber-400 font-mono font-bold text-xs inline-block">
                            {game.metrics.averageRating.toFixed(1)} ★
                          </span>
                        </div>
                      </div>

                      {/* Curator Note */}
                      {note && (
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-sans italic leading-relaxed">
                          "{note}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
