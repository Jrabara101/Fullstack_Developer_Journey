import React from 'react';
import { graphEngine } from '../engine/relationshipEngine.js';
import { RelationshipActionButton } from './RelationshipActionButton.jsx';
import { MutualBadge } from './MutualBadge.jsx';
import { 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  MessageSquare,
  Sparkles,
  Users
} from 'lucide-react';

export function ProfileHeader({
  targetUser,
  onOpenConnections,
  onOpenDirectMessage,
}) {
  const activeUser = graphEngine.getActiveUser();
  const currentUserId = activeUser?.id;
  const targetUserId = targetUser?.id;

  const isSelf = currentUserId === targetUserId;
  const isMutual = currentUserId && targetUserId ? graphEngine.isMutual(currentUserId, targetUserId) : false;

  const followersCount = graphEngine.getFollowers(targetUserId).length;
  const followingCount = graphEngine.getFollowing(targetUserId).length;
  const mutualsCount = graphEngine.getMutualFriends(targetUserId).length;

  const milestone = currentUserId && targetUserId
    ? graphEngine.getMutualMilestone(currentUserId, targetUserId)
    : null;

  const overlapData = currentUserId && targetUserId
    ? graphEngine.getContextualOverlap(currentUserId, targetUserId)
    : { overlapUsers: [], sharedMutuals: [], count: 0 };

  return (
    <div className="w-full bg-[#FFFFFF] dark:bg-[#121316] border border-[#E2E8F0] dark:border-[#26292E] rounded-3xl overflow-hidden shadow-sm transition-colors">
      {/* Cover Banner */}
      <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-gradient-to-r from-slate-800 to-indigo-950">
        <img
          src={targetUser.coverUrl}
          alt="Cover"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Milestone memory chip positioned gracefully on cover when mutual */}
        {isMutual && milestone && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-violet-500/40 text-pink-200 text-xs px-3.5 py-1.5 rounded-full font-medium flex items-center gap-2 shadow-lg animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{milestone.tenureLabel}</span>
          </div>
        )}
      </div>

      {/* Main Profile Info Section */}
      <div className="px-6 pb-6 pt-0 relative">
        {/* Avatar Stack + Action Button Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
          {/* Avatar Container */}
          <div className="relative inline-block">
            {/* 96x96px circular avatar with continuous animated gradient ring when mutual */}
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] transition-all duration-300 ${
                isMutual
                  ? 'animate-mutual-ring shadow-[0_0_24px_rgba(236,72,153,0.35)]'
                  : 'bg-white dark:bg-zinc-900 ring-4 ring-white dark:ring-zinc-900 shadow-md'
              }`}
            >
              <img
                src={targetUser.avatarUrl}
                alt={targetUser.displayName}
                className="w-full h-full rounded-full object-cover bg-slate-100 dark:bg-zinc-800"
              />
            </div>

            {/* Overlapping status chip at bottom-right with interlocking two-rings glyph */}
            {isMutual && (
              <div
                className="absolute bottom-1 right-1 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full p-1.5 shadow-md border-2 border-white dark:border-zinc-900 animate-pulse-glow"
                title="Mutual Friend: Private channels & mutual posts unlocked"
              >
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="12" r="5" />
                  <circle cx="16" cy="12" r="5" />
                </svg>
              </div>
            )}
          </div>

          {/* Action Button Row */}
          <div className="flex items-center gap-3">
            {!isSelf ? (
              <>
                <RelationshipActionButton
                  targetUserId={targetUserId}
                  onOpenDirectMessage={onOpenDirectMessage}
                />
                {isMutual && (
                  <button
                    type="button"
                    onClick={() => onOpenDirectMessage && onOpenDirectMessage(targetUserId)}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-full border border-violet-500/30 text-violet-700 dark:text-pink-300 hover:bg-violet-50 dark:hover:bg-violet-950/20 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Send Private Direct Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Message</span>
                  </button>
                )}
              </>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                Viewing Your Own Profile
              </span>
            )}
          </div>
        </div>

        {/* Identity Row */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-zinc-50 tracking-tight">
              {targetUser.displayName}
            </h1>
            {isMutual && <MutualBadge size="md" />}
            {targetUser.isPrivate && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3" /> Private Account
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-400">
            <span className="font-mono-num font-medium">@{targetUser.username}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {targetUser.activityStatus || 'Active now'}
            </span>
          </div>

          {targetUser.bio && (
            <p className="pt-2 text-sm text-slate-700 dark:text-zinc-300 max-w-2xl leading-relaxed">
              {targetUser.bio}
            </p>
          )}
        </div>

        {/* Metadata Details (Location, Website, Joined) */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-zinc-400 pb-4 mb-4 border-b border-slate-100 dark:border-zinc-800">
          {targetUser.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{targetUser.location}</span>
            </div>
          )}
          {targetUser.website && (
            <div className="flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              <a
                href={targetUser.website}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {targetUser.website.replace('https://', '')}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{targetUser.joinedDate || 'Joined 2024'}</span>
          </div>
        </div>

        {/* Relationship Context Strip (Social Proof Radar) */}
        {!isSelf && overlapData.count > 0 && (
          <div className="mb-5 p-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Micro-stacked avatars */}
              <div className="flex -space-x-2 overflow-hidden">
                {overlapData.overlapUsers.slice(0, 3).map((u) => (
                  <img
                    key={u.id}
                    src={u.avatarUrl}
                    alt={u.displayName}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover"
                  />
                ))}
              </div>

              <div className="text-xs text-slate-600 dark:text-zinc-300">
                <span>Followed by </span>
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  {overlapData.overlapUsers.slice(0, 2).map(u => u.displayName).join(', ')}
                </span>
                {overlapData.count > 2 && (
                  <span> and {overlapData.count - 2} other account{overlapData.count > 3 ? 's' : ''} you follow</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenConnections && onOpenConnections('mutuals')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
            >
              View Overlap
            </button>
          </div>
        )}

        {/* Metric Row: Clickable Segmented Tabs with Tabular Monospace Figures */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => onOpenConnections && onOpenConnections('following')}
            className="px-3.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/70 transition-colors text-xs text-slate-600 dark:text-zinc-400 cursor-pointer"
          >
            <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono-num text-sm mr-1.5">
              {followingCount}
            </span>
            Following
          </button>

          <button
            type="button"
            onClick={() => onOpenConnections && onOpenConnections('followers')}
            className="px-3.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/70 transition-colors text-xs text-slate-600 dark:text-zinc-400 cursor-pointer"
          >
            <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono-num text-sm mr-1.5">
              {followersCount}
            </span>
            Followers
          </button>

          <button
            type="button"
            onClick={() => onOpenConnections && onOpenConnections('mutuals')}
            className={`px-3.5 py-1.5 rounded-xl transition-all text-xs cursor-pointer flex items-center gap-1.5 ${
              isMutual
                ? 'bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20 text-violet-700 dark:text-pink-300 font-medium'
                : 'hover:bg-slate-100 dark:hover:bg-zinc-800/70 text-slate-600 dark:text-zinc-400'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-pink-500" />
            <span className="font-bold font-mono-num text-sm text-slate-900 dark:text-zinc-100 mr-0.5">
              {mutualsCount}
            </span>
            <span>Mutuals</span>
          </button>
        </div>

        {/* Tiered Social Intimacy Gate: Intimate Contact Details */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2.5">
            Intimate Contact & Direct Channels
          </div>

          {isMutual || isSelf ? (
            /* Unlocked Intimate Profile Information */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-gradient-to-br from-violet-500/5 via-pink-500/5 to-transparent border border-violet-500/20 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Verified Email (Mutuals Only)</div>
                  <div className="font-mono-num font-medium">{targetUser.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Private Signal / Mobile</div>
                  <div className="font-mono-num font-medium">{targetUser.phoneNumber}</div>
                </div>
              </div>
            </div>
          ) : (
            /* Frosted Gated Placeholder */
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200/70 dark:border-zinc-800/70 flex items-center justify-between gap-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-200/70 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    Contact details visible to Mutual Friends only
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Follow back each other to unlock private phone, direct email & 1-on-1 messaging channels.
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 px-2.5 py-1 rounded-full border border-pink-500/20 shrink-0">
                Mutual Gated ✨
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
