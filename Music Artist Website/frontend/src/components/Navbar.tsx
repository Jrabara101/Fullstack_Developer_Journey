import React, { useState } from 'react';
import { Disc3, ShoppingBag, Bell, Sparkles, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { useEraTheme, EraKey, ERA_DEFINITIONS } from '../context/EraThemeContext';
import { useAudioEngine } from '../context/AudioEngineContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onOpenBackstage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBackstage }) => {
  const { currentEra, setEra } = useEraTheme();
  const { isPlaying, setOpenStemDrawer } = useAudioEngine();
  const { items, openCart, totalCents, hasBundleSavings } = useCart();
  const [eraDropdownOpen, setEraDropdownOpen] = useState(false);

  const eraKeys: EraKey[] = ['nocturne', 'solar', 'echo'];
  const totalItemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="h-16 sticky top-0 z-40 backdrop-blur-xl bg-[#07080A]/85 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between hardware-transition">
      {/* Left: Monogram, Hardware Version & Era Chameleon Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        <a href="#hero" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-full border border-white/20 bg-black flex items-center justify-center overflow-hidden">
            <Disc3
              className={`w-5 h-5 text-[var(--era-accent)] transition-transform duration-700 ${
                isPlaying ? 'animate-spin-record' : 'group-hover:rotate-45'
              }`}
            />
            {isPlaying && (
              <span className="absolute w-1.5 h-1.5 rounded-full bg-[var(--era-accent)] animate-ping" />
            )}
          </div>
          <span className="font-display font-extrabold tracking-tight text-lg text-white">
            ARTIST<span className="text-[var(--era-accent)]">.</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald animate-pulse" />
          <span>SYS // ARTIST-OS v2.6</span>
        </div>

        {/* Era Chameleon Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setEraDropdownOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-zinc-300 transition-colors"
            title="Morph active Album Era theme"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: ERA_DEFINITIONS[currentEra].accent }}
            />
            <span className="hidden sm:inline">Era: {ERA_DEFINITIONS[currentEra].title.split(' ')[0]} '{ERA_DEFINITIONS[currentEra].year.slice(2)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {eraDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#101216] border border-white/15 shadow-2xl p-2 z-50 backdrop-blur-2xl">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-2 py-1">
                Album Era Morph
              </div>
              {eraKeys.map(key => {
                const def = ERA_DEFINITIONS[key];
                const isSelected = key === currentEra;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setEra(key);
                      setEraDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                      isSelected ? 'bg-white/10 text-white font-medium' : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: def.accent }} />
                      <div>
                        <div>{def.title}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{def.year} {def.type} • {def.catalog}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[var(--era-accent)]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Center: Anchor Links */}
      <nav className="hidden lg:flex items-center gap-6 font-mono text-xs text-zinc-400">
        <a href="#music" className="hover:text-white transition-colors flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-400">01.</span> Discography & Stems
        </a>
        <a href="#tour" className="hover:text-white transition-colors flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-400">02.</span> Tour (18)
        </a>
        <a href="#merch" className="hover:text-white transition-colors flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-400">03.</span> Merch & Vinyl
        </a>
        <a href="#media" className="hover:text-white transition-colors flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-400">04.</span> Cinema Theater
        </a>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Stem Isolator Launcher */}
        <button
          onClick={() => setOpenStemDrawer(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 transition-colors"
          title="Open 4-Track Stem Isolator"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--era-accent)]" />
          <span>4-Stem Mixer</span>
        </button>

        {/* Backstage Presale SMS Button */}
        <button
          onClick={onOpenBackstage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-200 transition-colors"
        >
          <Bell className="w-3.5 h-3.5 text-signal-cyan" />
          <span className="hidden sm:inline">Backstage Fan Pass</span>
        </button>

        {/* Bag Trigger */}
        <button
          onClick={openCart}
          className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[var(--era-accent)] hover:opacity-95 text-white text-xs font-medium font-mono transition-transform active:scale-95 shadow-lg shadow-[var(--era-accent)]/20"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Bag ({totalItemCount})</span>
          {totalItemCount > 0 && (
            <span className="hidden sm:inline font-mono">
              • ${(totalCents / 100).toFixed(2)}
            </span>
          )}
          {hasBundleSavings && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-emerald opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-signal-emerald" />
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

