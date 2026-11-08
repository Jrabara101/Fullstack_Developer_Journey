import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  FileText,
  Disc3,
  MessageSquarePlus,
  Radio
} from 'lucide-react';
import { useAudioEngine } from '../context/AudioEngineContext';
import { useEraTheme } from '../context/EraThemeContext';

export const PersistentHardwareAudioDock: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    loop,
    pausedByMedia,
    frequencyData,
    togglePlay,
    seek,
    setVolume,
    setLoop,
    skipNext,
    skipPrev,
    addReaction,
    resumeFromMediaDucking,
    openStemDrawer,
    setOpenStemDrawer,
    openLyricsDrawer,
    setOpenLyricsDrawer
  } = useAudioEngine();

  const { eraDetails } = useEraTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reactionPopoverOpen, setReactionPopoverOpen] = useState(false);
  const [reactionText, setReactionText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const prevVolRef = useRef(volume);

  // Format time in mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressFraction = duration > 0 ? currentTime / duration : 0;

  // Waveform rendering onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentTrack) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const peaks = currentTrack.waveform_peaks || [];
    const barCount = peaks.length > 0 ? peaks.length : 60;
    const barWidth = width / barCount;
    const accentColor = eraDetails.accent || '#FF3366';

    for (let i = 0; i < barCount; i++) {
      const peak = peaks[i % peaks.length] || 0.4;
      const barHeight = Math.max(4, peak * (height - 8));
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      const barProgress = i / barCount;
      const isPlayed = barProgress <= progressFraction;

      ctx.fillStyle = isPlayed ? accentColor : 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    }
  }, [currentTrack, progressFraction, eraDetails]);

  // Click scrubber on canvas to seek
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    seek(fraction * duration);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(prevVolRef.current || 0.85);
      setIsMuted(false);
    } else {
      prevVolRef.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handlePostReaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reactionText.trim()) return;
    addReaction(reactionText, selectedEmoji);
    setReactionText('');
    setReactionPopoverOpen(false);
  };

  // Compute 8-band LED spectrum from frequencyData
  const ledBars = useMemo(() => {
    const bands: number[] = [];
    const step = Math.floor(frequencyData.length / 8);
    for (let i = 0; i < 8; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += frequencyData[i * step + j] || 0;
      }
      const avg = sum / (step || 1) / 255;
      bands.push(avg);
    }
    return bands;
  }, [frequencyData]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 h-20 backdrop-blur-2xl bg-[#0B0D12]/95 border-t border-white/15 px-3 sm:px-6 flex items-center justify-between hardware-transition select-none">
      {/* Media Ducking Alert Pill */}
      {pausedByMedia && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/90 border border-[var(--era-accent)]/50 backdrop-blur-md shadow-2xl flex items-center gap-2 text-xs font-mono text-zinc-200">
          <span className="w-2 h-2 rounded-full bg-signal-amber animate-ping" />
          <span>Paused while Video Theater is playing</span>
          <button
            onClick={resumeFromMediaDucking}
            className="text-[var(--era-accent)] font-semibold underline hover:opacity-80 ml-1"
          >
            [Resume Vinyl]
          </button>
        </div>
      )}

      {/* Left Column: Mini Spinning Vinyl Platter & Track Metadata (3 Cols) */}
      <div className="w-1/4 min-w-[180px] sm:min-w-[240px] flex items-center gap-3">
        <div
          onClick={togglePlay}
          className="relative w-12 h-12 rounded-full vinyl-grooves border border-white/20 flex-shrink-0 cursor-pointer overflow-hidden flex items-center justify-center shadow-lg group"
          title="Click to play / pause master audio"
        >
          <div
            className={`w-5 h-5 rounded-full border border-black/40 flex items-center justify-center ${
              isPlaying ? 'animate-spin-record' : ''
            }`}
            style={{ backgroundColor: eraDetails.accent }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-black" />
          </div>
          {/* Overlay play indicator on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white fill-white" />
            )}
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400 font-semibold truncate">
              {currentTrack.track_number < 10 ? `0${currentTrack.track_number}` : currentTrack.track_number}.
            </span>
            <div className="text-xs sm:text-sm font-sans font-bold text-white truncate max-w-[140px] sm:max-w-[190px]">
              {currentTrack.title}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mt-0.5">
            <span className="text-[var(--era-accent)]">{currentTrack.bpm} BPM</span>
            <span>•</span>
            <span>{currentTrack.musical_key}</span>
            <span className="hidden md:inline">• {eraDetails.catalog}</span>
          </div>
        </div>
      </div>

      {/* Center Column: Hardware Transport & Interactive Canvas Waveform (6 Cols) */}
      <div className="flex-1 max-w-2xl px-2 sm:px-6 flex flex-col items-center">
        {/* Controls Row */}
        <div className="flex items-center gap-3 sm:gap-5 mb-1.5">
          <button
            onClick={skipPrev}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-[var(--era-accent)] hover:opacity-90 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={skipNext}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => setLoop(!loop)}
            className={`transition-colors p-1 ${
              loop ? 'text-[var(--era-accent)]' : 'text-zinc-400 hover:text-zinc-300'
            }`}
            title={loop ? 'Loop Active' : 'Enable Loop'}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>

          {/* Quick Reaction Button */}
          <div className="relative">
            <button
              onClick={() => setReactionPopoverOpen(prev => !prev)}
              className="text-xs font-mono text-zinc-400 hover:text-[var(--era-secondary)] flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 transition-colors"
              title="Add a millisecond reaction marker"
            >
              <MessageSquarePlus className="w-3 h-3 text-[var(--era-secondary)]" />
              <span className="hidden sm:inline">+ React</span>
            </button>

            {reactionPopoverOpen && (
              <form
                onSubmit={handlePostReaction}
                className="absolute bottom-9 left-1/2 -translate-x-1/2 w-64 p-3 rounded-xl bg-[#101216] border border-white/20 shadow-2xl z-50 text-left font-mono"
              >
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Reaction @ {formatTime(currentTime)}</span>
                  <span className="text-[var(--era-accent)] font-bold">TIMED PIN</span>
                </div>
                <div className="flex gap-2 mb-2">
                  {['🔥', '⚡', '✨', '💎', '🙌'].map(emoji => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-base p-1 rounded ${
                        selectedEmoji === emoji ? 'bg-white/20' : 'hover:bg-white/5'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={reactionText}
                  onChange={e => setReactionText(e.target.value)}
                  placeholder="Drop a note on this bar..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[var(--era-accent)] mb-2"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReactionPopoverOpen(false)}
                    className="px-2 py-1 text-[10px] text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-md bg-[var(--era-accent)] text-white text-[10px] font-semibold"
                  >
                    Pin Marker
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Waveform Scrubber & Timed Reaction Pins */}
        <div className="w-full flex items-center gap-2.5">
          <span className="text-[11px] font-mono text-zinc-400 tabular-nums w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <div
            onClick={handleScrubberClick}
            className="relative flex-1 h-7 cursor-pointer flex items-center group py-1"
          >
            {/* Canvas Peak Waveform */}
            <canvas
              ref={canvasRef}
              width={400}
              height={28}
              className="w-full h-full rounded"
            />

            {/* Timed Fan Reaction Markers along waveform */}
            {currentTrack.fan_reactions.map(rx => {
              const rxPos = (rx.timestamp_ms / 1000) / duration;
              const isClose = Math.abs(currentTime - rx.timestamp_ms / 1000) < 2.5;
              return (
                <div
                  key={rx.id}
                  style={{ left: `${rxPos * 100}%` }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer z-10"
                  onMouseEnter={() => setHoveredReaction(rx.id)}
                  onMouseLeave={() => setHoveredReaction(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    seek(rx.timestamp_ms / 1000);
                  }}
                >
                  <span
                    className={`block w-2.5 h-2.5 rounded-full text-[10px] flex items-center justify-center transition-all ${
                      isClose ? 'scale-150 animate-bounce' : 'opacity-80 hover:opacity-100 hover:scale-125'
                    }`}
                  >
                    {rx.emoji}
                  </span>

                  {/* Reaction Tooltip */}
                  {(hoveredReaction === rx.id || isClose) && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-zinc-200 whitespace-nowrap shadow-xl pointer-events-none z-30">
                      <span className="text-[var(--era-accent)] font-semibold">{rx.fan_handle}</span>: "{rx.comment}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <span className="text-[11px] font-mono text-zinc-400 tabular-nums w-10 text-left">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right Column: Hardware Tools & Live Spectrum Visualizer (3 Cols) */}
      <div className="w-1/4 min-w-[180px] sm:min-w-[240px] flex items-center justify-end gap-2 sm:gap-4">
        {/* 4-Stem Mixer Trigger Pill */}
        <button
          onClick={() => setOpenStemDrawer(!openStemDrawer)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            openStemDrawer
              ? 'bg-[var(--era-accent)] text-white border-[var(--era-accent)] shadow-md shadow-[var(--era-accent)]/20'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
          }`}
          title="Open 4-Channel Stem Mixer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Stems</span>
        </button>

        {/* Synced Lyrics Pop-up Toggle */}
        <button
          onClick={() => setOpenLyricsDrawer(!openLyricsDrawer)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            openLyricsDrawer
              ? 'bg-signal-cyan/20 text-signal-cyan border-signal-cyan/40'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
          }`}
          title="View Synchronized Lyrics"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Lyrics</span>
        </button>

        {/* Real-time 8-Band LED Spectrum Visualizer */}
        <div className="hidden lg:flex items-end gap-1 h-6 px-2 py-1 rounded bg-black/50 border border-white/10">
          {ledBars.map((level, i) => {
            const h = Math.max(3, Math.round(level * 20));
            const isHigh = level > 0.7;
            const isMid = level > 0.4;
            return (
              <div
                key={i}
                style={{ height: `${h}px` }}
                className={`w-1 rounded-sm transition-all duration-75 ${
                  isHigh
                    ? 'bg-[var(--era-accent)]'
                    : isMid
                    ? 'bg-signal-amber'
                    : 'bg-signal-emerald'
                }`}
              />
            );
          })}
        </div>

        {/* Master Volume Slider */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="text-zinc-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-signal-crimson" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={e => {
              setIsMuted(false);
              setVolume(parseFloat(e.target.value));
            }}
            className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--era-accent)]"
            title="Master Volume"
          />
        </div>
      </div>
    </div>
  );
};

