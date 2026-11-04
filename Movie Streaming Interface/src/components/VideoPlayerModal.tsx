import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Subtitles,
  Settings,
  Sparkles,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { MediaItem } from '../types';
import { getSpoilerLockedRecap } from '../services/spoilerService';

interface VideoPlayerModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  referenceTime: Date;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  item,
  isOpen,
  onClose
}) => {
  if (!isOpen || !item) return null;

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTimeSec, setCurrentTimeSec] = useState(
    item.progress ? item.progress.progressSeconds : 45
  );
  const [isMuted, setIsMuted] = useState(false);
  const [showRecapBanner, setShowRecapBanner] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [volume, setVolume] = useState(80);

  const totalDurationSec = item.durationMinutes * 60;
  const recap = getSpoilerLockedRecap(item);

  // Playback timer simulation
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTimeSec(prev => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false);
            return totalDurationSec;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalDurationSec]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = Math.min(100, (currentTimeSec / totalDurationSec) * 100);

  const skipTime = (delta: number) => {
    setCurrentTimeSec(prev => Math.max(0, Math.min(totalDurationSec, prev + delta)));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      {/* Background Video Simulation */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src={item.backdropUrl}
          alt={item.title}
          className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-105 filter brightness-95' : 'scale-100 filter brightness-75'
            }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/80" />
      </div>

      {/* Top Controls Bar */}
      <div className="relative z-20 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-bold text-lg text-white">
              {item.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>{item.type === 'series' ? item.progress?.currentEpisode || 'Episode 1' : 'Feature Presentation'}</span>
              <span>•</span>
              <span className="text-[#34D399] font-medium">{item.cognitiveLoad}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {recap && (
            <button
              onClick={() => setShowRecapBanner(!showRecapBanner)}
              className="px-3.5 py-1.5 rounded-full bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-[#FBBF24] hover:bg-[#FBBF24]/30 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{showRecapBanner ? 'Hide Recap' : '15-Sec Story Recap'}</span>
            </button>
          )}

          <div className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono">
            4K HDR • DOLBY ATMOS
          </div>
        </div>
      </div>

      {/* Center 15-Sec Story Recap Overlay (if triggered) */}
      {showRecapBanner && recap && (
        <div className="relative z-30 max-w-xl mx-auto p-5 rounded-2xl bg-black/85 border border-[#FBBF24]/40 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#FBBF24]">
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
              <span>Catch-Me-Up Context ({recap.activeActName})</span>
            </div>
            <button
              onClick={() => setShowRecapBanner(false)}
              className="text-white/60 hover:text-white text-xs"
            >
              Dismiss
            </button>
          </div>
          <ul className="space-y-2 mb-3">
            {recap.recapBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-white leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] mt-1.5 flex-shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Simulated Subtitles */}
      {subtitlesEnabled && isPlaying && (
        <div className="relative z-20 text-center px-4 mb-8 pointer-events-none">
          <span className="inline-block px-4 py-1.5 rounded bg-black/75 text-white text-sm sm:text-base font-medium shadow-2xl">
            "{item.editorialHook}"
          </span>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="relative z-20 p-6 space-y-3 bg-gradient-to-t from-black via-black/80 to-transparent">
        {/* Scrubber Bar */}
        <div className="space-y-1">
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPercent = (e.clientX - rect.left) / rect.width;
              setCurrentTimeSec(Math.round(totalDurationSec * clickPercent));
            }}
            className="relative h-2 rounded-full bg-white/20 hover:h-3 transition-all cursor-pointer group"
          >
            <div
              className="h-full rounded-full bg-[#E50914] relative transition-all"
              style={{ width: `${progressPercent}%` }}
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-white/70">
            <span>{formatSeconds(currentTimeSec)}</span>
            <span>{formatSeconds(totalDurationSec)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-11 h-11 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* -10s */}
            <button
              onClick={() => skipTime(-10)}
              className="text-white/80 hover:text-white transition-colors"
              title="Rewind 10s"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* +10s */}
            <button
              onClick={() => skipTime(10)}
              className="text-white/80 hover:text-white transition-colors"
              title="Fast Forward 10s"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-white/80 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-20 h-1 accent-[#E50914] bg-white/20 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
              className={`p-2 rounded-lg transition-colors ${subtitlesEnabled ? 'text-[#34D399] bg-white/10' : 'text-white/60 hover:text-white'
                }`}
              title="Subtitles"
            >
              <Subtitles className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => { });
                } else {
                  document.exitFullscreen().catch(() => { });
                }
              }}
              className="text-white/80 hover:text-white transition-colors"
              title="Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};