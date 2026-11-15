import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Scissors, 
  Copy, 
  FileJson, 
  Sparkles, 
  Zap, 
  Headphones, 
  Smartphone, 
  TrainTrack,
  Check,
  RotateCcw,
  Gauge
} from 'lucide-react';
import { MediaAsset, TransformationParams, AudioBitrate } from '../../types';
import { audioSynthesizer } from '../../services/audioSynthesizer';
import { EdgeService } from '../../services/edgeService';

interface AudioDockProps {
  asset: MediaAsset;
  params: TransformationParams;
  onUpdateParams: (newParams: Partial<TransformationParams>) => void;
  onOpenWaveformJson: () => void;
}

export const AudioDock: React.FC<AudioDockProps> = ({
  asset,
  params,
  onUpdateParams,
  onOpenWaveformJson,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const waveformRef = useRef<HTMLDivElement>(null);

  const duration = asset.duration || 180;
  const trimStart = params.trimStart || 0;
  const trimEnd = params.trimEnd || duration;

  // Initialize synthesizer with asset
  useEffect(() => {
    const trackType = asset.filename.includes('podcast') ? 'podcast' : 'lofi';
    audioSynthesizer.setTrack(trackType, duration, trimStart, trimEnd);
    audioSynthesizer.setBitrate(params.audioBitrate);
    audioSynthesizer.setLufsNormalization(params.normalizeLufs);

    const unsubscribe = audioSynthesizer.subscribe((time, playing) => {
      setCurrentTime(time);
      setIsPlaying(playing);
    });

    return () => {
      unsubscribe();
    };
  }, [asset.id]);

  // Update DSP on parameter changes
  useEffect(() => {
    audioSynthesizer.setBitrate(params.audioBitrate);
    audioSynthesizer.setLufsNormalization(params.normalizeLufs);
    audioSynthesizer.setTrim(trimStart, trimEnd);
  }, [params.audioBitrate, params.normalizeLufs, trimStart, trimEnd]);

  const togglePlay = () => {
    audioSynthesizer.togglePlay();
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const seekTime = pct * duration;
    audioSynthesizer.seek(seekTime);
  };

  const handleTrimStartChange = (val: number) => {
    const clamped = Math.max(0, Math.min(val, trimEnd - 5));
    onUpdateParams({ trimStart: clamped });
  };

  const handleTrimEndChange = (val: number) => {
    const clamped = Math.max(trimStart + 5, Math.min(val, duration));
    onUpdateParams({ trimEnd: clamped });
  };

  const formatTimecode = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Delivered byte calculations
  let kbps = 96;
  if (params.audioBitrate === '320k') kbps = 320;
  if (params.audioBitrate === '48k') kbps = 48;
  const activeDuration = Math.max(1, trimEnd - trimStart);
  const deliveredBytes = Math.round((kbps * 1000 / 8) * activeDuration);
  const savingsPct = Number(((1 - deliveredBytes / asset.originBytes) * 100).toFixed(1));

  return (
    <div className="bg-edge-panel border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Top Identity & Payload Diet Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-edge-amber/20 border border-edge-amber/30 flex items-center justify-center text-edge-amber shadow-md">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{asset.title}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-edge-amber/15 text-edge-amber border border-edge-amber/30 font-semibold">
                Opus Stream
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Origin: {asset.originFormat} • {EdgeService.formatBytes(asset.originBytes)} Master
            </p>
          </div>
        </div>

        {/* Compression & Savings Badge */}
        <div className="flex items-center gap-2 bg-edge-obsidian/90 px-3 py-1.5 rounded-xl border border-edge-emerald/40 text-xs">
          <span className="w-2 h-2 rounded-full bg-edge-emerald animate-pulse"></span>
          <span className="text-gray-300 font-mono">
            {EdgeService.formatBytes(asset.originBytes)} → <strong className="text-edge-emerald font-semibold">{EdgeService.formatBytes(deliveredBytes)}</strong>
          </span>
          <span className="px-1.5 py-0.2 rounded bg-edge-emerald/20 text-edge-emerald font-extrabold font-mono text-[11px]">
            -{savingsPct}%
          </span>
        </div>
      </div>

      {/* Middle Interactive Waveform & URL Trimmer */}
      <div className="py-4">
        {/* Playhead Timecode & Trim Readout */}
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-edge-amber to-amber-500 text-edge-obsidian flex items-center justify-center font-bold shadow-lg shadow-edge-amber/25 hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <span className="text-white font-bold text-sm tracking-tight">{formatTimecode(currentTime)}</span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-400">{formatTimecode(duration)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-[11px] flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-edge-amber" />
              <span>URL Trim Window:</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-edge-well border border-white/10 text-edge-amber font-semibold text-[11px]">
              ?start={Math.round(trimStart)}s&end={Math.round(trimEnd)}s ({Math.round(activeDuration)}s snippet)
            </span>
            <button
              onClick={onOpenWaveformJson}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[11px] font-medium transition-colors"
              title="Copy companion 120-point amplitude JSON url"
            >
              <FileJson className="w-3 h-3 text-edge-cyan" />
              <span>Waveform JSON</span>
            </button>
          </div>
        </div>

        {/* Dual-Layer SVG Waveform Canvas with interactive scrub & trim handles */}
        <div
          ref={waveformRef}
          onClick={handleWaveformClick}
          className="relative h-20 bg-edge-obsidian rounded-xl border border-white/10 p-2 cursor-pointer group select-none overflow-hidden"
        >
          {/* Trim region highlight */}
          <div
            className="absolute top-0 bottom-0 bg-edge-amber/10 border-x border-edge-amber/40 pointer-events-none transition-all"
            style={{
              left: `${(trimStart / duration) * 100}%`,
              width: `${((trimEnd - trimStart) / duration) * 100}%`,
            }}
          />

          {/* Bar Waveform rendering */}
          <div className="w-full h-full flex items-center justify-between gap-[2px]">
            {asset.waveform?.map((amplitude, idx) => {
              const barPosPct = (idx / (asset.waveform?.length || 120)) * 100;
              const isPastPlayhead = (currentTime / duration) * 100 >= barPosPct;
              const isInsideTrim = barPosPct >= (trimStart / duration) * 100 && barPosPct <= (trimEnd / duration) * 100;

              // Normalized LUFS boost calculation
              const boostMultiplier = params.normalizeLufs ? 1.35 : 0.9;
              const barHeightPct = Math.min(100, Math.max(10, amplitude * 100 * boostMultiplier));

              return (
                <div
                  key={idx}
                  className="flex-1 rounded-full transition-all duration-75"
                  style={{
                    height: `${barHeightPct}%`,
                    backgroundColor: isPastPlayhead 
                      ? '#06B6D4' // played cyan
                      : isInsideTrim 
                      ? '#F59E0B' // active trim amber
                      : 'rgba(255, 255, 255, 0.12)', // outside trim muted
                  }}
                />
              );
            })}
          </div>

          {/* Playhead Vertical Bar */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-edge-cyan shadow-[0_0_8px_#06B6D4] pointer-events-none z-10"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-edge-cyan -translate-x-[4px] -translate-y-1 shadow"></div>
          </div>
        </div>

        {/* Draggable Trim Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-2">
          <div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
              <span>Trim Start Marker:</span>
              <span className="font-mono text-edge-amber font-semibold">{formatTimecode(trimStart)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration - 5}
              value={trimStart}
              onChange={(e) => handleTrimStartChange(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
              <span>Trim End Marker:</span>
              <span className="font-mono text-edge-amber font-semibold">{formatTimecode(trimEnd)}</span>
            </div>
            <input
              type="range"
              min={5}
              max={duration}
              value={trimEnd}
              onChange={(e) => handleTrimEndChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls: Bitrate A/B Switcher & Broadcast Loudness Normalization */}
      <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Bitrate Audition Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-edge-amber" />
            <span>Audition Bitrate:</span>
          </span>

          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-edge-well border border-white/5 w-full sm:w-auto">
            <button
              onClick={() => onUpdateParams({ audioBitrate: '320k' })}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                params.audioBitrate === '320k'
                  ? 'bg-edge-amber text-edge-obsidian shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Studio 320k</span>
            </button>

            <button
              onClick={() => onUpdateParams({ audioBitrate: '96k' })}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                params.audioBitrate === '96k'
                  ? 'bg-edge-amber text-edge-obsidian shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Edge Opus 96k</span>
            </button>

            <button
              onClick={() => onUpdateParams({ audioBitrate: '48k' })}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                params.audioBitrate === '48k'
                  ? 'bg-edge-amber text-edge-obsidian shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrainTrack className="w-3.5 h-3.5" />
              <span>Commute 48k</span>
            </button>
          </div>
        </div>

        {/* Broadcast Loudness Normalization Toggle */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <button
            onClick={() => onUpdateParams({ normalizeLufs: !params.normalizeLufs })}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
              params.normalizeLufs
                ? 'bg-edge-emerald/15 border-edge-emerald text-edge-emerald ring-1 ring-edge-emerald/30 shadow-md'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
            }`}
            title="Normalizes master dynamic range to EBU R128 standard -16 LUFS"
          >
            <Gauge className={`w-4 h-4 ${params.normalizeLufs ? 'text-edge-emerald animate-pulse' : 'text-gray-400'}`} />
            <div className="text-left">
              <div className="font-bold flex items-center gap-1.5">
                <span>Broadcast Normalization</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-edge-emerald/20 text-edge-emerald">
                  -16 LUFS
                </span>
              </div>
              <div className="text-[10px] text-gray-400 font-mono">
                {params.normalizeLufs ? 'Dynamic compression active' : `Raw origin (${asset.originalLufs || -23} LUFS)`}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

