import React from 'react';
import { User, RefreshCw, Check } from 'lucide-react';
import { useSocialGraph } from '../context/SocialGraphContext';
import { isMutual } from '../utils/graphAlgorithms';

export function PersonaSwitcher() {
  const { users, currentUserId, setCurrentUserId, relationships } = useSocialGraph();

  return (
    <div className="rounded-2xl glass-panel p-4 border border-slate-800 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Test Multi-Perspective Switcher
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          8 Personas Available
        </span>
      </div>

      <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
        Switch active persona to test one-way follows, "Follow Back" prompts, and mutual unlock celebrations from both ends of any relationship.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {users.map(user => {
          const isCurrent = user.id === currentUserId;
          const isMutualWithCurrent = !isCurrent && isMutual(relationships, currentUserId, user.id);

          return (
            <button
              key={user.id}
              onClick={() => setCurrentUserId(user.id)}
              className={`p-2 rounded-xl text-left transition-all duration-200 flex items-center gap-2 border ${
                isCurrent
                  ? 'bg-indigo-600/25 border-indigo-500/80 shadow-md ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                />
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-slate-900" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold text-white truncate flex items-center justify-between">
                  <span className="truncate">{user.displayName.split(' ')[0]}</span>
                  {isCurrent && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  @{user.username}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
