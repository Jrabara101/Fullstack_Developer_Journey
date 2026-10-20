import React, { useMemo } from 'react';
import { graphEngine } from '../engine/relationshipEngine.js';
import { RelationshipActionButton } from './RelationshipActionButton.jsx';
import { ContextualHovercard } from './ContextualHovercard.jsx';
import { Sparkles, Network } from 'lucide-react';

export function DiscoveryRadar({
  onSelectUser,
  className = '',
}) {
  const activeUser = graphEngine.getActiveUser();

  const suggestions = useMemo(() => {
    return activeUser ? graphEngine.getTriangleSuggestions(activeUser.id, 5) : [];
  }, [activeUser]);

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`p-4 rounded-3xl bg-white dark:bg-[#121316] border border-[#E2E8F0] dark:border-[#26292E] shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-zinc-100">
              Graph Triangle Radar
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              High-density mutual network discovery
            </p>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 font-semibold border border-violet-500/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-pink-500" /> Density Match
        </span>
      </div>

      {/* Suggestion Cards */}
      <div className="space-y-3">
        {suggestions.map(({ user, score, viaMutuals }) => (
          <div
            key={user.id}
            className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 hover:bg-slate-100/70 dark:hover:bg-zinc-800/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-zinc-800 group"
          >
            {/* Left: Hovercard Anchor + Avatar + Info */}
            <ContextualHovercard user={user} onSelectUser={onSelectUser}>
              <div
                className="flex items-center gap-2.5 min-w-0"
                onClick={() => onSelectUser && onSelectUser(user)}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-slate-200 dark:ring-zinc-700"
                />

                <div className="min-w-0">
                  <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate group-hover:underline">
                    {user.displayName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono-num truncate">
                    @{user.username}
                  </div>
                  <div className="text-[10px] text-violet-600 dark:text-pink-400 font-medium truncate mt-0.5">
                    Connects via {viaMutuals.slice(0, 2).join(' & ')}
                  </div>
                </div>
              </div>
            </ContextualHovercard>

            {/* Right: Embedded Action Button */}
            <div className="shrink-0">
              <RelationshipActionButton
                targetUserId={user.id}
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
