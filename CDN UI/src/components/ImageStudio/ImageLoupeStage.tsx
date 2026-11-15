import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Target, 
  Crosshair, 
  Eye, 
  Maximize2, 
  Check, 
  MoveHorizontal,
  ShieldAlert,
  Info
} from 'lucide-react';
import { MediaAsset, TransformationParams, NetworkPersona } from '../../types';
import { EdgeDeliveryMetrics, EdgeService } from '../../services/edgeService';

interface ImageLoupeStageProps {
  asset: MediaAsset;
  params: TransformationParams;
  metrics: EdgeDeliveryMetrics;
  network: NetworkPersona;
  onUpdateFocalPoint: (point: { x: number; y: number }) => void;
}

export const ImageLoupeStage: React.FC<ImageLoupeStageProps> = ({
  asset,
  params,
  metrics,
  network,
  onUpdateFocalPoint,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showSaliencyZones, setShowSaliencyZones] = useState<boolean>(false);
  const [sonarActive, setSonarActive] = useState<boolean>(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // Handle dragging curtain divider
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateSlider(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updateSlider(e.clientX);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const updateSlider = (clientX: number) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percentage = (x / rect.width) * 100;
    setSliderPos(percentage);
  };

  // Handle clicking to drop Smart Gravity Pin
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drop pin if not clicking the slider handle
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const normX = Number((clickX / rect.width).toFixed(3));
    const normY = Number((clickY / rect.height).toFixed(3));

    onUpdateFocalPoint({ x: normX, y: normY });
    setSonarActive(true);
    setTimeout(() => setSonarActive(false), 800);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Stage Toolbar & Perceptual Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <MoveHorizontal className="w-4 h-4 text-edge-cyan" />
            <span>Before / After "Payload Diet" Loupe</span>
          </span>
          <span className="hidden sm:inline-block text-gray-500">•</span>
          <span className="text-gray-400 hidden sm:inline-block">
            Drag curtain or click anywhere to drop <strong className="text-edge-cyan">Smart Gravity Pin</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Perceptual Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-edge-emerald/15 text-edge-emerald border border-edge-emerald/30 font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{metrics.perceptualBadge}</span>
          </div>

          <button
            onClick={() => setShowSaliencyZones(!showSaliencyZones)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              showSaliencyZones 
                ? 'bg-edge-cyan/20 border-edge-cyan text-edge-cyan' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
            title="Toggle detected facial & product saliency detection boxes"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Saliency Zones</span>
          </button>
        </div>
      </div>

      {/* Main Inspection Stage Canvas */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleStageClick}
        className="relative h-[480px] sm:h-[520px] rounded-2xl overflow-hidden checkerboard-bg border border-white/10 shadow-2xl select-none cursor-crosshair group"
      >
        {/* Layer 1: Left (Raw Origin Upload) */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <img
            src={asset.originUrl}
            alt="Raw Origin"
            className="w-full h-full object-cover pointer-events-none"
            style={{
              objectPosition: `${params.focalPoint.x * 100}% ${params.focalPoint.y * 100}%`,
            }}
          />
        </div>

        {/* Layer 2: Right (Edge-Optimized Delivery) clipped by curtain slider */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
          }}
        >
          <img
            src={asset.originUrl}
            alt="Edge Optimized"
            className={`w-full h-full object-cover transition-all ${
              params.quality < 65 ? 'contrast-105' : ''
            }`}
            style={{
              objectPosition: `${params.focalPoint.x * 100}% ${params.focalPoint.y * 100}%`,
              filter: params.quality < 50 ? 'blur(0.5px)' : 'none',
            }}
          />

          {/* Slight micro-texture simulation for aggressive compression if quality < 60 */}
          {params.quality < 60 && (
            <div className="absolute inset-0 bg-repeat opacity-10 mix-blend-overlay pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]"></div>
          )}
        </div>

        {/* Floating Telemetry Badge: Left (Origin) */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <div className="glass-panel px-3 py-2 rounded-xl border border-white/15 shadow-xl text-left">
            <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
              ORIGIN RAW UPLOAD
            </div>
            <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
              <span>{asset.originFormat.split(' ')[0]}</span>
              <span className="text-gray-400">•</span>
              <span className="text-edge-rose">{EdgeService.formatBytes(asset.originBytes)}</span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
              Est. ~{Math.round((asset.originBytes / (network.bandwidthMbps * 125000)) * 1000)}ms on {network.networkType}
            </div>
          </div>
        </div>

        {/* Floating Telemetry Badge: Right (Edge Optimized) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <div className="glass-panel px-3 py-2 rounded-xl border border-edge-emerald/40 shadow-xl text-right bg-edge-obsidian/90">
            <div className="text-[10px] font-mono uppercase tracking-wider text-edge-emerald font-bold flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-edge-emerald animate-pulse"></span>
              <span>EDGE OPTIMIZED ({metrics.effectiveFormat})</span>
            </div>
            <div className="text-sm font-bold text-white font-mono flex items-center justify-end gap-1.5 mt-0.5">
              <span className="text-edge-emerald">{EdgeService.formatBytes(metrics.deliveredBytes)}</span>
              <span className="text-xs px-1.5 py-0.2 rounded bg-edge-emerald/20 text-edge-emerald font-extrabold">
                -{metrics.reductionPercentage}%
              </span>
            </div>
            <div className="text-[10px] text-edge-cyan font-mono mt-0.5">
              ⚡ {metrics.totalLoadTimeMs}ms Total Delivery (Edge HIT)
            </div>
          </div>
        </div>

        {/* Saliency Zones Overlay (if enabled) */}
        {showSaliencyZones && asset.saliencyRegions?.map((region) => (
          <div
            key={region.id}
            className="absolute z-10 border-2 border-dashed border-edge-cyan/80 bg-edge-cyan/10 rounded pointer-events-none transition-all flex flex-col justify-between p-1.5"
            style={{
              left: `${region.x * 100}%`,
              top: `${region.y * 100}%`,
              width: `${region.width * 100}%`,
              height: `${region.height * 100}%`,
            }}
          >
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-edge-obsidian/90 text-edge-cyan border border-edge-cyan/40 w-fit">
              {region.label} ({region.type.toUpperCase()})
            </span>
            <span className="text-[8px] font-mono text-edge-cyan/80 text-right">
              Safe Centroid Locked
            </span>
          </div>
        ))}

        {/* Smart Gravity Pin Reticle on the Image */}
        <div
          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
          style={{
            left: `${params.focalPoint.x * 100}%`,
            top: `${params.focalPoint.y * 100}%`,
          }}
        >
          {/* Sonar ripple animation */}
          {sonarActive && (
            <div className="absolute inset-0 rounded-full border-2 border-edge-cyan animate-sonar"></div>
          )}
          
          <div className="relative flex items-center justify-center w-10 h-10">
            <div className="w-8 h-8 rounded-full border-2 border-edge-cyan bg-edge-cyan/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-edge-cyan/50">
              <Crosshair className="w-4 h-4 text-white" />
            </div>
            {/* Center target dot */}
            <div className="absolute w-2 h-2 rounded-full bg-white shadow-sm"></div>

            {/* Floating Coordinate Pill */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-edge-obsidian/95 border border-edge-cyan/40 text-[10px] font-mono font-bold text-edge-cyan shadow-xl">
              Focal Pin: X {Math.round(params.focalPoint.x * 100)}%, Y {Math.round(params.focalPoint.y * 100)}%
            </div>
          </div>
        </div>

        {/* Curtain Splitter Line & Draggable Loupe Handle */}
        <div
          className="absolute top-0 bottom-0 z-30 pointer-events-none -translate-x-1/2"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Vertical Glowing Line */}
          <div className="w-[2px] h-full bg-gradient-to-b from-edge-cyan/40 via-edge-cyan to-edge-cyan/40 shadow-[0_0_12px_rgba(6,182,212,0.8)]"></div>

          {/* Central Handle Pill */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-edge-obsidian/95 border-2 border-edge-cyan text-edge-cyan shadow-2xl flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
            <MoveHorizontal className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Bottom Stage Advice Strip */}
        <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-none flex items-center justify-between text-[11px] text-gray-400 font-medium">
          <div className="glass-panel px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-edge-cyan" />
            <span>Click image to auto-center responsive crops</span>
          </div>

          {metrics.cropWarning && (
            <div className="px-2.5 py-1 rounded-lg bg-edge-amber/20 border border-edge-amber/40 text-edge-amber font-semibold flex items-center gap-1.5 shadow-lg">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{metrics.cropWarning}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

