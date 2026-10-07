import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Users, 
  Sparkles, 
  Lock, 
  Send, 
  Image as ImageIcon, 
  Heart, 
  MessageSquare, 
  Share2, 
  ShieldCheck, 
  Filter,
  Sparkle
} from 'lucide-react';
import { useSocialGraph } from '../context/SocialGraphContext';
import { isFollowing, isMutual } from '../utils/graphAlgorithms';
import { MutualBadge } from './MutualBadge';
import { HovercardPreview } from './HovercardPreview';
import { RelationshipActionButton } from './RelationshipActionButton';

export function FeedView({ onSelectUser }) {
  const { 
    posts, 
    users, 
    relationships, 
    mutes, 
    currentUserId, 
    currentUser, 
    createPost 
  } = useSocialGraph();

  const [feedFilter, setFeedFilter] = useState('ALL'); // 'ALL' | 'public' | 'followers' | 'mutuals'
  const [composerText, setComposerText] = useState('');
  const [composerAudience, setComposerAudience] = useState('public'); // 'public' | 'followers' | 'mutuals'
  const [composerMediaUrl, setComposerMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);

  // Filter posts respecting mutes and selected audience filter
  const visiblePosts = useMemo(() => {
    return posts.filter(post => {
      // Check if author is muted by current user
      const isAuthorMuted = mutes.some(m => m.userId === currentUserId && m.mutedUserId === post.authorId);
      if (isAuthorMuted) return false;

      if (feedFilter !== 'ALL' && post.audience !== feedFilter) {
        return false;
      }
      return true;
    });
  }, [posts, mutes, currentUserId, feedFilter]);

  const handlePublish = (e) => {
    e.preventDefault();
    if (!composerText.trim()) return;

    createPost(composerText.trim(), composerAudience, composerMediaUrl || null);
    setComposerText('');
    setComposerMediaUrl('');
    setShowMediaInput(false);
  };

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------------- */}
      {/* POST COMPOSER WITH TIERED AUDIENCE SELECTOR                          */}
      {/* -------------------------------------------------------------------- */}
      <div className="rounded-3xl glass-panel border border-slate-800 p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/30 shrink-0"
          />

          <div className="flex-1 min-w-0">
            <textarea
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder={`What are you building or thinking, ${currentUser.displayName.split(' ')[0]}?`}
              rows={2}
              className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />

            {showMediaInput && (
              <input
                type="text"
                value={composerMediaUrl}
                onChange={(e) => setComposerMediaUrl(e.target.value)}
                placeholder="Paste image or graph screenshot URL..."
                className="mt-2 w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            )}

            {/* Bottom Row: Audience Picker & Publish Button */}
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">
                  Audience Gate:
                </span>

                <div className="inline-flex rounded-xl bg-slate-900/80 p-0.5 border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setComposerAudience('public')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      composerAudience === 'public'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>Public</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComposerAudience('followers')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      composerAudience === 'followers'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span>Followers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComposerAudience('mutuals')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                      composerAudience === 'mutuals'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-sm'
                        : 'text-amber-400/80 hover:text-amber-300'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Mutuals Only</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMediaInput(prev => !prev)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    showMediaInput 
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Attach Media URL"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handlePublish}
                disabled={!composerText.trim()}
                className="px-4 py-1.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-[0.98]"
              >
                <Send className="w-3 h-3" />
                <span>Publish</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* FEED FILTER TABS                                                     */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setFeedFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              feedFilter === 'ALL'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Updates ({posts.length})
          </button>

          <button
            onClick={() => setFeedFilter('public')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              feedFilter === 'public'
                ? 'bg-slate-800 text-indigo-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3 h-3 text-indigo-400" />
            <span>Public</span>
          </button>

          <button
            onClick={() => setFeedFilter('followers')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              feedFilter === 'followers'
                ? 'bg-slate-800 text-teal-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3 h-3 text-teal-400" />
            <span>Followers</span>
          </button>

          <button
            onClick={() => setFeedFilter('mutuals')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              feedFilter === 'mutuals'
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Mutuals Only</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-indigo-400" />
          <span>RLS Enforced</span>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* POSTS LIST                                                           */}
      {/* -------------------------------------------------------------------- */}
      <div className="space-y-4">
        {visiblePosts.map(post => {
          const author = users.find(u => u.id === post.authorId);
          const isMe = post.authorId === currentUserId;
          const userFollowsAuthor = isFollowing(relationships, currentUserId, post.authorId);
          const isMutualWithAuthor = isMutual(relationships, currentUserId, post.authorId);

          // Evaluate Access according to Tiered Social Intimacy Gate
          let hasAccess = false;
          if (isMe) {
            hasAccess = true;
          } else if (post.audience === 'public') {
            hasAccess = true;
          } else if (post.audience === 'followers') {
            hasAccess = userFollowsAuthor || isMutualWithAuthor;
          } else if (post.audience === 'mutuals') {
            hasAccess = isMutualWithAuthor;
          }

          return (
            <div 
              key={post.id} 
              className={`rounded-3xl glass-panel border transition-all duration-300 p-5 ${
                post.audience === 'mutuals'
                  ? 'border-amber-500/30 bg-gradient-to-b from-amber-500/[0.04] to-transparent shadow-[0_0_20px_rgba(234,179,8,0.06)]'
                  : 'border-slate-800/80 hover:border-slate-700/80 shadow-lg'
              }`}
            >
              {/* Header: Author + Audience Badge + Relationship Button */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <HovercardPreview userId={post.authorId} onSelectUser={onSelectUser}>
                    <img
                      src={author?.avatar}
                      alt={author?.displayName}
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-800 cursor-pointer"
                    />
                  </HovercardPreview>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <HovercardPreview userId={post.authorId} onSelectUser={onSelectUser}>
                        <span 
                          onClick={() => onSelectUser && onSelectUser(post.authorId)}
                          className="font-bold text-xs text-white hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          {author?.displayName}
                        </span>
                      </HovercardPreview>
                      {isMutualWithAuthor && <MutualBadge size="sm" />}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span>@{author?.username}</span>
                      <span>•</span>
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Right Header: Audience Pill & Quick Follow Button */}
                <div className="flex items-center gap-2">
                  {post.audience === 'public' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      <Globe className="w-2.5 h-2.5 text-indigo-400" />
                      <span>Public</span>
                    </span>
                  )}

                  {post.audience === 'followers' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      <Users className="w-2.5 h-2.5 text-teal-400" />
                      <span>Followers Only</span>
                    </span>
                  )}

                  {post.audience === 'mutuals' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span>Mutuals Only ✨</span>
                    </span>
                  )}

                  {!isMe && (
                    <RelationshipActionButton targetUserId={post.authorId} size="sm" />
                  )}
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* BODY: GATED CONTENT OR UNLOCKED CONTENT                      */}
              {/* ------------------------------------------------------------ */}
              {hasAccess ? (
                <div>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {post.mediaUrl && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-slate-800/80 max-h-72">
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Gated / Locked Content Teaser */
                <div className="my-2 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center relative overflow-hidden backdrop-blur-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-amber-500/5 to-indigo-500/5 pointer-events-none" />
                  
                  <div className="relative z-10 max-w-sm mx-auto">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-2 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <Lock className="w-4 h-4" />
                    </div>

                    <h4 className="text-xs font-bold text-white tracking-wide">
                      {post.audience === 'mutuals' 
                        ? 'Mutual Friendship Required' 
                        : 'Subscribers Only'}
                    </h4>

                    <p className="text-[11px] text-slate-400 mt-1 mb-3">
                      {post.audience === 'mutuals'
                        ? `@${author?.username} published this story exclusively for mutual friends. Reciprocate their follow to unlock.`
                        : `Follow @${author?.username} to unlock this creator post.`}
                    </p>

                    <div className="flex justify-center">
                      <RelationshipActionButton targetUserId={post.authorId} size="sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Engagement Counters */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{post.likesCount}</span>
                  </button>

                  <button className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.commentsCount}</span>
                  </button>

                  <button className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isMutualWithAuthor && (
                  <span className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1">
                    <Sparkle className="w-2.5 h-2.5" />
                    Mutual privilege active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
