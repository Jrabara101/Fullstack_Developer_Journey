import React, { useState } from 'react';
import { Film, Search, Plus, Radio, Cpu, Bell, User } from 'lucide-react';

interface HeaderProps {
  currentView: 'catalog' | 'watch' | 'studio';
  onNavigateCatalog: () => void;
  onNavigateStudio: () => void;
  onSearchSubmit?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateCatalog,
  onNavigateStudio,
  onSearchSubmit
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit && searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <header className="h-16 sticky top-0 z-40 backdrop-blur-xl bg-[#07080A]/85 border-b border-white/10 px-4 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left: Brand Cinema Glyph & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onNavigateCatalog}
          className="flex items-center gap-2.5 text-white hover:opacity-90 transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform">
            <Film size={18} />
          </div>
          <div className="text-left">
            <div className="font-display font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>CINESTREAM</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono border border-indigo-500/30">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wide">
              Cinema-Grade Media Engine
            </div>
          </div>
        </button>
      </div>

      {/* Center: Global Instant Search Bar */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center w-full max-w-md mx-6">
        <div className="relative w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search films, master channels, or spoken dialogue... ⌘K"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101217] border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-400">
            ⌘K
          </kbd>
        </div>
      </form>

      {/* Right: Studio Pill, Transcode Status Ring, Profile */}
      <div className="flex items-center gap-3">
        {/* Live Transcoding Status Indicator Ring */}
        <button
          onClick={onNavigateStudio}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101217] border border-white/10 hover:border-sky-500/40 text-xs text-slate-300 transition"
          title="Click to view active Laravel Horizon FFmpeg workers"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span className="font-mono text-[11px] text-sky-300">1 Encoding • 84%</span>
        </button>

        {/* Creator Studio Upload Pill */}
        <button
          onClick={onNavigateStudio}
          className="px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.35)] transition active:scale-95"
        >
          <Plus size={15} />
          <span>Upload Video</span>
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 relative cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User profile"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-black" />
        </div>
      </div>
    </header>
  );
};
