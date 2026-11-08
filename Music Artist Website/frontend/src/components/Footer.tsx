import React from 'react';
import { Disc3, ArrowUp, ExternalLink, Heart } from 'lucide-react';
import { useEraTheme } from '../context/EraThemeContext';

export const Footer: React.FC = () => {
  const { eraDetails } = useEraTheme();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/10 bg-[#07080A] pt-16 pb-32 max-w-7xl mx-auto px-4 sm:px-6 font-mono text-xs text-zinc-400">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
        {/* Brand & Mission (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-black border border-white/20 flex items-center justify-center">
              <Disc3 className="w-4 h-4 text-[var(--era-accent)]" />
            </div>
            <span className="font-display font-extrabold text-white text-lg tracking-tight">
              ARTIST<span className="text-[var(--era-accent)]">.</span>
            </span>
          </div>

          <p className="text-zinc-400 font-sans leading-relaxed text-xs max-w-sm">
            An atmospheric, artist-owned flagship platform uniting high-fidelity Web Audio stem isolation, transparent direct-to-fan vinyl pressings, and anti-scalper tour routing. Built without third-party tracking or bloated widgets.
          </p>

          <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-2">
            <span className="w-2 h-2 rounded-full bg-signal-emerald animate-pulse" />
            <span>ARTIST-OS v2.6 MASTER ENGINE // ACTIVE ERA: {eraDetails.title}</span>
          </div>
        </div>

        {/* Catalog Links (3 Cols) */}
        <div className="md:col-span-3 space-y-3">
          <div className="text-[11px] font-bold text-white uppercase tracking-wider">Catalog & Sound</div>
          <ul className="space-y-2 text-zinc-400">
            <li><a href="#music" className="hover:text-white transition-colors">Interactive 4-Track Stems</a></li>
            <li><a href="#music" className="hover:text-white transition-colors">Discography & Liner Notes</a></li>
            <li><a href="#tour" className="hover:text-white transition-colors">Past Shows Setlist Archive</a></li>
            <li><a href="#media" className="hover:text-white transition-colors">4K KEXP & Studio Sessions</a></li>
            <li><a href="#merch" className="hover:text-white transition-colors">Numbered 180g Vinyl</a></li>
          </ul>
        </div>

        {/* Global Dispatch & Streaming (4 Cols) */}
        <div className="md:col-span-4 space-y-3">
          <div className="text-[11px] font-bold text-white uppercase tracking-wider">Official Streaming Channels</div>
          <div className="flex flex-wrap gap-2 text-xs">
            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center gap-1 border border-white/10"
            >
              <span>Spotify</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://music.apple.com"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center gap-1 border border-white/10"
            >
              <span>Apple Music</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://bandcamp.com"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center gap-1 border border-white/10"
            >
              <span>Bandcamp</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://tidal.com"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center gap-1 border border-white/10"
            >
              <span>Tidal</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center gap-1 border border-white/10"
            >
              <span>YouTube 4K</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

          <div className="pt-3">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top Deck</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
        <div>
          © {new Date().getFullYear()} ARTIST FLAGSHIP RECORDINGS. Mastered to tape. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-zinc-300 cursor-pointer">Direct-to-Fan Privacy</span>
          <span>•</span>
          <span className="hover:text-zinc-300 cursor-pointer">Anti-Scalper Guarantee</span>
          <span>•</span>
          <span className="hover:text-zinc-300 cursor-pointer">Lossless Vault Terms</span>
        </div>
      </div>
    </footer>
  );
};

