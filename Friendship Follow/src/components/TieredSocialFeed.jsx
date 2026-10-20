import React, { useState } from 'react';
import { graphEngine } from '../engine/relationshipEngine.js';
import { ContextualHovercard } from './ContextualHovercard.jsx';
import { MutualBadge } from './MutualBadge.jsx';
import { RelationshipActionButton } from './RelationshipActionButton.jsx';
import { AudienceGate } from '../types/index.js';
import { 
  Globe, 
  Users, 
  Sparkles, 
  Lock, 
  Heart, 
  MessageCircle, 
  Send, 
  FileText, 
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export function TieredSocialFeed({
  onSelectUser,
  className = '',
}) {
  const activeUser = graphEngine.getActiveUser();
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedAudience, setSelectedAudience] = useState(AudienceGate.PUBLIC);
  const [feedFilter, setFeedFilter] = useState('all'); // 'all' | 'mutuals' | 'followers'
  const [likedPosts, setLikedPosts] = useState(new Set());

  const posts = graphEngine.posts;

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !activeUser) return;

    graphEngine.createPost(activeUser.id, newPostContent.trim(), selectedAudience);
    setNewPostContent('');
  };

  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  // Filter posts based on tab
  const filteredPosts = posts.filter(post => {
    if (feedFilter === 'mutuals') return post.audience === AudienceGate.MUTUALS;
    if (feedFilter === 'followers') return post.audience === AudienceGate.FOLLOWERS;
    return true;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Post Composer Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#121316] border border-[#E2E8F0] dark:border-[#26292E] shadow-sm">
        <form onSubmit={handleCreatePost}>
          <div className="flex items-start gap-3">
            <img
              src={activeUser.avatarUrl}
              alt={activeUser.displayName}
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-slate-100 dark:ring-zinc-800"
            />
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={`Share an update, ${activeUser.displayName.split(' ')[0]}...`}
                rows={2}
                className="w-full text-sm bg-transparent outline-none text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 resize-none"
              />

              {/* Audience Selector & Submit Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                {/* Audience Pill Selector */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/70 p-1 rounded-2xl text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedAudience(AudienceGate.PUBLIC)}
                    className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                      selectedAudience === AudienceGate.PUBLIC
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-xs'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAudience(AudienceGate.FOLLOWERS)}
                    className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                      selectedAudience === AudienceGate.FOLLOWERS
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-xs'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Followers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAudience(AudienceGate.MUTUALS)}
                    className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                      selectedAudience === AudienceGate.MUTUALS
                        ? 'bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-violet-700 dark:text-pink-300 shadow-xs border border-violet-500/30'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    <span>Mutuals Only ✨</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!newPostContent.trim()}
                  className="px-4 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Feed Filter Segment */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFeedFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              feedFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            All Activity
          </button>
          <button
            type="button"
            onClick={() => setFeedFilter('mutuals')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              feedFilter === 'mutuals'
                ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-pink-400 border border-violet-500/30'
            }`}
          >
            <Sparkles className="w-3 h-3 text-pink-300" />
            <span>Mutual Only</span>
          </button>
          <button
            type="button"
            onClick={() => setFeedFilter('followers')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              feedFilter === 'followers'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            Followers Feed
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono-num hidden sm:inline">
          {filteredPosts.length} posts
        </span>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const author = graphEngine.getUserById(post.authorId);
          if (!author) return null;

          // Check if author is muted by active user
          const isMuted = activeUser ? graphEngine.isMuted(activeUser.id, author.id) : false;
          if (isMuted) {
            return (
              <div
                key={post.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60 text-xs text-slate-400 flex items-center justify-between"
              >
                <span>Hidden post from muted mutual friend ({author.displayName})</span>
                <button
                  type="button"
                  onClick={() => graphEngine.toggleMute(activeUser.id, author.id)}
                  className="text-blue-500 hover:underline cursor-pointer"
                >
                  Unmute
                </button>
              </div>
            );
          }

          const canView = activeUser ? graphEngine.canViewContent(activeUser.id, author.id, post.audience) : false;
          const isAuthorMutual = activeUser ? graphEngine.isMutual(activeUser.id, author.id) : false;
          const isLiked = likedPosts.has(post.id);

          return (
            <div
              key={post.id}
              className={`p-5 rounded-3xl bg-white dark:bg-[#121316] border transition-all ${
                post.audience === AudienceGate.MUTUALS
                  ? 'border-violet-500/30 shadow-[0_4px_20px_rgba(236,72,153,0.06)]'
                  : 'border-[#E2E8F0] dark:border-[#26292E] shadow-sm'
              }`}
            >
              {/* Post Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <ContextualHovercard user={author} onSelectUser={onSelectUser}>
                    <div
                      className="cursor-pointer"
                      onClick={() => onSelectUser && onSelectUser(author)}
                    >
                      <div
                        className={`w-10 h-10 rounded-full p-[2px] ${
                          isAuthorMutual ? 'animate-mutual-ring' : 'bg-slate-200 dark:bg-zinc-700'
                        }`}
                      >
                        <img
                          src={author.avatarUrl}
                          alt={author.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                  </ContextualHovercard>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="font-bold text-sm text-slate-900 dark:text-zinc-100 hover:underline cursor-pointer"
                        onClick={() => onSelectUser && onSelectUser(author)}
                      >
                        {author.displayName}
                      </span>
                      {isAuthorMutual && <MutualBadge size="sm" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-num">
                      <span>@{author.username}</span>
                      <span>•</span>
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Audience Badge */}
                <div className="shrink-0">
                  {post.audience === AudienceGate.MUTUALS && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-500/15 to-pink-500/15 border border-violet-500/30 text-violet-700 dark:text-pink-300 shadow-xs">
                      <Sparkles className="w-3 h-3 text-pink-500" />
                      <span>Mutuals Only</span>
                    </span>
                  )}
                  {post.audience === AudienceGate.FOLLOWERS && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                      <Users className="w-3 h-3" />
                      <span>Followers</span>
                    </span>
                  )}
                  {post.audience === AudienceGate.PUBLIC && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 px-2 py-0.5">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Post Content with Dynamic Gating */}
              {canView ? (
                /* Unlocked Content */
                <div className="space-y-3">
                  <p className="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Optional Media */}
                  {post.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 max-h-80">
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Secret Attachment (Mutuals Exclusive) */}
                  {post.secretAttachment && (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-500/25 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                            {post.secretAttachment.title}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                            Mutual Encrypted Doc • {post.secretAttachment.size}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 cursor-pointer shadow-xs"
                      >
                        Download
                      </button>
                    </div>
                  )}

                  {/* Actions Bar (Likes, Comments) */}
                  <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-400">
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isLiked ? 'text-pink-600 dark:text-pink-400 font-bold' : 'hover:text-pink-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                      <span className="font-mono-num">{post.likesCount + (isLiked ? 1 : 0)}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-mono-num">{post.commentsCount}</span>
                    </div>

                    {isAuthorMutual && (
                      <div className="ml-auto flex items-center gap-1 text-[11px] text-pink-600 dark:text-pink-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mutual Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Frosted Gated Placeholder for Non-Mutuals / Non-Followers */
                <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-zinc-900/60 border border-dashed border-violet-400/40 dark:border-violet-500/30 text-center backdrop-blur-md">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 text-violet-600 dark:text-pink-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Lock className="w-5 h-5" />
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">
                    {post.audience === AudienceGate.MUTUALS
                      ? 'Mutual Friends Only Post'
                      : 'Follower Restricted Content'}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mb-4 leading-relaxed">
                    {post.audience === AudienceGate.MUTUALS
                      ? `${author.displayName} restricted this update to reciprocal mutual friends. Follow back to complete the friendship connection loop.`
                      : `Follow ${author.displayName} to unlock their follower-exclusive feed.`}
                  </p>

                  <div className="inline-block">
                    <RelationshipActionButton
                      targetUserId={author.id}
                      size="sm"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
