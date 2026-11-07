import React, { useState } from 'react';
import { X, Copy, Check, Scissors, Play, RefreshCw } from 'lucide-react';
import { Video } from '../../types/video';

interface ClipModalProps {
  video: Video;
  currentTime: number;
  onClose: () => void;
  onSeek: (seconds: number) => void;
}

export const ClipModal: React.FC<ClipModalProps> = ({ video, currentTime, onClose, onSeek }) => {
  const currentSec = Math.floor(currentTime);
  // Default trim window: 30 seconds around current time
  const [startSec, setStartSec] = useState(Math.max(0, currentSec - 10));
  const [endSec, setEndSec] = useState(Math.min(video.durationSeconds, currentSec + 25));
  const [clipTitle, setClipTitle] = useState(`${video.title} [Key Highlight]`);
  const [copied, setCopied] = useState(false);

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const clipDuration = Math.max(1, endSec - startSec);
  const shareableUrl = `${window.location.origin}/watch/${video.ulid}?clip_start=${startSec}&clip_end=${endSec}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePreviewLoop = () => {
    onSeek(startSec);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#12141a] border border-white/15 rounded-2xl p-6 shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Scissors size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Deep-Linked Clip Snipper</h3>
            <p className="text-xs text-slate-400">Create an auto-looping shareable clip with frame-accurate trim handles.</p>
          </div>
        </div>

        {/* Clip Title Input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1">Clip Title</label>
          <input
            type="text"
            value={clipTitle}
            onChange={(e) => setClipTitle(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Trim Sliders Deck */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-indigo-300">Start: {formatSec(startSec)}</span>
            <span className="text-emerald-400 font-bold">Clip Duration: {clipDuration}s</span>
            <span className="text-indigo-300">End: {formatSec(endSec)}</span>
          </div>

          {/* Start Handle */}
          <div>
            <div className="text-[10px] text-slate-400 mb-1">Start Trim Handle</div>
            <input
              type="range"
              min={0}
              max={endSec - 2}
              value={startSec}
              onChange={(e) => setStartSec(parseInt(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>

          {/* End Handle */}
          <div>
            <div className="text-[10px] text-slate-400 mb-1">End Trim Handle</div>
            <input
              type="range"
              min={startSec + 2}
              max={video.durationSeconds}
              value={endSec}
              onChange={(e) => setEndSec(parseInt(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Shareable Deep-Link URL Box */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-300 mb-1">Deep-Linked Auto-Loop URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="flex-1 bg-black/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={handlePreviewLoop}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <RefreshCw size={14} />
            <span>Preview Clip Loop</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
