import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn, formatDurationMs } from '../../lib/utils';

interface AudioWaveformPlayerProps {
  url: string;
  durationMs: number;
  waveform: number[];
  title?: string;
  variant?: 'post' | 'dm-outbound' | 'dm-inbound';
}

const SPEEDS = [1, 1.5, 2] as const;

export const AudioWaveformPlayer: React.FC<AudioWaveformPlayerProps> = ({
  url,
  durationMs,
  waveform,
  title,
  variant = 'post',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMs, setCurrentMs] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);
  const rafRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  const bars = waveform.length > 0 ? waveform : Array.from({ length: 32 }, (_, i) => 25 + ((i * 19) % 65));

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentMs(0);
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (fallbackTimerRef.current) window.clearInterval(fallbackTimerRef.current);
    };
  }, [url]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[speedIdx];
    }
  }, [speedIdx]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = () => {
      const audio = audioRef.current;
      if (audio && audio.duration && !Number.isNaN(audio.duration)) {
        const pct = Math.min(1, audio.currentTime / audio.duration);
        setProgress(pct);
        setCurrentMs(audio.currentTime * 1000);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (fallbackTimerRef.current) {
        window.clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      return;
    }

    try {
      audio.playbackRate = SPEEDS[speedIdx];
      await audio.play();
      setIsPlaying(true);
    } catch {
      // Fallback visual playback if browser blocks autoplay or blob codec differs
      setIsPlaying(true);
      const start = Date.now() - currentMs;
      fallbackTimerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - start) * SPEEDS[speedIdx];
        if (elapsed >= durationMs) {
          setIsPlaying(false);
          setProgress(0);
          setCurrentMs(0);
          if (fallbackTimerRef.current) window.clearInterval(fallbackTimerRef.current);
        } else {
          setCurrentMs(elapsed);
          setProgress(elapsed / Math.max(1000, durationMs));
        }
      }, 60);
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setProgress(ratio);
    setCurrentMs(ratio * durationMs);
    if (audioRef.current && audioRef.current.duration && !Number.isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = ratio * audioRef.current.duration;
    }
  };

  const isOutbound = variant === 'dm-outbound';

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 rounded-xl px-3 py-2.5 transition-colors',
        variant === 'post' &&
          'bg-surface-secondary border border-divider',
        variant === 'dm-inbound' && 'bg-black/5 dark:bg-white/5',
        isOutbound && 'bg-white/15'
      )}
    >
      {title && (
        <div className="flex items-center justify-between text-[11px] font-medium opacity-80">
          <span className="truncate">{title}</span>
          <span className="font-mono-tabular uppercase tracking-wider text-[10px]">Voice Note</span>
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer',
            isOutbound
              ? 'bg-white text-[#2563EB]'
              : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
          )}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>

        {/* Interactive 32-bar SVG waveform */}
        <div
          onClick={handleScrub}
          role="slider"
          aria-label="Audio waveform progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          tabIndex={0}
          className="flex-1 h-8 flex items-center cursor-pointer select-none"
        >
          <svg
            viewBox={`0 0 ${bars.length * 6} 32`}
            className="w-full h-7 overflow-visible"
            preserveAspectRatio="none"
          >
            {bars.map((amp, idx) => {
              const norm = Math.max(16, Math.min(100, amp));
              const h = (norm / 100) * 26;
              const y = (32 - h) / 2;
              const barRatio = (idx + 0.5) / bars.length;
              const filled = barRatio <= progress;
              return (
                <rect
                  key={idx}
                  x={idx * 6 + 1}
                  y={y}
                  width="3.5"
                  height={h}
                  rx="1.75"
                  fill={
                    filled
                      ? isOutbound
                        ? '#FFFFFF'
                        : '#2563EB'
                      : isOutbound
                        ? 'rgba(255,255,255,0.35)'
                        : 'rgba(148,163,184,0.45)'
                  }
                />
              );
            })}
          </svg>
        </div>

        <span
          className={cn(
            'font-mono-tabular text-[11px] shrink-0',
            isOutbound ? 'text-white/90' : 'text-muted-ink'
          )}
        >
          {formatDurationMs(isPlaying || currentMs > 0 ? currentMs : durationMs)}
        </span>

        <button
          type="button"
          onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
          className={cn(
            'px-1.5 py-0.5 rounded-md font-mono-tabular text-[10px] font-semibold shrink-0 transition-colors cursor-pointer',
            isOutbound
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-black/5 dark:bg-white/10 text-primary-ink hover:bg-black/10 dark:hover:bg-white/15'
          )}
        >
          {SPEEDS[speedIdx]}x
        </button>
      </div>
    </div>
  );
};

