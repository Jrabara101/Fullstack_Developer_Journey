import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { fetchUsers } from '../lib/api';
import { Search, Plus, Compass, Users, BookOpen, Sparkles, Shield, User } from 'lucide-react';

export const ReviewPlatformShell: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeUserId,
    setActiveUserId,
    setComposerOpen,
    setCommandPaletteOpen,
    navigateToProfile,
  } = useAppStore();

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const activeUser = usersData?.profiles.find((p) => p.id === activeUserId) || usersData?.profiles[0];

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#07090E]/90 backdrop-blur-xl border-b border-[#1E293B]">
      <div className="max-w-[1360px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => setCurrentView('catalog')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            {/* Hexagonal Gold / Cyan Emblem */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 p-[1px] shadow-glow-gold transition-transform duration-200 group-hover:scale-105">
              <div className="w-full h-full bg-[#07090E] rounded-[7px] flex items-center justify-center font-display font-black text-amber-400 text-sm">
                CV
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-white text-base tracking-wider leading-none">
                CRITIC<span className="text-amber-400">.</span>VAULT
              </span>
              <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase">
                Sanctuary & Taste Sync
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs font-semibold">
            <button
              onClick={() => setCurrentView('catalog')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentView === 'catalog'
                  ? 'bg-[#181F30] text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>

            <button
              onClick={() => {
                if (activeUser) navigateToProfile(activeUser.id);
                else setCurrentView('profile');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentView === 'profile'
                  ? 'bg-[#181F30] text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Critic Museum</span>
            </button>

            <button
              onClick={() => setCurrentView('lists')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentView === 'lists'
                  ? 'bg-[#181F30] text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Quest Lists</span>
            </button>

            <button
              onClick={() => setCurrentView('taste-discover')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentView === 'taste-discover'
                  ? 'bg-[#181F30] text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Taste DNA</span>
            </button>
          </nav>
        </div>

        {/* Center: Instant Command Search (Cmd + K) Trigger */}
        <div className="flex-1 max-w-md hidden sm:block">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full h-9 px-3.5 rounded-xl bg-[#10141F] hover:bg-[#151B2B] border border-[#1E293B] hover:border-slate-700 flex items-center justify-between text-xs text-slate-400 transition-all duration-150 group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span>Search games, critics, lists...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
              Cmd K
            </kbd>
          </button>
        </div>

        {/* Right: Active Persona Switcher & Log Review CTA */}
        <div className="flex items-center gap-3">
          {/* Active Critic Selector Pill */}
          {usersData?.profiles && (
            <div className="relative group flex items-center">
              <select
                value={activeUserId}
                onChange={(e) => setActiveUserId(e.target.value)}
                className="bg-[#10141F] border border-slate-800 text-xs text-slate-300 rounded-xl pl-8 pr-3 py-1.5 appearance-none focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
                title="Switch active viewing persona"
              >
                {usersData.profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.username.split(' ')[0]} ({p.criticTier})
                  </option>
                ))}
              </select>
              {activeUser && (
                <img
                  src={activeUser.avatarUrl}
                  alt={activeUser.username}
                  className="w-5 h-5 rounded-full object-cover absolute left-2 pointer-events-none border border-cyan-400/50"
                />
              )}
            </div>
          )}

          {/* Primary CTA: + Log or Review */}
          <button
            onClick={() => setComposerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider transition-all duration-150 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">+ Log or Review</span>
            <span className="sm:hidden">Log</span>
          </button>
        </div>
      </div>
    </header>
  );
};
