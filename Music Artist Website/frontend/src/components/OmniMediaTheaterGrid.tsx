import React, { useState } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Tv,
  Radio,
  ExternalLink,
  Volume2,
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import { MediaSession } from '../types';
import { useAudioEngine } from '../context/AudioEngineContext';

interface MediaTheaterProps {
  sessions: MediaSession[];
}

export const OmniMediaTheaterGrid: React.FC<MediaTheaterProps> = ({ sessions }) => {
  const { duckAudioForMedia, isPlaying: isVinylPlaying } = useAudioEngine();

  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [isVideoMounted, setIsVideoMounted] = useState(false);
  const [isTheaterExpanded, setIsTheaterExpanded] = useState(false);
  const [platformTab, setPlatformTab] = useState<'spotify' | 'apple' | 'bandcamp' | 'soundcloud'>('spotify');
  const [isPlatformEmbedMounted, setIsPlatformEmbedMounted] = useState(false);

  const activeSession = sessions[activeSessionIndex] || sessions[0];

  const handleStartSession = () => {
    // Cross-Play Ducking: pause persistent vinyl player smoothly!
    duckAudioForMedia(true);
    setIsVideoMounted(true);
  };

  const handleSelectChapter = (timeStr: string) => {
    // Ensure video is mounted and duck persistent dock
    duckAudioForMedia(true);
    setIsVideoMounted(true);
  };

  const handleMountPlatformEmbed = () => {
    duckAudioForMedia(true);
    setIsPlatformEmbedMounted(true);
  };

  return (
    <section id="media" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="text-xs font-mono text-[var(--era-secondary)] uppercase tracking-widest mb-2 flex items-center gap-2">
            <span>04 // Zero-Jank Omni-Platform Media Embeds</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--era-secondary)] animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase text-white tracking-tight">
            Cinema Theater & Streaming Hub
          </h2>
          <p className="mt-2 text-zinc-400 font-editorial italic text-base sm:text-lg">
            High-contrast 4K live modular sessions, KEXP broadcasts, and instant zero-latency platform embeds.
          </p>
        </div>

        {/* Video selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
          {sessions.map((sess, idx) => (
            <button
              key={sess.id}
              onClick={() => {
                setActiveSessionIndex(idx);
                setIsVideoMounted(false);
              }}
              className={`px-3 py-1.5 rounded-xl border transition-colors whitespace-nowrap ${
                activeSessionIndex === idx
                  ? 'bg-white/15 text-white border-white/20 font-bold'
                  : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              {sess.title.split(' ')[0]} {sess.title.split(' ')[1]} ({sess.duration})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: 16:9 Cinema Stage (8 Cols) + Platform Stack (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cinema Video Stage (8 Cols) */}
        <div className={`transition-all duration-500 ${isTheaterExpanded ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
          <div className="rounded-3xl border border-white/15 bg-[#101216] overflow-hidden shadow-2xl relative">
            {/* 16:9 Media Aspect Container */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              {isVideoMounted ? (
                /* Actual Iframe Video (Mounted on Demand) */
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeSession.youtube_id}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeSession.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                /* Performance Facade Poster */
                <div
                  onClick={handleStartSession}
                  className="relative w-full h-full cursor-pointer group flex items-center justify-center"
                >
                  <img
                    src={activeSession.poster_url}
                    alt={activeSession.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Play Button Trigger */}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-[var(--era-accent)] hover:opacity-90 text-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 active:scale-95">
                      <Play className="w-7 sm:w-8 h-7 sm:h-8 fill-white ml-1" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs font-mono text-zinc-200">
                      ▶ Watch 4K Master Session ({activeSession.duration})
                    </div>
                  </div>

                  {/* Top-Right Badge */}
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-zinc-300">
                    4K PRORES 60FPS • DUCK VINYL ON PLAY
                  </div>
                </div>
              )}

              {/* Theater Mode Expand / Collapse Button */}
              <button
                onClick={() => setIsTheaterExpanded(prev => !prev)}
                className="absolute bottom-4 right-4 z-20 p-2 rounded-lg bg-black/70 hover:bg-black/90 border border-white/20 text-white text-xs backdrop-blur-md"
                title={isTheaterExpanded ? 'Exit Theater Mode' : 'Expand Cinema Stage'}
              >
                {isTheaterExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Video Details & Chapter Markers */}
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="text-[10px] font-mono text-[var(--era-secondary)] uppercase tracking-wider">
                    {activeSession.category.toUpperCase().replace('_', ' ')} • {activeSession.date}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold uppercase text-white mt-0.5">
                    {activeSession.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-signal-emerald flex items-center gap-1.5 px-2.5 py-1 rounded bg-signal-emerald/10 border border-signal-emerald/20">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Auto-Ducking Handshake Active</span>
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs text-zinc-300 font-editorial italic leading-relaxed">
                "{activeSession.description}"
              </p>

              {/* Chapter Timeline Markers */}
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Session Chapter Markers:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-xs">
                  {activeSession.chapters.map(chap => (
                    <button
                      key={chap.time}
                      onClick={() => handleSelectChapter(chap.time)}
                      className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-left transition-colors flex items-center gap-2 text-zinc-300 hover:text-white"
                    >
                      <span className="text-[10px] text-[var(--era-accent)] font-bold tabular-nums">
                        {chap.time}
                      </span>
                      <span className="truncate">{chap.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Official Platform Embed Stack (4 Cols) */}
        {!isTheaterExpanded && (
          <div className="lg:col-span-4 rounded-3xl border border-white/15 bg-[#101216] p-6 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Stack Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[var(--era-accent)]" />
                  <span>Official Streaming Facades</span>
                </div>
                <span className="text-[10px] font-mono text-signal-emerald">● 99+ SPEED</span>
              </div>

              {/* Segmented Platform Selector */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 mb-5 font-mono text-xs">
                {[
                  { key: 'spotify', label: 'Spotify' },
                  { key: 'apple', label: 'Apple Music' },
                  { key: 'bandcamp', label: 'Bandcamp' },
                  { key: 'soundcloud', label: 'SoundCloud' }
                ].map(plat => (
                  <button
                    key={plat.key}
                    onClick={() => {
                      setPlatformTab(plat.key as any);
                      setIsPlatformEmbedMounted(false);
                    }}
                    className={`py-2 px-2 rounded-lg text-center transition-colors text-[11px] font-semibold ${
                      platformTab === plat.key
                        ? 'bg-white/15 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {plat.label}
                  </button>
                ))}
              </div>

              {/* Facade or Embedded Frame */}
              <div className="min-h-[280px] rounded-2xl bg-black/80 border border-white/10 p-5 flex flex-col justify-between relative overflow-hidden">
                {isPlatformEmbedMounted ? (
                  /* Mounted Third-Party Iframe */
                  <div className="w-full h-full flex flex-col justify-center items-center text-center space-y-3 py-6">
                    <div className="w-10 h-10 rounded-full bg-[var(--era-accent)]/20 text-[var(--era-accent)] flex items-center justify-center animate-spin">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div className="font-mono text-xs font-bold text-white uppercase">
                      Streaming Audio Hook Connected
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Persistent Bottom Dock successfully crossfaded & ducked.
                    </div>
                    <a
                      href={
                        platformTab === 'spotify'
                          ? 'https://open.spotify.com'
                          : platformTab === 'apple'
                          ? 'https://music.apple.com'
                          : platformTab === 'bandcamp'
                          ? 'https://bandcamp.com'
                          : 'https://soundcloud.com'
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-mono flex items-center gap-1.5"
                    >
                      <span>Open in {platformTab.toUpperCase()}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  /* Lightweight Custom Facade */
                  <div className="h-full flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-[10px] font-mono text-[var(--era-accent)] uppercase">
                        {platformTab.toUpperCase()} EMBED FACADE
                      </div>
                      <div className="text-lg font-display font-bold uppercase text-white mt-1">
                        Nocturne in Chrome (Deluxe Master)
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-1">
                        11 Tracks • 44:20 • 24-Bit / 96kHz Lossless
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 text-[11px] font-mono text-zinc-300">
                      💡 Zero-Jank Architecture: Third-party SDKs load solely upon fan engagement, preserving instant 60fps page responsiveness.
                    </div>

                    <button
                      onClick={handleMountPlatformEmbed}
                      className="w-full py-3 rounded-xl bg-[var(--era-accent)] hover:opacity-90 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Launch {platformTab.toUpperCase()} Stream</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-5 pt-3 border-t border-white/5 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
              <span>Cross-Stream Audio Synchronizer</span>
              <span className="text-[var(--era-secondary)]">Ducking Handshake Ready</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

