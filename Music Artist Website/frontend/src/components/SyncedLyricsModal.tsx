import React, { useEffect, useRef } from 'react';
import { FileText, X, Sparkles, Disc3 } from 'lucide-react';
import { useAudioEngine } from '../context/AudioEngineContext';
import { useEraTheme } from '../context/EraThemeContext';

export const SyncedLyricsModal: React.FC = () => {
  const { openLyricsDrawer, setOpenLyricsDrawer, currentTrack, currentTime, seek } = useAudioEngine();
  const { eraDetails } = useEraTheme();
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  const currentMs = currentTime * 1000;
  const lyrics = currentTrack?.synced_lyrics_lrc || [];

  // Find active line index
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentMs >= lyrics[i].time_ms) {
      activeIndex = i;
    }
  }

  // Scroll active line smoothly into view
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!openLyricsDrawer || !currentTrack) return null;

  const formatMs = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl max-h-[80vh] rounded-2xl bg-[#0D0F14] border border-white/20 shadow-2xl flex flex-col overflow-hidden hardware-transition">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--era-accent)]/15 text-[var(--era-accent)]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Time-Synced Lyrics & Studio Vocal Telemetry</span>
                <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald animate-pulse" />
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                {currentTrack.title} • {currentTrack.bpm} BPM • {currentTrack.musical_key}
              </div>
            </div>
          </div>

          <button
            onClick={() => setOpenLyricsDrawer(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lyrics scrollable container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-[11px] font-mono text-zinc-400 text-center uppercase tracking-widest pb-2 border-b border-white/5">
            Tap any line to seek playback directly
          </div>

          {lyrics.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 font-mono text-xs">
              No lyric markers registered for this composition.
            </div>
          ) : (
            lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => seek(line.time_ms / 1000)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                    isActive
                      ? 'bg-white/10 border-l-4 border-[var(--era-accent)] text-white shadow-lg'
                      : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-[11px] font-mono text-zinc-400 tabular-nums mt-0.5 w-12 flex-shrink-0">
                    {formatMs(line.time_ms)}
                  </span>
                  <div
                    className={`font-editorial text-lg sm:text-xl leading-relaxed ${
                      isActive ? 'font-semibold italic text-white' : ''
                    }`}
                  >
                    {line.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-black/60 border-t border-white/10 text-[11px] font-mono text-zinc-400 flex items-center justify-between px-5">
          <span>Mastering: 24-bit / 96kHz Sterling Sound</span>
          <span className="text-[var(--era-accent)]">Catalog: {eraDetails.catalog}</span>
        </div>
      </div>
    </div>
  );
};

