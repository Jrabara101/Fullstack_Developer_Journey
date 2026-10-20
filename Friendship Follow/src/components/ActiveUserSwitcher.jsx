import React, { useState, useRef, useEffect } from 'react';
import { graphEngine } from '../engine/relationshipEngine.js';
import { ChevronDown, Sparkles, UserCheck, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export function ActiveUserSwitcher({
  onSwitchUser,
  simulateNetworkError,
  onToggleNetworkSimulation,
  onResetGraph,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeUser = graphEngine.getActiveUser();
  const users = graphEngine.users;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Switcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200/80 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 transition-all cursor-pointer shadow-xs"
        title="Switch active user to test bidirectional mutual follow loops"
      >
        <img
          src={activeUser.avatarUrl}
          alt={activeUser.displayName}
          className="w-5 h-5 rounded-full object-cover ring-1 ring-violet-500"
        />
        <div className="text-left text-xs font-semibold text-slate-800 dark:text-zinc-100 hidden sm:block">
          <span>{activeUser.displayName}</span>
          <span className="text-[10px] text-slate-400 font-mono-num ml-1 font-normal">
            (@{activeUser.username})
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-50 p-2 text-xs">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800">
            <div className="font-bold text-slate-900 dark:text-zinc-100">
              Switch Active User Persona
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">
              Test following and reciprocating from different perspectives:
            </div>
          </div>

          <div className="py-1 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
            {users.map((u) => {
              const isSelected = u.id === activeUser.id;
              const mutualCount = graphEngine.getMutualFriends(u.id).length;

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    graphEngine.setActiveUser(u.id);
                    if (onSwitchUser) onSwitchUser(u);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-pink-300 font-medium'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={u.avatarUrl}
                      alt={u.displayName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">
                        {u.displayName} {u.isPrivate && '🔒'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono-num truncate">
                        @{u.username}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono-num font-bold text-pink-600 dark:text-pink-400">
                      {mutualCount} mutual{mutualCount === 1 ? '' : 's'}
                    </div>
                    {isSelected && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-600 text-white font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Developer Controls / Simulation Toggles */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1">
            <button
              type="button"
              onClick={onToggleNetworkSimulation}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                simulateNetworkError
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold'
                  : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate Network Failure</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                simulateNetworkError ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600'
              }`}>
                {simulateNetworkError ? 'FAILING' : 'HEALTHY'}
              </span>
            </button>

            <button
              type="button"
              onClick={onResetGraph}
              className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Graph Topology to Default</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
