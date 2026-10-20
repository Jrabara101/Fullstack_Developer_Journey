import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAppStore } from '../store';
import { fetchGame, fetchReviews, updateUserShelf, likeReview, fetchUser } from '../lib/api';
import { HalfStarScrubber } from '../components/HalfStarScrubber';
import { FivePillarRadar } from '../components/FivePillarRadar';
import { renderMarkdownWithSpoilers } from '../components/SpoilerBlock';
import { PlaytimeSentimentHorizon } from '../components/PlaytimeSentimentHorizon';
import { AntiBrigadingInspector } from '../components/AntiBrigadingInspector';
import { ShelfStatus, GamingPlatform, GameReview } from '../types';
import { formatShelfStatus } from '../lib/utils';
import {
  Star,
  Crown,
  Heart,
  ShieldAlert,
  ThumbsUp,
  Share2,
  Filter,
  Check,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface GameDetailStageProps {
  gameId: string;
}

export const GameDetailStage: React.FC<GameDetailStageProps> = ({ gameId }) => {
  const queryClient = useQueryClient();
  const {
    activeUserId,
    navigateToProfile,
    isAntiBrigadeOpen,
    setAntiBrigadeOpen,
    setComposerOpen,
    resetReviewDraft,
  } = useAppStore();

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [minTasteSync, setMinTasteSync] = useState<number>(0);
  const [includeQuarantined, setIncludeQuarantined] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('helpful');

  // Fetch Game Details & Anomaly Telemetry
  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => fetchGame(gameId),
  });

  // Fetch Active User profile (to check user's shelf state and taste vector)
  const { data: activeUser } = useQuery({
    queryKey: ['user', activeUserId],
    queryFn: () => fetchUser(activeUserId),
  });

  // Fetch Reviews with active filters
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', gameId, statusFilter, platformFilter, minTasteSync, includeQuarantined, sortBy],
    queryFn: () =>
      fetchReviews(gameId, {
        status: statusFilter,
        platform: platformFilter,
        minTasteSync: minTasteSync > 0 ? minTasteSync : undefined,
        includeQuarantined,
        sort: sortBy,
      }),
  });

  const reviews = reviewsData?.reviews || [];

  // Shelf Status Quick-Mutation
  const shelfMutation = useMutation({
    mutationFn: (newStatus: ShelfStatus) => updateUserShelf(activeUserId, gameId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', activeUserId] });
    },
  });

  // Like Review Mutation
  const likeMutation = useMutation({
    mutationFn: (reviewId: string) => likeReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', gameId] });
    },
  });

  // Virtualizer for 60fps high-density review stream
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: reviews.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220,
    overscan: 5,
  });

  if (gameLoading || !game) {
    return (
      <div className="max-w-[1360px] mx-auto p-12 text-center text-slate-500 font-mono">
        Loading game telemetry & critic consensus...
      </div>
    );
  }

  const currentShelfStatus = activeUser?.shelves?.[game.id] || null;

  return (
    <div className="min-h-screen pb-20">
      {/* 1. BACKDROP HERO BANNER */}
      <div className="relative w-full h-[420px] overflow-hidden select-none">
        {/* Backdrop Image with Ambient Gradient Bleed */}
        <img
          src={game.backdropUrl}
          alt={game.title}
          className="w-full h-full object-cover object-center filter brightness-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-transparent to-[#07090E]/80" />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />

        {/* Banner Content Container */}
        <div className="absolute inset-0 max-w-[1360px] mx-auto px-4 sm:px-6 flex flex-col justify-end pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Title & Metadata */}
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                {game.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider bg-slate-900/80 border border-slate-700/60 text-slate-300 backdrop-blur-md"
                  >
                    {g}
                  </span>
                ))}
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {game.releaseYear}
                </span>
                <span className="text-xs font-mono text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-300">
                  {game.developer}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tight drop-shadow-md">
                {game.title}
              </h1>

              {game.tagline && (
                <p className="text-sm sm:text-base text-slate-300 font-sans italic line-clamp-2">
                  "{game.tagline}"
                </p>
              )}
            </div>

            {/* Shelf Status Quick-Switcher Buttons */}
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                Your Shelf Status
              </span>
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                {(['PLAYING', 'BEATEN', 'MASTERED_100', 'DROPPED', 'BACKLOG'] as ShelfStatus[]).map((st) => {
                  const isCurrent = currentShelfStatus === st;
                  const info = formatShelfStatus(st);

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => shelfMutation.mutate(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all duration-150 ${
                        isCurrent
                          ? `${info.bg} ${info.color} ${info.border} border shadow-sm scale-105 font-bold`
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {isCurrent && <Check className="w-3 h-3 inline mr-1" />}
                      {st === 'MASTERED_100' ? '100% Mastered' : st === 'BEATEN' ? 'Beaten' : st.toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Editorial Grid */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Poster, Aggregate Ratings, 5-Pillar Radar, Anti-Brigading Trigger */}
        <div className="lg:col-span-4 space-y-6">
          {/* Vertical Box Art Poster */}
          <div className="relative aspect-[2/3] w-full max-w-[280px] mx-auto lg:max-w-none rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
            <img
              src={game.coverUrl}
              alt={game.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0 inset-x-0 h-[1px] bg-white/20" />

            {/* Current shelf stamp badge if marked */}
            {currentShelfStatus && (
              <div className="absolute top-3 right-3 animate-fadeIn">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold border backdrop-blur-md shadow-lg ${
                    formatShelfStatus(currentShelfStatus).bg
                  } ${formatShelfStatus(currentShelfStatus).color} ${
                    formatShelfStatus(currentShelfStatus).border
                  }`}
                >
                  {formatShelfStatus(currentShelfStatus).label}
                </span>
              </div>
            )}
          </div>

          {/* Aggregate Rating & 10-Bar Histogram */}
          <div className="bg-[#10141F] border border-[#1E293B] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-black text-amber-400">
                    {game.metrics.averageRating.toFixed(1)}
                  </span>
                  <span className="text-amber-500 font-bold text-lg">★</span>
                  <span className="text-xs font-mono text-slate-400 ml-1">
                    / 5.0
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  Based on {game.metrics.totalReviews} verified critiques
                </div>
              </div>

              {/* Anti-Brigading Integrity Pill */}
              <button
                type="button"
                onClick={() => setAntiBrigadeOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition-all ${
                  game.antiBrigade?.activeQuarantine
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-950'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-cyan-400'
                }`}
                title="Inspect anti-brigading velocity telemetry and quarantine ledger"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                <span>Anti-Brigade</span>
              </button>
            </div>

            {/* 10-Bar Rating Histogram (0.5 to 5.0) */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>Rating Distribution</span>
                <span>0.5 ★ → 5.0 ★</span>
              </div>
              <div className="flex items-end gap-1.5 h-20 pt-2">
                {game.metrics.ratingHistogram.map((count, i) => {
                  const maxCount = Math.max(...game.metrics.ratingHistogram) || 1;
                  const heightPercent = Math.max(8, (count / maxCount) * 100);
                  const starLabel = ((i + 1) * 0.5).toFixed(1);

                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20 border border-slate-700">
                        {starLabel}★: {count}
                      </div>
                      <div
                        className={`w-full rounded-t transition-all duration-300 group-hover:bg-amber-300 ${
                          i >= 8 ? 'bg-amber-400' : i >= 5 ? 'bg-cyan-500/80' : 'bg-slate-700'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Completion & Median Beat Time Strip */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="bg-[#151B2B] p-2.5 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Completion Rate</span>
                <span className="text-white font-bold">{game.metrics.completionRatePercent}% Beat Story</span>
              </div>
              <div className="bg-[#151B2B] p-2.5 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Median Hours</span>
                <span className="text-cyan-400 font-bold">{game.metrics.medianHoursToBeat} hrs to Beat</span>
              </div>
            </div>
          </div>

          {/* 5-PILLAR RADAR DECK */}
          <div className="bg-[#10141F] border border-[#1E293B] rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-sm tracking-wide">
                5-Pillar Attribute Radar
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Community vs You
              </span>
            </div>

            <FivePillarRadar
              primaryPillars={game.metrics.communityPillars}
              primaryLabel="Community Consensus"
              secondaryPillars={activeUser?.tasteVector}
              secondaryLabel="Your Taste Profile"
              size={270}
            />
          </div>

          {/* Synopsis & Information Box */}
          <div className="bg-[#10141F] border border-[#1E293B] rounded-2xl p-5 shadow-lg space-y-2">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Editorial Synopsis
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {game.synopsis}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Playtime Horizon Bar & Virtualized Review Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Playtime Sentiment Horizon */}
          {game.playtimeHorizon && (
            <PlaytimeSentimentHorizon
              brackets={game.playtimeHorizon}
              gameTitle={game.title}
            />
          )}

          {/* Review Filter Bar */}
          <div className="bg-[#10141F] border border-[#1E293B] rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 mr-1" />

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#151B2B] border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="ALL">All Completion States</option>
                <option value="BEATEN">Main Story Beaten</option>
                <option value="MASTERED_100">100% Mastered</option>
                <option value="DROPPED">Dropped / Shelved</option>
                <option value="PLAYING">Still Playing</option>
              </select>

              {/* Platform Filter */}
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="bg-[#151B2B] border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="ALL">All Platforms</option>
                <option value="PC">PC</option>
                <option value="PS5">PlayStation 5</option>
                <option value="XBOX">Xbox Series X</option>
                <option value="SWITCH">Switch</option>
                <option value="DECK">Steam Deck</option>
              </select>

              {/* Taste Sync >80% Filter Toggle */}
              <button
                type="button"
                onClick={() => setMinTasteSync(minTasteSync === 80 ? 0 : 80)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                  minTasteSync >= 80
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-[#151B2B] text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 inline mr-1 text-amber-400" />
                Taste Sync &gt;80%
              </button>

              {/* Quarantined Toggle (if game has flagged surge) */}
              {game.antiBrigade?.flaggedSpikes.some((s) => s.status !== 'NORMAL') && (
                <button
                  type="button"
                  onClick={() => setIncludeQuarantined(!includeQuarantined)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    includeQuarantined
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/60'
                      : 'bg-[#151B2B] text-slate-400 border-slate-700'
                  }`}
                  title="Toggle visibility of isolated review-bomb surge reviews"
                >
                  {includeQuarantined ? 'Showing Quarantined' : 'Quarantined Hidden'}
                </button>
              )}
            </div>

            {/* Quick Log CTA button for this game */}
            <button
              onClick={() => {
                resetReviewDraft(game.id);
                setComposerOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono tracking-wider transition-colors shadow-glow-gold"
            >
              + Review This Game
            </button>
          </div>

          {/* Community Review Feed List (Virtualized) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>Showing {reviews.length} Verified Critiques</span>
              <span>Sorted by Helpful Consensus</span>
            </div>

            {reviews.length === 0 ? (
              <div className="bg-[#10141F] border border-slate-800 rounded-2xl p-12 text-center text-slate-500 font-mono text-sm">
                No reviews match the selected filter criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const statusInfo = formatShelfStatus(rev.completionStatus);

                  return (
                    <article
                      key={rev.id}
                      className={`bg-[#10141F] border rounded-2xl p-6 transition-all duration-200 hover:border-slate-700 shadow-md ${
                        rev.isFlaggedBrigade
                          ? 'border-rose-900/60 bg-rose-950/10'
                          : 'border-[#1E293B]'
                      }`}
                    >
                      {/* Review Card Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div
                          onClick={() => navigateToProfile(rev.author.id)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <img
                            src={rev.author.avatarUrl}
                            alt={rev.author.username}
                            className="w-11 h-11 rounded-full object-cover border border-slate-700 group-hover:border-cyan-400 transition-colors"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-white group-hover:text-cyan-300 transition-colors text-sm">
                                {rev.author.username}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                {rev.author.criticTier}
                              </span>
                            </div>

                            {/* Taste Sync Ring / Pill */}
                            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 mt-0.5">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>{rev.author.tasteMatchPercent || 92}% Taste Sync</span>
                            </div>
                          </div>
                        </div>

                        {/* Star Rating & Masterpiece Crown */}
                        <div className="flex items-center gap-2">
                          {rev.isMasterpiece && (
                            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                              <Crown className="w-3.5 h-3.5 fill-rose-500 text-rose-400" />
                              <span>MASTERPIECE</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-base px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25">
                            <span>{rev.starRating.toFixed(1)}</span>
                            <span className="text-xs">★</span>
                          </div>
                        </div>
                      </div>

                      {/* Context-Verification Pill Strip */}
                      <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] font-mono">
                        <span
                          className={`px-2.5 py-0.5 rounded-md border font-semibold ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                        >
                          {rev.completionStatus === 'MASTERED_100'
                            ? '100% MASTERED'
                            : rev.completionStatus === 'BEATEN'
                            ? 'STORY BEATEN'
                            : rev.completionStatus}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                          {rev.playtimeHours} HRS LOGGED
                        </span>

                        <span className="px-2.5 py-0.5 rounded-md bg-cyan-950/40 border border-cyan-800/40 text-cyan-300">
                          {rev.platformPlayed}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                          [{rev.patchVersion}]
                        </span>

                        {rev.isFlaggedBrigade && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-400 border border-rose-500/50 font-bold">
                            QUARANTINED SURGE
                          </span>
                        )}
                      </div>

                      {/* Review Prose with Spoiler Shields */}
                      <div className="text-slate-200 text-sm font-sans leading-relaxed space-y-3 mb-5">
                        {renderMarkdownWithSpoilers(rev.bodyMarkdown, gameId, currentShelfStatus || undefined)}
                      </div>

                      {/* Pillar Micro-Pills */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                        <span className="text-slate-500">Pillars:</span>
                        <span>Gameplay: <strong className="text-cyan-400">{rev.pillars.gameplay}</strong></span>
                        <span>•</span>
                        <span>Narrative: <strong className="text-cyan-400">{rev.pillars.narrative}</strong></span>
                        <span>•</span>
                        <span>Visuals: <strong className="text-cyan-400">{rev.pillars.visuals}</strong></span>
                        <span>•</span>
                        <span>Audio: <strong className="text-cyan-400">{rev.pillars.audio}</strong></span>
                        <span>•</span>
                        <span>Polish: <strong className="text-cyan-400">{rev.pillars.polish}</strong></span>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/40 text-xs font-mono text-slate-400">
                        <span className="text-slate-500">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>

                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => likeMutation.mutate(rev.id)}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Helpful ({rev.likedCount})</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Anti-Brigading Modal */}
      {game.antiBrigade && (
        <AntiBrigadingInspector
          report={game.antiBrigade}
          isOpen={isAntiBrigadeOpen}
          onClose={() => setAntiBrigadeOpen(false)}
        />
      )}
    </div>
  );
};
