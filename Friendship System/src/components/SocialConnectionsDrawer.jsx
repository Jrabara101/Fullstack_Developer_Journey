import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Users, 
  Sparkles, 
  UserCheck, 
  ShieldAlert, 
  UserPlus, 
  MessageSquare,
  Lock,
  Filter
} from 'lucide-react';
import { useSocialGraph } from '../context/SocialGraphContext';
import { 
  getUserFollowers, 
  getUserFollowing, 
  getUserMutuals, 
  isMutual, 
  getMutualTenure 
} from '../utils/graphAlgorithms';
import { MutualBadge } from './MutualBadge';
import { RelationshipActionButton } from './RelationshipActionButton';
import { HovercardPreview } from './HovercardPreview';

export function SocialConnectionsDrawer({ isOpen, onClose, targetUserId = null, initialTab = 'mutuals', onSelectUser }) {
  const { 
    users, 
    relationships, 
    currentUserId, 
    currentUser,
    getUser,
    removeFollowerSoftBlock 
  } = useSocialGraph();

  const activeProfileId = targetUserId || currentUserId;
  const activeUser = getUser(activeProfileId) || currentUser;
  const isViewingSelf = activeProfileId === currentUserId;

  const [activeTab, setActiveTab] = useState(initialTab); // 'followers' | 'following' | 'mutuals'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPill, setFilterPill] = useState('ALL'); // 'ALL' | 'MUTUALS_ONLY' | 'PRIVATE_ONLY' | 'ONLINE_ONLY'

  // Computed connection sets
  const followersList = useMemo(() => {
    return getUserFollowers(relationships, users, activeProfileId);
  }, [relationships, users, activeProfileId]);

  const followingList = useMemo(() => {
    return getUserFollowing(relationships, users, activeProfileId);
  }, [relationships, users, activeProfileId]);

  const mutualsList = useMemo(() => {
    return getUserMutuals(relationships, users, activeProfileId);
  }, [relationships, users, activeProfileId]);

  // Current tab items
  const rawTabItems = useMemo(() => {
    if (activeTab === 'followers') return followersList;
    if (activeTab === 'following') return followingList;
    return mutualsList;
  }, [activeTab, followersList, followingList, mutualsList]);

  // Filtered and searched items
  const filteredItems = useMemo(() => {
    return rawTabItems.filter(u => {
      // Fuzzy search match
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        u.displayName.toLowerCase().includes(query) || 
        u.username.toLowerCase().includes(query) ||
        (u.bio && u.bio.toLowerCase().includes(query));

      if (!matchSearch) return false;

      // Filter pills
      if (filterPill === 'MUTUALS_ONLY') {
        return isMutual(relationships, currentUserId, u.id);
      }
      if (filterPill === 'PRIVATE_ONLY') {
        return u.isPrivate;
      }
      if (filterPill === 'ONLINE_ONLY') {
        return u.isOnline;
      }
      return true;
    });
  }, [rawTabItems, searchQuery, filterPill, relationships, currentUserId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md h-full bg-[#0d1017] border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Connections
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Graph network for @{activeUser.username}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 px-4 pt-2 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('mutuals')}
            className={`flex-1 py-3 px-2 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'mutuals'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mutuals ({mutualsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-3 px-2 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'followers'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Followers ({followersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-3 px-2 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'following'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Following ({followingList.length})</span>
          </button>
        </div>

        {/* Search & Bulk Filters */}
        <div className="p-4 space-y-3 bg-[#0d1017]">
          {/* Fuzzy Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, handle, or bio..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Bulk Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
            </span>
            <button
              onClick={() => setFilterPill('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterPill === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterPill('MUTUALS_ONLY')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                filterPill === 'MUTUALS_ONLY'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Mutuals Only</span>
            </button>
            <button
              onClick={() => setFilterPill('ONLINE_ONLY')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterPill === 'ONLINE_ONLY'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Online Now
            </button>
            <button
              onClick={() => setFilterPill('PRIVATE_ONLY')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterPill === 'PRIVATE_ONLY'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Private
            </button>
          </div>
        </div>

        {/* User Items List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 divide-y divide-slate-800/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No matching users found.</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-indigo-400 text-xs hover:underline"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            filteredItems.map(user => {
              const hasMutualWithMe = isMutual(relationships, currentUserId, user.id);
              const tenure = getMutualTenure(relationships, currentUserId, user.id);
              const isMyself = user.id === currentUserId;

              return (
                <div 
                  key={user.id} 
                  className="pt-3 pb-2 flex items-center justify-between gap-3 group hover:bg-slate-900/40 px-2 rounded-xl transition-colors"
                >
                  {/* Left: Avatar with Hovercard + Names */}
                  <div className="flex items-center gap-3 min-w-0">
                    <HovercardPreview userId={user.id} onSelectUser={onSelectUser}>
                      <div className="relative cursor-pointer">
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800 group-hover:ring-indigo-500/40 transition-all"
                        />
                        {user.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                        )}
                      </div>
                    </HovercardPreview>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span 
                          onClick={() => {
                            if (onSelectUser) onSelectUser(user.id);
                            onClose();
                          }}
                          className="text-xs font-semibold text-white hover:text-indigo-400 cursor-pointer truncate"
                        >
                          {user.displayName}
                        </span>
                        {hasMutualWithMe && <MutualBadge size="sm" />}
                        {user.isPrivate && (
                          <Lock className="w-2.5 h-2.5 text-slate-500" title="Private account" />
                        )}
                      </div>
                      
                      <div className="text-[11px] text-slate-400 truncate">
                        @{user.username}
                      </div>

                      {hasMutualWithMe && tenure && (
                        <div className="text-[10px] text-amber-400/80 font-medium truncate mt-0.5">
                          {tenure}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* If viewing my own followers tab, allow soft-block remove follower */}
                    {isViewingSelf && activeTab === 'followers' && (
                      <button
                        onClick={() => removeFollowerSoftBlock(currentUserId, user.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Remove follower silently (Soft Block)"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Dynamic state button machine */}
                    {!isMyself && (
                      <RelationshipActionButton targetUserId={user.id} size="sm" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer Summary */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-center text-[11px] text-slate-500">
          Viewing {filteredItems.length} of {rawTabItems.length} relationships
        </div>
      </div>
    </div>
  );
}
