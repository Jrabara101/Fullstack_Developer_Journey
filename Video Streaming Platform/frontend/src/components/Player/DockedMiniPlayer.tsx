import React from 'react';
import { Play, Pause, ArrowUpLeft, X } from 'lucide-react';
import { Video } from '../../types/video';

interface DockedMiniPlayerProps {
  video: Video;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onReturnToStage: () => void;
  onClose: () => void;
}

export const DockedMiniPlayer: React.FC<DockedMiniPlayerProps> = ({
  video,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onReturnToStage,
  onClose
}) => {
  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-6 right-6 w-[360px] h-[202px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/20 bg-black z-50 group transition-all duration-300 animate-toast-slide-up">
      {/* Background Poster / Video Backdrop */}
      <img 
        src={video.posterUrl} 
        alt={video.title} 
        className="w-full h-full object-cover opacity-85"
      />

      {/* Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />

      {/* Top Header Buttons */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20">
        <button
          onClick={onReturnToStage}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium hover:bg-white/20 transition"
        >
          <ArrowUpLeft size={13} />
          <span>Return to Stage</span>
        </button>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
        >
          <X size={14} />
        </button>
      </div>

      {/* Center Play/Pause button */}
      <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onTogglePlay}
          className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition"
        >
          {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />}
        </button>
      </div>

      {/* Bottom Title & Progress */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
        <div className="flex items-center justify-between text-[11px] font-medium text-white mb-1.5">
          <span className="truncate max-w-[220px]">{video.title}</span>
          <span className="font-mono text-slate-400 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
