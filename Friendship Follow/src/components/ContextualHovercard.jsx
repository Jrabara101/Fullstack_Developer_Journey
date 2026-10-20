import React, { useState, useRef } from 'react';
import { graphEngine } from '../engine/relationshipEngine.js';
import { RelationshipActionButton } from './RelationshipActionButton.jsx';
import { MutualBadge } from './MutualBadge.jsx';

export function ContextualHovercard({
  user,
  children,
  onSelectUser = null,
  onOpenDirectMessage = null,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const activeUser = graphEngine.getActiveUser();

  if (!user) return children;

  const isMutual = activeUser ? graphEngine.isMutual(activeUser.id, user.id) : false;
  const theyFollowMe = activeUser ? graphEngine.hasEdge(user.id, activeUser.id) : false;
  const iFollowThem = activeUser ? graphEngine.hasEdge(activeUser.id, user.id) : false;
  const isSelf = activeUser?.id === user.id;

  const overlapData = activeUser
    ? graphEngine.getContextualOverlap(activeUser.id, user.id)
    : { overlapUsers: [], sharedMutuals: [], count: 0 };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 250);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Target Trigger (e.g. Avatar or @mention) */}
      <div className="cursor-pointer">
        {children}
      </div>

      {/* Floating 320px Hovercard */}
      {isOpen && (
        <div
          className="absolute left-0 bottom-full mb-2 w-80 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-50 p-4 transition-all duration-200 animate-in fade-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Row: Mini Avatar (44px) + Action Button */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div
              className="relative cursor-pointer"
              onClick={() => onSelectUser && onSelectUser(user)}
            >
              {/* Animated ring if mutual */}
              <div
                className={`w-11 h-11 rounded-full p-[2px] ${
                  isMutual ? 'animate-mutual-ring' : 'bg-slate-200 dark:bg-zinc-700'
                }`}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-full h-full rounded-full object-cover bg-slate-100 dark:bg-zinc-800"
                />
              </div>

              {/* Status pill glyph */}
              {isMutual && (
                <div
                  className="absolute -bottom-1 -right-1 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full p-1 shadow-sm border border-white dark:border-zinc-900"
                  title="Mutual Friend"
                >
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="8" cy="12" r="5" />
                    <circle cx="16" cy="12" r="5" />
                  </svg>
                </div>
              )}
            </div>

            {!isSelf && (
              <RelationshipActionButton
                targetUserId={user.id}
                size="sm"
                onOpenDirectMessage={onOpenDirectMessage}
              />
            )}
          </div>

          {/* Middle Row: Name, Handle, Bio */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                onClick={() => onSelectUser && onSelectUser(user)}
                className="font-bold text-sm text-slate-900 dark:text-zinc-100 hover:underline cursor-pointer"
              >
                {user.displayName}
              </span>

              {isMutual && <MutualBadge size="sm" />}

              {!isMutual && theyFollowMe && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-medium">
                  Follows you
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono-num">
              @{user.username}
            </div>

            {user.bio && (
              <p className="mt-2 text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                {user.bio}
              </p>
            )}
          </div>

          {/* Metrics summary */}
          <div className="flex items-center gap-4 text-xs font-mono-num text-slate-500 dark:text-zinc-400 mb-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-zinc-100">
                {graphEngine.getFollowing(user.id).length}
              </span>{' '}
              Following
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-zinc-100">
                {graphEngine.getFollowers(user.id).length}
              </span>{' '}
              Followers
            </div>
            {isMutual && (
              <div className="text-pink-600 dark:text-pink-400 font-medium">
                <span className="font-bold">
                  {graphEngine.getMutualFriends(user.id).length}
                </span>{' '}
                Mutuals
              </div>
            )}
          </div>

          {/* Bottom Footer: Shared Mutuals Cluster */}
          {overlapData.count > 0 ? (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
              <div className="flex -space-x-1.5 overflow-hidden">
                {overlapData.overlapUsers.slice(0, 3).map((ou) => (
                  <img
                    key={ou.id}
                    src={ou.avatarUrl}
                    alt={ou.displayName}
                    className="inline-block h-4 w-4 rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover"
                  />
                ))}
              </div>
              <span className="truncate">
                Followed by{' '}
                <strong className="text-slate-700 dark:text-zinc-300">
                  {overlapData.overlapUsers[0]?.displayName || 'mutual connections'}
                </strong>
                {overlapData.count > 1 ? ` + ${overlapData.count - 1} other mutual${overlapData.count > 2 ? 's' : ''}` : ''}
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 italic pt-1">
              {user.isPrivate ? '🔒 Private account' : 'Public account'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
