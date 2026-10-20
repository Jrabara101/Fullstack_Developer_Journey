import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { fetchUsers, fetchTasteMatch, fetchGames } from '../lib/api';
import { FivePillarRadar } from '../components/FivePillarRadar';
import { Sparkles, ArrowRight, UserCheck, CheckCircle2, Flame, Heart } from 'lucide-react';

export const TasteMatchDiscoveryView: React.FC = () => {
  const { activeUserId, setActiveUserId, navigateToProfile, navigateToGame } = useAppStore();
  const [targetCriticId, setTargetCriticId] = useState<string>('user-frameperfect');

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: catalogData } = useQuery({
    queryKey: ['games'],
    queryFn: () => fetchGames(),
  });

  const { data: matchResult, isLoading: matchLoading } = useQuery({
    queryKey: ['taste-match', targetCriticId, activeUserId],
    queryFn: () => fetchTasteMatch(targetCriticId, activeUserId),
  });

  const profiles = usersData?.profiles || [];
  const activeUser = profiles.find((p) => p.id === activeUserId) || profiles[0];
  const targetUser = profiles.find((p) => p.id === targetCriticId) || profiles[1];
  const games = catalogData?.games || [];

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Taste-Vector Engine
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
            Critics With Your Exact Taste
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Calculated via cosine similarity across shared game ratings and 5-pillar attribute preference vectors. Discover critics whose critical judgment mirrors your own gaming DNA.
          </p>
        </div>

        {/* Active Persona Banner */}
        <div className="bg-[#10141F] border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3">
          {activeUser && (
            <img
              src={activeUser.avatarUrl}
              alt={activeUser.username}
              className="w-12 h-12 rounded-xl object-cover border border-amber-400"
            />
          )}
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
              Active Evaluation Persona
            </span>
            <div className="text-sm font-bold text-white">
              {activeUser?.username}
            </div>
            <div className="text-xs font-mono text-amber-400">
              Signature: {activeUser?.stats.signaturePillar.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Critic Picker Grid */}
      <div className="mb-8">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
          Select Critic to Calculate Compatibility Index
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {profiles
            .filter((p) => p.id !== activeUserId)
            .map((p) => {
              const isSelected = targetCriticId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setTargetCriticId(p.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-[#181F30] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-[#10141F] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={p.avatarUrl}
                    alt={p.username}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700"
                  />
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold text-white truncate">
                      {p.username}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {p.criticTier}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Main Taste Sync Analysis Card */}
      {targetUser && matchResult && (
        <div className="bg-[#10141F] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-8">
          {/* Top Banner: Score & Verdict */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-5">
              {/* Circular Gauge */}
              <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-400 transition-all duration-1000 ease-out"
                    strokeDasharray={`${matchResult.tasteMatchPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-mono font-black text-xl text-amber-400 leading-none">
                    {matchResult.tasteMatchPercent}%
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase">
                    Sync
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest block">
                  Algorithmic Compatibility Index
                </span>
                <h2 className="text-2xl font-display font-black text-white mt-0.5">
                  {matchResult.verdict}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Evaluated across {matchResult.sharedGamesCount} shared game evaluations & 5-axis taste matrices
                </p>
              </div>
            </div>

            <button
              onClick={() => navigateToProfile(targetUser.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition-colors shadow-glow-cyan"
            >
              <span>Visit Critic's Museum</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Radar Overlay & Pillar Delta Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Dual 5-Pillar Radar Overlay */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                Comparative 5-Pillar Radar Overlay
              </span>
              <FivePillarRadar
                primaryPillars={activeUser.tasteVector || { gameplay: 4.5, narrative: 4.5, visuals: 4.5, audio: 4.5, polish: 4.5 }}
                primaryLabel={`${activeUser.username.split(' ')[0]} (You)`}
                secondaryPillars={targetUser.tasteVector || { gameplay: 4.5, narrative: 4.5, visuals: 4.5, audio: 4.5, polish: 4.5 }}
                secondaryLabel={targetUser.username.split(' ')[0]}
                size={300}
              />
            </div>

            {/* Right: Axis-by-Axis Alignment Breakdown */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-display font-bold text-white tracking-wide">
                Pillar Alignment & Variance Breakdown
              </h3>

              <div className="space-y-3 font-mono text-xs">
                {matchResult.pillarAlignment.map((p) => {
                  const isHighAgreement = p.delta <= 0.6;
                  return (
                    <div
                      key={p.pillar}
                      className="p-3 rounded-xl bg-[#151B2B] border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isHighAgreement ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        <span className="capitalize font-bold text-slate-200">
                          {p.pillar}
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-cyan-400 font-bold">
                          You: {p.userWeight.toFixed(1)}
                        </span>
                        <span className="text-amber-400 font-bold">
                          Critic: {p.targetWeight.toFixed(1)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isHighAgreement
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Δ {p.delta.toFixed(1)} {isHighAgreement ? 'Aligned' : 'Divergent'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shared Favorites Spotlight */}
              {matchResult.sharedFavorites && matchResult.sharedFavorites.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">
                    Titles You Both Acclaimed
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {matchResult.sharedFavorites.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => navigateToGame(g.id)}
                        className="bg-[#151B2B] border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer hover:border-cyan-400 transition-colors"
                      >
                        <img
                          src={g.coverUrl}
                          alt={g.title}
                          className="w-9 h-12 object-cover rounded-md"
                        />
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-white truncate">
                            {g.title}
                          </div>
                          <div className="text-[10px] font-mono text-amber-400">
                            {g.metrics.averageRating.toFixed(1)} ★
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
