import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Layers, 
  Palette, 
  Sparkles, 
  Timer, 
  Check, 
  Flame,
  FileCode2,
  Cpu
} from 'lucide-react';
import { MediaAsset, NetworkPersona, PlaceholderMode } from '../../types';
import { EdgeDeliveryMetrics } from '../../services/edgeService';

interface ProgressiveLoadSimulatorProps {
  asset: MediaAsset;
  network: NetworkPersona;
  metrics: EdgeDeliveryMetrics;
}

export const ProgressiveLoadSimulator: React.FC<ProgressiveLoadSimulatorProps> = ({
  asset,
  network,
  metrics,
}) => {
  const [mode, setMode] = useState<PlaceholderMode>('blurhash');
  const [loadStage, setLoadStage] = useState<'idle' | 'ttfb' | 'placeholder' | 'decoding' | 'complete'>('complete');
  const [elapsedMs, setElapsedMs] = useState<number>(metrics.totalLoadTimeMs);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Trigger progressive loading sequence animation
  const runSimulation = () => {
    setIsSimulating(true);
    setLoadStage('ttfb');
    setElapsedMs(0);

    const ttfbTarget = network.latencyMs;
    const placeholderTarget = ttfbTarget + 25;
    const decodingTarget = placeholderTarget + Math.round(metrics.transferDurationMs * 0.4);
    const completeTarget = metrics.totalLoadTimeMs;

    const interval = setInterval(() => {
      setElapsedMs((prev) => {
        const next = prev + 15;
        if (next < ttfbTarget) {
          setLoadStage('ttfb');
        } else if (next < placeholderTarget) {
          setLoadStage('placeholder');
        } else if (next < decodingTarget) {
          setLoadStage('decoding');
        } else if (next >= completeTarget) {
          setLoadStage('complete');
          setIsSimulating(false);
          clearInterval(interval);
          return completeTarget;
        }
        return next;
      });
    }, 15);
  };

  useEffect(() => {
    setElapsedMs(metrics.totalLoadTimeMs);
    setLoadStage('complete');
  }, [network.id, asset.id]);

  const dominantHex = asset.dominantColors?.[0] || '#2C2B30';
  const secondaryHex = asset.dominantColors?.[1] || '#B86B4F';

  return (
    <div className="bg-edge-panel border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Timer className="w-4 h-4 text-edge-cyan" />
            <span>Progressive Placeholder Choreography (First 200ms)</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Experience what users see before full image bytes arrive over <span className="text-white font-medium">{network.name}</span>
          </p>
        </div>

        {/* Replay Simulation Button */}
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-edge-cyan/15 hover:bg-edge-cyan/25 border border-edge-cyan/30 text-edge-cyan text-xs font-semibold transition-all active:scale-95"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Simulating Pipeline...' : 'Replay Load Sequence'}</span>
        </button>
      </div>

      {/* Placeholder Technique Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => setMode('blurhash')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
            mode === 'blurhash'
              ? 'bg-edge-well border-edge-cyan text-white shadow-sm'
              : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-edge-cyan shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold truncate">BlurHash Soft Wash</div>
            <div className="text-[10px] text-gray-500 font-mono">32-Byte String</div>
          </div>
        </button>

        <button
          onClick={() => setMode('palette')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
            mode === 'palette'
              ? 'bg-edge-well border-edge-cyan text-white shadow-sm'
              : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-edge-amber shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold truncate">Dominant Color Matte</div>
            <div className="text-[10px] text-gray-500 font-mono">OKLCH Swatches</div>
          </div>
        </button>

        <button
          onClick={() => setMode('silhouette')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all col-span-2 sm:col-span-1 ${
            mode === 'silhouette'
              ? 'bg-edge-well border-edge-cyan text-white shadow-sm'
              : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-edge-indigo shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold truncate">Vector Silhouette Trace</div>
            <div className="text-[10px] text-gray-500 font-mono">1.1 KB Inline SVG</div>
          </div>
        </button>
      </div>

      {/* Live Simulation Monitor Box */}
      <div className="relative h-64 rounded-xl overflow-hidden bg-edge-obsidian border border-white/10 flex items-center justify-center">
        {/* State: TTFB (Blank screen with spinner) */}
        {loadStage === 'ttfb' && (
          <div className="flex flex-col items-center gap-2 text-gray-400 text-xs">
            <div className="w-6 h-6 border-2 border-edge-cyan border-t-transparent rounded-full animate-spin"></div>
            <span className="font-mono text-gray-300">Negotiating Edge TLS & TTFB ({elapsedMs}ms)...</span>
          </div>
        )}

        {/* State: Placeholder Rendered (BlurHash, Palette Matte, or Silhouette) */}
        {(loadStage === 'placeholder' || loadStage === 'decoding') && (
          <div className="absolute inset-0 flex items-center justify-center">
            {mode === 'blurhash' && (
              <div
                className="w-full h-full filter blur-xl scale-110 transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at 60% 40%, ${secondaryHex} 0%, ${dominantHex} 100%)`,
                }}
              />
            )}

            {mode === 'palette' && (
              <div
                className="w-full h-full flex flex-col justify-end p-4 transition-all duration-300"
                style={{ backgroundColor: dominantHex }}
              >
                <div className="flex items-center gap-2">
                  {asset.dominantColors?.map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-white/20 shadow"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {mode === 'silhouette' && (
              <div className="w-full h-full flex items-center justify-center bg-edge-well p-6">
                <svg className="w-full h-full opacity-40 animate-pulse text-edge-cyan" viewBox="0 0 100 60">
                  <path
                    d="M 10 50 Q 25 20, 50 35 T 90 25 L 90 55 L 10 55 Z"
                    fill="currentColor"
                  />
                  <circle cx="65" cy="22" r="10" fill="currentColor" opacity="0.6" />
                </svg>
              </div>
            )}

            {/* Decoding Scanline Overlay */}
            {loadStage === 'decoding' && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-pulse pointer-events-none"></div>
            )}
          </div>
        )}

        {/* State: Full Image Complete */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            loadStage === 'complete' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={asset.originUrl}
            alt="Decoded"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Floating Ticker HUD */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs pointer-events-none">
          <div className="glass-panel px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-edge-cyan animate-ping"></span>
            <span className="font-mono text-white font-bold font-tabular">{elapsedMs}ms</span>
            <span className="text-gray-400 font-mono text-[11px] truncate">
              {loadStage === 'ttfb' && 'Edge Handshake'}
              {loadStage === 'placeholder' && 'Instant Micro-Placeholder (32 B)'}
              {loadStage === 'decoding' && 'Progressive Scanline Decode'}
              {loadStage === 'complete' && 'Zero Layout-Shift Decode Finished'}
            </span>
          </div>

          <div className="glass-panel px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-edge-emerald font-semibold">
            {metrics.totalLoadTimeMs}ms Total Delivery
          </div>
        </div>
      </div>

      {/* Companion BlurHash & Color Palette Chips */}
      <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-mono text-[11px]">BlurHash:</span>
          <code className="px-2 py-0.5 rounded bg-edge-well border border-white/5 font-mono text-[11px] text-edge-cyan select-all">
            {asset.blurHash || 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'}
          </code>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-mono text-[11px]">Dominant Swatches:</span>
          <div className="flex items-center gap-1.5">
            {asset.dominantColors?.map((hex, i) => (
              <span
                key={i}
                className="w-4 h-4 rounded-md border border-white/20 shadow-sm cursor-pointer hover:scale-125 transition-transform"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

