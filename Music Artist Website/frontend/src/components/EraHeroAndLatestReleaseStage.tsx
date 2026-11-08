import React, { useState } from 'react';
import { Play, Pause, Disc, Sparkles, SlidersHorizontal, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAudioEngine } from '../context/AudioEngineContext';
import { useEraTheme } from '../context/EraThemeContext';
import { useCart } from '../context/CartContext';
import { Track, MerchProduct } from '../types';

interface EraHeroProps {
  featuredTrack: Track;
  featuredVinylProduct: MerchProduct;
  onOpenLinerNotes: () => void;
}

export const EraHeroAndLatestReleaseStage: React.FC<EraHeroProps> = ({
  featuredTrack,
  featuredVinylProduct,
  onOpenLinerNotes
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, setOpenStemDrawer } = useAudioEngine();
  const { currentEra, eraDetails } = useEraTheme();
  const { addItem, openCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const isCurrentPlaying = isPlaying && currentTrack?.id === featuredTrack.id;

  const handlePlayHero = () => {
    if (currentTrack?.id === featuredTrack.id) {
      togglePlay();
    } else {
      playTrack(featuredTrack);
    }
  };

  const handleOrderVinyl = () => {
    const primaryVariant = featuredVinylProduct.variants[0];
    addItem(featuredVinylProduct, primaryVariant, 1);
    openCart();
  };

  return (
    <section id="hero" className="relative pt-6 sm:pt-10 pb-16 lg:pb-24 overflow-hidden">
      {/* Dynamic Ambient Era Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] sm:h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20 -z-10 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, var(--era-accent) 0%, var(--era-secondary) 100%)`
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Manifesto & Omni-Action Deck (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {/* Release Provenance Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-mono tracking-wide w-fit mb-5">
            <span className="w-2 h-2 rounded-full bg-[var(--era-accent)] animate-pulse" />
            <span className="text-zinc-300 font-semibold uppercase">NEW STUDIO ALBUM</span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-400 font-mono">{eraDetails.catalog}</span>
            <span className="text-zinc-400">•</span>
            <span className="text-[var(--era-secondary)] hidden sm:inline">180G OXBLOOD VINYL & DIGITAL</span>
          </div>

          {/* Oversized Title */}
          <h1 className="text-5xl sm:text-7xl xl:text-8xl font-display font-extrabold tracking-tight uppercase leading-[0.94] text-white">
            {eraDetails.title.split(' ')[0]} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
              {eraDetails.title.split(' ').slice(1).join(' ')}
            </span>
          </h1>

          {/* Editorial Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-zinc-300 font-editorial italic max-w-2xl leading-relaxed">
            "{eraDetails.description}"
          </p>

          {/* Press Quotes Ticker */}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400">
            <div className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
              <span className="text-white font-semibold">Pitchfork</span>
              <span className="text-[var(--era-accent)]">8.8 Best New Music</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
              <span className="text-white font-semibold">Resident Advisor</span>
              <span className="text-signal-emerald">Essential Release</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
              <span className="text-white font-semibold">The Wire</span>
              <span className="text-[var(--era-secondary)]">Album of the Month</span>
            </div>
          </div>

          {/* Primary Action Cluster */}
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={handlePlayHero}
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[var(--era-accent)] hover:opacity-95 text-white font-mono text-sm font-semibold tracking-wide shadow-xl shadow-[var(--era-accent)]/25 transition-all active:scale-95"
            >
              {isCurrentPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause Master Audio</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play Full Album & Stems</span>
                </>
              )}
            </button>

            <button
              onClick={handleOrderVinyl}
              className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-mono text-sm transition-all active:scale-95 group"
            >
              <Disc className="w-4 h-4 text-zinc-300 group-hover:rotate-45 transition-transform" />
              <span>Order 180g Vinyl ($38)</span>
              <span className="px-2 py-0.5 rounded-md bg-signal-amber/20 text-signal-amber border border-signal-amber/30 text-[10px]">
                34/500 Left
              </span>
            </button>

            <button
              onClick={() => setOpenStemDrawer(true)}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-colors"
              title="Open 4-Track Stem Mixer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[var(--era-secondary)]" />
            </button>
          </div>

          {/* Omni-Platform Streaming Bar */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
              <span>Stream / Save Lossless Master On:</span>
              <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald" />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <a
                href="https://open.spotify.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#1DB954]/20 hover:text-[#1DB954] hover:border-[#1DB954]/40 border border-white/10 text-zinc-300 transition-colors flex items-center gap-1.5"
              >
                <span>Spotify</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
              <a
                href="https://music.apple.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#FA2D48]/20 hover:text-[#FA2D48] hover:border-[#FA2D48]/40 border border-white/10 text-zinc-300 transition-colors flex items-center gap-1.5"
              >
                <span>Apple Music</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
              <a
                href="https://bandcamp.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#629AA9]/20 hover:text-[#629AA9] hover:border-[#629AA9]/40 border border-white/10 text-zinc-300 transition-colors flex items-center gap-1.5"
              >
                <span>Bandcamp</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
              <a
                href="https://tidal.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/20 hover:text-white border border-white/10 text-zinc-300 transition-colors flex items-center gap-1.5"
              >
                <span>Tidal HiFi</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
              <a
                href="https://soundcloud.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#FF5500]/20 hover:text-[#FF5500] hover:border-[#FF5500]/40 border border-white/10 text-zinc-300 transition-colors flex items-center gap-1.5"
              >
                <span>SoundCloud</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Tactile Gatefold & Spinning Vinyl Preview (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div
            className="relative w-full max-w-[380px] sm:max-w-[440px] aspect-square group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handlePlayHero}
          >
            {/* Slide-Out Spinning Vinyl Record */}
            <div
              className={`absolute top-0 right-0 w-full h-full rounded-full vinyl-grooves border-2 border-white/20 transition-all duration-700 ease-out flex items-center justify-center ${
                isHovered || isCurrentPlaying ? 'translate-x-16 sm:translate-x-24 rotate-12 shadow-2xl' : 'translate-x-0'
              }`}
            >
              {/* Dynamic Sheen reflection */}
              <div className="absolute inset-0 rounded-full vinyl-sheen pointer-events-none" />

              {/* Spinning Label Platter */}
              <div
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-black/40 shadow-inner flex flex-col items-center justify-center p-2 text-center text-white ${
                  isCurrentPlaying ? 'animate-spin-record' : ''
                }`}
                style={{
                  background: `radial-gradient(circle, var(--era-accent) 0%, #18191D 100%)`
                }}
              >
                {/* Spindle hole */}
                <div className="w-4 h-4 rounded-full bg-black border border-white/30 mb-1" />
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider">SIDE A • 33⅓ RPM</div>
                <div className="text-[8px] font-mono text-zinc-300 truncate max-w-[90px]">{featuredTrack.title}</div>
                <div className="text-[7px] font-mono text-zinc-400">{eraDetails.catalog}</div>
              </div>
            </div>

            {/* Album Cover Gatefold Jacket */}
            <div className="relative z-10 w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/15 bg-[#101216] transition-transform duration-500 group-hover:-translate-x-3">
              <img
                src={featuredVinylProduct.images[0] || eraDetails.bg}
                alt={eraDetails.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Floating Foil Telemetry Hype Sticker */}
              <div className="absolute top-4 right-4 max-w-[170px] p-2.5 rounded-lg bg-black/85 backdrop-blur-md border border-[var(--era-accent)]/50 shadow-xl text-left">
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--era-accent)] font-bold tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  <span>MASTERED FOR 180G</span>
                </div>
                <div className="text-[10px] text-zinc-200 mt-1 leading-tight font-sans font-medium">
                  Includes 24-page lyric booklet + instant 24-bit .WAV vault download
                </div>
              </div>

              {/* Bottom Jacket Overlay Details */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{eraDetails.catalog}</div>
                  <div className="text-xl font-display font-extrabold text-white tracking-tight">{eraDetails.title}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLinerNotes();
                    }}
                    className="px-2.5 py-1 rounded bg-black/60 hover:bg-black/90 border border-white/20 text-[10px] font-mono text-zinc-300 backdrop-blur-md"
                  >
                    View Liner Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

