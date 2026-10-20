import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { fetchUser, fetchTasteMatch, fetchGames } from '../lib/api';
import { TopFourPlinth } from '../components/TopFourPlinth';
import { PlayDiaryHeatmap } from '../components/PlayDiaryHeatmap';
import { CriticPassportModal } from '../components/CriticPassportModal';
import { FivePillarRadar } from '../components/FivePillarRadar';
import { renderMarkdownWithSpoilers } from '../components/SpoilerBlock';
import { ShelfStatus, GameCatalogItem } from '../types';
import { formatShelfStatus } from '../lib/utils';
import {
  Sparkles,
  Share2,
  UserCheck,
  Award,
  BookOpen,
  Gamepad2,
  Calendar,
  Layers,
  Crown,
} from 'lucide-react';

interface CriticProfileHubProps {
  profileId: string;
}

export const CriticProfileHub: React.FC<CriticProfileHubProps> = ({ profileId }) => {
  const { activeUserId, navigateToGame, isPassportOpen, setPassportOpen } = useAppStore();
  const [activeShelfTab, setActiveShelfTab] = useState<ShelfStatus | 'ALL' | 'REVIEWS'>('ALL');
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch Critic Profile Details
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', profileId],
    queryFn: () => fetchUser(profileId),
  });

  // Fetch Taste Compatibility against Active User
  const { data: tasteMatch } = useQuery({
    queryKey: ['taste-match', profileId, activeUserId],
    queryFn: () => fetchTasteMatch(profileId, activeUserId),
    enabled: !!profile && profileId !== activeUserId,
  });

  // Fetch Catalog to populate shelves
  const { data: catalogData } = useQuery({
    queryKey: ['games'],
    queryFn: () => fetchGames(),
  });

  if (isLoading || !profile) {
    return (
      <div className="max-w-[1360px] mx-auto p-12 text-center text-slate-500 font-mono">
        Loading Critic Identity & Curated Museum...
      </div>
    );
  }

  const allGames = catalogData?.games || [];
  const topFourGames = profile.topFourGames || [];

  // Filter games based on profile shelves
  const shelfMap = profile.shelves || {};
  const shelvedGames = allGames.filter((g) => {
    const status = shelfMap[g.id];
    if (activeShelfTab === 'ALL') return !!status;
    return status === activeShelfTab;
  });

  const tastePercent = tasteMatch?.tasteMatchPercent ?? 94;

  return (
    <div className="min-h-screen pb-24">
      {/* 1. PROFILE BANNER & IDENTITY BAR */}
      <div className="relative w-full h-[280px] sm:h-[340px] overflow-hidden">
        <img
          src={profile.bannerUrl}
          alt={profile.username}
          className="w-full h-full object-cover object-center filter brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/60 to-transparent" />

        <div className="absolute inset-0 max-w-[1360px] mx-auto px-4 sm:px-6 flex flex-col justify-end pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            {/* Avatar & Bio */}
            <div className="flex items-end gap-5">
              <div className="relative">
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                />
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300">
                  {profile.criticTier}
                </span>
              </div>

              <div className="space-y-1.5 pb-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
                    {profile.username}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-xl leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            </div>

            {/* Right: Circular Taste Compatibility Gauge & CTAs */}
            <div className="flex items-center gap-4">
              {profileId !== activeUserId && (
                <div
                  className="flex items-center gap-3 bg-[#10141F]/90 border border-amber-500/30 p-2.5 rounded-2xl backdrop-blur-md shadow-lg"
                  title="Taste Compatibility calculated via 5-Pillar & Rating Vector Cosine Similarity"
                >
                  {/* Circular SVG Gauge */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-amber-400 transition-all duration-1000 ease-out"
                        strokeDasharray={`${tastePercent}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-amber-400">
                      {tastePercent}%
                    </span>
                  </div>

                  <div className="text-left font-mono pr-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
                      Taste Sync
                    </span>
                    <span className="text-xs text-amber-300 font-bold">
                      Harmonic Match
                    </span>
                  </div>
                </div>
              )}

              {/* Follow CTA */}
              <button
                type="button"
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all ${
                  isFollowing
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan'
                }`}
              >
                {isFollowing ? 'Following Critic' : '+ Follow Critic'}
              </button>

              {/* Passport Export Button */}
              <button
                type="button"
                onClick={() => setPassportOpen(true)}
                className="p-2.5 rounded-xl bg-[#181F30] hover:bg-[#1E293B] border border-slate-700 text-slate-200 transition-colors"
                title="Generate & Export Shareable Critic Passport Card"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* 2. THE TOP 4 PLINTH SHOWCASE */}
        <TopFourPlinth
          games={topFourGames}
          criticUsername={profile.username}
          isOwner={profileId === activeUserId}
        />

        {/* 3. 365-DAY PLAY DIARY HEATMAP */}
        <PlayDiaryHeatmap
          activityData={profile.activityHeatmap}
          totalGamesLogged={profile.stats.totalGamesLogged}
          totalReviewsWritten={profile.stats.totalReviewsWritten}
          hoursLoggedThisYear={profile.stats.hoursLoggedThisYear}
          meanRating={profile.stats.meanRating}
        />

        {/* 4. SHELF MATRIX TABS & VIRTUALIZED POSTER GRID */}
        <div className="mt-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-bold text-white text-base tracking-wide">
                Library Shelves & Critic Chronicles
              </h3>
            </div>

            {/* Shelf Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
              {(
                [
                  { id: 'ALL', label: 'All Shelved' },
                  { id: 'MASTERED_100', label: '100% Mastered' },
                  { id: 'BEATEN', label: 'Beaten' },
                  { id: 'PLAYING', label: 'Playing' },
                  { id: 'DROPPED', label: 'Dropped' },
                  { id: 'REVIEWS', label: 'Reviews' },
                ] as const
              ).map((tab) => {
                const isActive = activeShelfTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveShelfTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                      isActive
                        ? 'bg-[#181F30] text-cyan-400 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shelved Posters Grid */}
          {activeShelfTab !== 'REVIEWS' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {shelvedGames.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 font-mono text-xs">
                  No games currently filed under this shelf category.
                </div>
              ) : (
                shelvedGames.map((game) => {
                  const status = shelfMap[game.id];
                  const statusInfo = status ? formatShelfStatus(status) : null;

                  return (
                    <div
                      key={game.id}
                      onClick={() => navigateToGame(game.id)}
                      className="group cursor-pointer relative aspect-[2/3] rounded-xl overflow-hidden border border-slate-800 bg-[#10141F] transition-all duration-200 hover:border-cyan-500/50 hover:scale-[1.03] shadow-md"
                    >
                      <img
                        src={game.coverUrl}
                        alt={game.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Top Specular Highlight */}
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-white/15" />

                      {/* Shelf Stamp Badge */}
                      {statusInfo && (
                        <div className="absolute top-2 right-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border backdrop-blur-md ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                          >
                            {status === 'MASTERED_100' ? '100%' : status === 'BEATEN' ? 'Beaten' : status}
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                        <h4 className="text-xs font-display font-bold text-white line-clamp-1">
                          {game.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                          <span>{game.releaseYear}</span>
                          <span className="text-amber-400 font-bold">
                            {game.metrics.averageRating.toFixed(1)} ★
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Published Reviews Tab */
            <div className="space-y-4">
              {profile.recentReviews && profile.recentReviews.length > 0 ? (
                profile.recentReviews.map((rev) => (
                  <div
                    key={rev.id}
                    onClick={() => navigateToGame(rev.gameId)}
                    className="p-5 rounded-2xl bg-[#10141F] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-white text-sm hover:text-cyan-400 transition-colors">
                          Review for: {allGames.find((g) => g.id === rev.gameId)?.title || rev.gameId}
                        </span>
                        {rev.isMasterpiece && (
                          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40">
                            <Crown className="w-3 h-3 fill-rose-500" />
                            <span>MASTERPIECE</span>
                          </span>
                        )}
                      </div>

                      <div className="text-amber-400 font-mono font-bold text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {rev.starRating.toFixed(1)} ★
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-3">
                      {rev.bodyMarkdown}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                      <span>{rev.platformPlayed} • {rev.playtimeHours} hrs logged</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  No published essays found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Critic Passport Modal */}
      <CriticPassportModal
        profile={profile}
        topGames={topFourGames}
        isOpen={isPassportOpen}
        onClose={() => setPassportOpen(false)}
      />
    </div>
  );
};
