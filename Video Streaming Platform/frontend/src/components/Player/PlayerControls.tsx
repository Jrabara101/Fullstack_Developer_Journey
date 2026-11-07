import React, { useState } from 'react';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  Settings, Maximize, Minimize, Tv, PictureInPicture,
  Check, Subtitles, Sparkles, AudioWaveform
} from 'lucide-react';
import { QualityOption } from '../../hooks/useAdaptiveVideoPlayer';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  availableQualities: QualityOption[];
  currentQualityIndex: number;
  isTheaterMode: boolean;
  dialogueBoostEnabled: boolean;
  audioOnlyMode: boolean;
  onTogglePlay: () => void;
  onSkipSeconds: (sec: number) => void;
  onToggleMute: () => void;
  onVolumeChange: (val: number) => void;
  onChangeRate: (rate: number) => void;
  onChangeQuality: (idx: number) => void;
  onToggleTheater: () => void;
  onToggleMiniPlayer: () => void;
  onToggleFullscreen: () => void;
  onToggleDialogueBoost: () => void;
  onToggleAudioOnly: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  availableQualities,
  currentQualityIndex,
  isTheaterMode,
  dialogueBoostEnabled,
  audioOnlyMode,
  onTogglePlay,
  onSkipSeconds,
  onToggleMute,
  onVolumeChange,
  onChangeRate,
  onChangeQuality,
  onToggleTheater,
  onToggleMiniPlayer,
  onToggleFullscreen,
  onToggleDialogueBoost,
  onToggleAudioOnly
}) => {
  const [showSpeedPopover, setShowSpeedPopover] = useState(false);
  const [showQualityPopover, setShowQualityPopover] = useState(false);
  const [showCcMenu, setShowCcMenu] = useState(false);
  const [activeCaptionLang, setActiveCaptionLang] = useState<string>('en');

  // Format mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const remS = s % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${remS.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${remS.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5];

  return (
    <div className="h-12 px-4 flex items-center justify-between text-white select-none">
      {/* Left Cluster: Play/Pause, Skips, Volume, Timecode */}
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          onClick={onTogglePlay}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 transition active:scale-95 text-white"
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>

        {/* ↺ 10s */}
        <button
          onClick={() => onSkipSeconds(-10)}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15 text-slate-300 hover:text-white transition"
          title="Rewind 10s (Left Arrow)"
        >
          <RotateCcw size={16} />
        </button>

        {/* 10s ↻ */}
        <button
          onClick={() => onSkipSeconds(10)}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15 text-slate-300 hover:text-white transition"
          title="Skip 10s (Right Arrow)"
        >
          <RotateCw size={16} />
        </button>

        {/* Volume slider with expandable bar */}
        <div className="flex items-center gap-1.5 group/vol relative">
          <button
            onClick={onToggleMute}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15 text-slate-300 hover:text-white transition"
            title="Mute / Unmute (M)"
          >
            {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-0 group-hover/vol:w-16 transition-all duration-200 accent-indigo-500 cursor-pointer h-1.5 bg-white/20 rounded-full"
          />
        </div>

        {/* Tabular Timecode */}
        <div className="text-xs font-mono tabular-nums text-slate-300 ml-2">
          <span className="text-white font-medium">{formatTime(currentTime)}</span>
          <span className="mx-1 text-slate-500">/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Cluster: Speed, Dialogue Boost, CC, ABR Quality, Viewport Modes */}
      <div className="flex items-center gap-2">
        {/* Dialogue Boost Filter Toggle */}
        <button
          onClick={onToggleDialogueBoost}
          className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition ${
            dialogueBoostEnabled 
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.25)]' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/25'
          }`}
          title="Auto-Boost Dialogue: Web Audio speech frequency compressor and presence filter"
        >
          <AudioWaveform size={13} className={dialogueBoostEnabled ? 'text-emerald-400 animate-pulse' : ''} />
          <span>Dialogue Boost</span>
        </button>

        {/* Speed Pill Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSpeedPopover(!showSpeedPopover);
              setShowQualityPopover(false);
              setShowCcMenu(false);
            }}
            className="px-2 py-1 rounded-md text-xs font-mono font-semibold bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 transition"
          >
            {playbackRate}x
          </button>

          {showSpeedPopover && (
            <div className="absolute bottom-10 right-0 w-36 bg-[#12141a]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-white/10 mb-1">
                Playback Speed
              </div>
              {speedOptions.map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    onChangeRate(rate);
                    setShowSpeedPopover(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                    playbackRate === rate ? 'bg-indigo-600/30 text-indigo-300 font-semibold' : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span>{rate === 1.0 ? 'Normal (1.0x)' : `${rate}x`}</span>
                  {playbackRate === rate && <Check size={13} className="text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CC Subtitles Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setShowCcMenu(!showCcMenu);
              setShowQualityPopover(false);
              setShowSpeedPopover(false);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              activeCaptionLang !== 'off' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'hover:bg-white/15 text-slate-400'
            }`}
            title="Subtitles / Captions (CC)"
          >
            <Subtitles size={16} />
          </button>

          {showCcMenu && (
            <div className="absolute bottom-10 right-0 w-40 bg-[#12141a]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-white/10 mb-1">
                Subtitles / Captions
              </div>
              {[
                { code: 'en', label: 'English (Auto-sync)' },
                { code: 'es', label: 'Español' },
                { code: 'jp', label: '日本語 (Japanese)' },
                { code: 'off', label: 'Turn Off' }
              ].map(item => (
                <button
                  key={item.code}
                  onClick={() => {
                    setActiveCaptionLang(item.code);
                    setShowCcMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                    activeCaptionLang === item.code ? 'bg-indigo-600/30 text-indigo-300 font-semibold' : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span>{item.label}</span>
                  {activeCaptionLang === item.code && <Check size={13} className="text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ABR Quality Selector Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowQualityPopover(!showQualityPopover);
              setShowSpeedPopover(false);
              setShowCcMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 transition"
            title="Stream Resolution & ABR Ladder"
          >
            <Settings size={14} className="text-slate-400" />
            <span>
              {currentQualityIndex === -1 ? 'Auto (4K)' : availableQualities.find(q => q.index === currentQualityIndex)?.resolution || '4K'}
            </span>
          </button>

          {showQualityPopover && (
            <div className="absolute bottom-10 right-0 w-64 bg-[#12141a]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-white/10 mb-1.5 flex items-center justify-between">
                <span>HLS Adaptive Bitrate Ladder</span>
                <span className="text-[10px] text-emerald-400 font-mono">Lossless H.264/HEVC</span>
              </div>
              {availableQualities.map((qual) => (
                <button
                  key={qual.index}
                  onClick={() => {
                    onChangeQuality(qual.index);
                    setShowQualityPopover(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition mb-0.5 ${
                    currentQualityIndex === qual.index 
                      ? 'bg-indigo-600/25 border border-indigo-500/40 text-white font-medium' 
                      : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{qual.label}</span>
                      {qual.resolution === '4k' && (
                        <span className="px-1 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] rounded border border-emerald-400/30">
                          PRO
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {qual.bitrateKbps ? `${(qual.bitrateKbps / 1000).toFixed(1)} Mbps HLS Stream` : 'Dynamic Bandwidth'}
                    </div>
                  </div>
                  {currentQualityIndex === qual.index && <Check size={14} className="text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mini-Player PiP Dock Mode */}
        <button
          onClick={onToggleMiniPlayer}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 text-slate-400 hover:text-white transition"
          title="Picture-in-Picture Mini-Player Dock"
        >
          <PictureInPicture size={16} />
        </button>

        {/* Theater Wide Mode */}
        <button
          onClick={onToggleTheater}
          className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 transition ${
            isTheaterMode ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
          }`}
          title="Theater Mode (T)"
        >
          <Tv size={16} />
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 text-slate-400 hover:text-white transition"
          title="Fullscreen (F)"
        >
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
};
