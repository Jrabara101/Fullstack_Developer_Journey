import React, { useState, useMemo, useEffect } from 'react';
import { graphEngine } from '../engine/relationshipEngine.js';
import { RelationshipActionButton } from './RelationshipActionButton.jsx';
import { MutualBadge } from './MutualBadge.jsx';
import { Search, X, Users, UserCheck, HeartHandshake } from 'lucide-react';

export function SocialConnectionsDrawer({
  targetUser,
  initialTab = 'followers',
  isOpen,
  onClose,
  onSelectUser,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    const unsubscribe = graphEngine.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  const activeUser = graphEngine.getActiveUser();

  const followers = useMemo(() => {
    return targetUser ? graphEngine.getFollowers(targetUser.id) : [];
  }, [targetUser, isOpen, tick]);

  const following = useMemo(() => {
    return targetUser ? graphEngine.getFollowing(targetUser.id) : [];
  }, [targetUser, isOpen, tick]);

  const mutuals = useMemo(() => {
    return targetUser ? graphEngine.getMutualFriends(targetUser.id) : [];
  }, [targetUser, isOpen, tick]);

  if (!isOpen || !targetUser) return null;

  const currentList = activeTab === 'followers'
    ? followers
    : activeTab === 'following'
    ? following
    : mutuals;

  const filteredList = currentList.filter(u =>
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.bio && u.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-[#26292E] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-zinc-50">
              Connections for {targetUser.displayName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono-num">
              @{targetUser.username}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="px-4 pt-3 pb-2 flex gap-1.5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
          <button
            type="button"
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'followers'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Followers</span>
            <span className="font-mono-num font-bold text-[11px] opacity-75">
              ({followers.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'following'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Following</span>
            <span className="font-mono-num font-bold text-[11px] opacity-75">
              ({following.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mutuals')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'mutuals'
                ? 'bg-gradient-to-r from-violet-500/15 to-pink-500/15 border border-violet-500/30 text-violet-700 dark:text-pink-300 shadow-sm font-bold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-pink-500" />
            <span>Mutuals</span>
            <span className="font-mono-num font-bold text-[11px] text-pink-600 dark:text-pink-400">
              ({mutuals.length})
            </span>
          </button>
        </div>

        {/* Real-time Fuzzy Search Bar */}
        <div className="p-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, handle, or bio..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-zinc-800/80 border border-transparent focus:border-blue-500 dark:focus:border-blue-400 text-slate-800 dark:text-zinc-200 outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* List of Connections */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-zinc-800/60 p-2">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
              No accounts found matching this criteria.
            </div>
          ) : (
            filteredList.map((user) => {
              const isUserMutualWithActive = activeUser ? graphEngine.isMutual(activeUser.id, user.id) : false;
              const sharedWithActive = activeUser ? graphEngine.getSharedMutuals(activeUser.id, user.id).length : 0;

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors gap-3 group"
                >
                  {/* Left: Avatar with mutual ring + Name */}
                  <div
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                    onClick={() => {
                      if (onSelectUser) onSelectUser(user);
                      onClose();
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full p-[2px] shrink-0 ${
                        isUserMutualWithActive ? 'animate-mutual-ring' : 'bg-slate-200 dark:bg-zinc-700'
                      }`}
                    >
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName}
                        className="w-full h-full rounded-full object-cover bg-slate-100"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate group-hover:underline">
                          {user.displayName}
                        </span>
                        {isUserMutualWithActive && <MutualBadge size="sm" />}
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono-num truncate">
                        @{user.username}
                      </div>

                      {sharedWithActive > 0 && (
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                          {sharedWithActive} mutual connection{sharedWithActive > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Embedded Universal Action Button */}
                  <div className="shrink-0">
                    <RelationshipActionButton
                      targetUserId={user.id}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
