import React, { useState } from 'react';
import { Hash, Heart, MessageCircle, Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAppStore } from '../../stores/useAppStore';
import { useDiscovery } from '../../hooks/useSocialQueries';
import { StoryAvatar } from '../common/StoryAvatar';
import { RelationshipButton } from '../common/RelationshipButton';
import { FeedPostCard } from '../feed/FeedPostCard';
import type { FeedPost } from '../../types/social';
import { cn, formatCompactCount } from '../../lib/utils';

export const ExploreView: React.FC = () => {
  const exploreTag = useAppStore((s) => s.exploreTag);
  const navigateToExploreTag = useAppStore((s) => s.navigateToExploreTag);
  const navigateToProfile = useAppStore((s) => s.navigateToProfile);
  const { data: discovery } = useDiscovery();

  const [query, setQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['explore', query, exploreTag],
    queryFn: () => api.explore({ q: query, tag: exploreTag }),
  });

  const posts = data?.posts || [];
  const people = data?.people || [];

  const tags = discovery?.trendingTags || [];

  return (
    <div className="max-w-3xl mx-auto py-6 px-2 space-y-6 pb-24">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-2xl text-primary-ink">
            Explore &amp; Topics
          </h1>
          {exploreTag && (
            <button
              type="button"
              onClick={() => navigateToExploreTag('')}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#2563EB]/15 text-[#2563EB] text-xs font-semibold cursor-pointer"
            >
              <span>#{exploreTag}</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-muted-ink absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photography, creators, cities, or #tags..."
            className="w-full h-11 rounded-2xl bg-surface-elevated border border-divider pl-10 pr-4 text-sm text-primary-ink placeholder:text-muted-ink outline-none focus:border-[#2563EB]"
          />
        </div>

        {/* Topic Tag Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => navigateToExploreTag('')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap cursor-pointer',
              !exploreTag
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-surface-elevated border-divider text-muted-ink hover:text-primary-ink'
            )}
          >
            All Topics
          </button>
          {tags.map((t) => (
            <button
              key={t.tag}
              type="button"
              onClick={() => navigateToExploreTag(t.tag)}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap cursor-pointer',
                exploreTag.toLowerCase() === t.tag.toLowerCase()
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-surface-elevated border-divider text-primary-ink hover:border-[#2563EB]'
              )}
            >
              <Hash className="w-3 h-3 text-[#2563EB]" />
              <span>{t.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Matching Creators Strip */}
      {people.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-ink">
            Creators
          </h2>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {people.map((person) => (
              <div
                key={person.id}
                className="w-48 shrink-0 rounded-2xl border border-divider bg-surface-elevated p-3.5 flex flex-col items-center text-center gap-2"
              >
                <StoryAvatar
                  src={person.avatar_url}
                  alt={person.display_name}
                  size="lg"
                  hasActiveStory={person.has_active_story}
                  hasUnseenStory={person.has_unseen_story}
                  isOnline={person.is_online}
                  onClick={() => navigateToProfile(person.username)}
                />
                <button
                  type="button"
                  onClick={() => navigateToProfile(person.username)}
                  className="min-w-0 w-full cursor-pointer"
                >
                  <div className="text-xs font-bold text-primary-ink truncate hover:underline">
                    {person.display_name}
                  </div>
                  <div className="text-[11px] text-muted-ink truncate">@{person.username}</div>
                </button>
                <RelationshipButton profile={person} compact />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discovery Masonry Grid */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-ink">
          Curated Visual Stream
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-surface-secondary animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-divider bg-surface-elevated p-12 text-center text-xs text-muted-ink">
            No matching posts found.
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 gap-2.5 space-y-2.5">
            {posts.map((p) => {
              const first = p.media_items[0];
              if (!first) return null;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPost(p)}
                  className="relative w-full break-inside-avoid rounded-2xl overflow-hidden border border-divider bg-surface-elevated group block cursor-pointer"
                >
                  {first.type === 'video' ? (
                    <video
                      src={first.url}
                      muted
                      loop
                      playsInline
                      className="w-full h-auto object-cover"
                    />
                  ) : (
                    <img
                      src={first.url}
                      alt={first.alt || p.caption}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity flex flex-col justify-between p-3 text-white">
                    <span className="text-[11px] font-semibold self-start">
                      @{p.author.username}
                    </span>
                    <div className="flex items-center justify-center gap-4 font-mono-tabular text-xs font-bold">
                      {!p.hide_like_count && (
                        <span className="inline-flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-white" />{' '}
                          {formatCompactCount(p.likes_count)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />{' '}
                        {formatCompactCount(p.comments_count)}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/75 truncate text-left">
                      {p.location || p.tags[0] || ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedPost && (
        <div
          className="fixed inset-0 z-[105] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedPost(null)}
        >
          <div className="w-full max-w-xl my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="p-2 rounded-full glass-hud text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <FeedPostCard post={selectedPost} />
          </div>
        </div>
      )}
    </div>
  );
};
