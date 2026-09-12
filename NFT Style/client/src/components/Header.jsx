import React, { useState } from 'react';
import { sounds } from '../utils/soundEffects';

export default function Header({
  user,
  currentTab,
  onSelectTab,
  onOpenPackDirect,
  metrics
}) {
  const [isMuted, setIsMuted] = useState(sounds.muted);

  const toggleAudio = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const navItems = [
    { id: 'binder', label: 'Binder / Collection', icon: 'auto_stories' },
    { id: 'shop', label: 'Pack Shop', icon: 'storefront' },
    { id: 'marketplace', label: 'P2P Marketplace', icon: 'currency_exchange' },
    { id: 'decks', label: 'Decks', icon: 'view_carousel' },
    { id: 'fusion', label: 'Fusion Lab', icon: 'cyclone' }
  ];

  const unopenedCount = user?.unopenedPacks?.length || 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/85 backdrop-blur-xl border-b border-surface-container-highest/60 shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
      <div className="h-16 w-full px-4 sm:px-8 flex items-center justify-between gap-4 max-w-[1720px] mx-auto">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => onSelectTab('binder')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary via-tertiary to-secondary flex items-center justify-center shadow-[0_0_16px_rgba(76,215,246,0.4)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-surface font-bold text-[20px]">
                diamond
              </span>
            </div>
            <span className="font-display font-black text-lg tracking-wider text-white uppercase hidden sm:inline">
              AETHERIA <span className="text-primary font-normal">CARDS</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectTab(item.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-surface-container-high text-primary border border-primary/30 shadow-[0_0_12px_rgba(76,215,246,0.2)]'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Currency & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* $AETH Currency */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 sm:px-3 py-1.5 rounded-lg border border-surface-container-highest/60">
            <span className="material-symbols-outlined text-primary text-[18px]">diamond</span>
            <div className="flex items-baseline gap-1 font-mono text-xs">
              <span className="text-on-surface font-bold">
                {user?.aethBalance?.toLocaleString() || '14,850'}
              </span>
              <span className="text-primary font-semibold text-[10px]">$AETH</span>
            </div>
          </div>

          {/* PRISM Essence */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 sm:px-3 py-1.5 rounded-lg border border-surface-container-highest/60">
            <span className="material-symbols-outlined text-tertiary text-[18px]">token</span>
            <div className="flex items-baseline gap-1 font-mono text-xs">
              <span className="text-on-surface font-bold">
                {user?.prismBalance?.toLocaleString() || '320'}
              </span>
              <span className="text-tertiary font-semibold text-[10px]">PRISM</span>
            </div>
          </div>

          {/* Unopened Packs Quick Action Badge */}
          {unopenedCount > 0 && (
            <button
              onClick={() => {
                sounds.playClick();
                if (user?.unopenedPacks?.[0]) {
                  onOpenPackDirect(user.unopenedPacks[0]);
                }
              }}
              className="flex items-center gap-1.5 bg-secondary-container/40 hover:bg-secondary-container/70 border border-secondary/50 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shadow-[0_0_16px_rgba(208,188,255,0.3)] animate-pulse"
              title="Click to Open Mystery Pack"
            >
              <span className="material-symbols-outlined text-secondary text-[16px]">inventory_2</span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-secondary font-bold whitespace-nowrap">
                {unopenedCount} Unopened
              </span>
            </button>
          )}

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title={isMuted ? "Unmute Synthesized SFX" : "Mute Sound Effects"}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-surface-container-highest">
            <div className="hidden xl:flex flex-col items-end">
              <span className="font-mono text-[10px] text-on-surface-variant">LVL {user?.level || 48}</span>
              <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                {user?.handle || 'NEONBLADE'}
              </span>
            </div>
            <img
              src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=NeonBlade"}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/60"
            />
          </div>

        </div>

      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="lg:hidden flex items-center justify-around py-1.5 px-2 bg-surface-container-low border-t border-surface-container-highest overflow-x-auto scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-2 py-1 rounded text-[11px] font-mono whitespace-nowrap flex items-center gap-1 ${
              currentTab === item.id ? 'text-primary font-bold bg-surface-container-high' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
            <span>{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
