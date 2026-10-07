import React from 'react';
import { Network, Sparkles, ArrowRight, UserPlus, Zap } from 'lucide-react';
import { useSocialGraph } from '../context/SocialGraphContext';
import { getTriangleSuggestions } from '../utils/graphAlgorithms';
import { RelationshipActionButton } from './RelationshipActionButton';
import { HovercardPreview } from './HovercardPreview';

export function SmartSuggestions({ onSelectUser }) {
  const { relationships, users, currentUserId, currentUser } = useSocialGraph();

  const suggestions = getTriangleSuggestions(relationships, users, currentUserId);

  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl glass-panel p-4 text-center border border-slate-800/80">
        <Network className="w-6 h-6 text-indigo-400 mx-auto mb-2 opacity-60" />
        <h4 className="text-xs font-semibold text-white">Graph Fully Connected</h4>
        <p className="text-[11px] text-slate-400 mt-1">
          No uncompleted graph triangles detected around your mutual clusters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-panel p-4 border border-indigo-500/20 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Network Density Radar
          </h3>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
          Triangle Completions
        </span>
      </div>

      <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
        Recommended based on triadic graph closure: accounts with high connection density to your mutuals.
      </p>

      <div className="space-y-3">
        {suggestions.slice(0, 3).map(({ user, sharedMutuals, densityScore }) => {
          const mutualNames = sharedMutuals.map(m => m.displayName.split(' ')[0]).join(' & ');

          return (
            <div 
              key={user.id} 
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-200"
            >
              {/* Top row: Avatar + Names + Follow Action */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <HovercardPreview userId={user.id} onSelectUser={onSelectUser}>
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-800 cursor-pointer"
                    />
                  </HovercardPreview>

                  <div className="min-w-0">
                    <span 
                      onClick={() => onSelectUser && onSelectUser(user.id)}
                      className="text-xs font-semibold text-white hover:text-indigo-400 transition-colors cursor-pointer truncate block"
                    >
                      {user.displayName}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      @{user.username}
                    </span>
                  </div>
                </div>

                <RelationshipActionButton targetUserId={user.id} size="sm" />
              </div>

              {/* Triangle Visualization & Explanation */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-amber-400 font-medium">△ Triangle:</span>
                  <span className="text-slate-400">
                    Connects via <strong className="text-slate-200">{mutualNames}</strong>
                  </span>
                </div>

                <span className="text-[10px] text-indigo-400 font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40">
                  Score: +{densityScore}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
