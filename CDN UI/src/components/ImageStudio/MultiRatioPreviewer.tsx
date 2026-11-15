import React from 'react';
import { 
  Monitor, 
  Smartphone, 
  Square, 
  Share2, 
  AlertTriangle, 
  CheckCircle2,
  Sparkles,
  Maximize
} from 'lucide-react';
import { MediaAsset, TransformationParams } from '../../types';

interface MultiRatioPreviewerProps {
  asset: MediaAsset;
  params: TransformationParams;
  onSelectRatio: (ratio: string) => void;
}

interface CropSpec {
  ratio: string;
  name: string;
  deviceIcon: React.ReactNode;
  aspectClass: string;
  targetResolution: string;
  dimensions: { width: number; height: number };
  safeZoneCutoffRisk: boolean;
  nudgeApplied: boolean;
}

export const MultiRatioPreviewer: React.FC<MultiRatioPreviewerProps> = ({
  asset,
  params,
  onSelectRatio,
}) => {
  const fpX = params.focalPoint.x;
  const fpY = params.focalPoint.y;

  // Evaluate each crop against saliency safe zones
  const faceRegion = asset.saliencyRegions?.find(r => r.type === 'face');

  const crops: CropSpec[] = [
    {
      ratio: '16:9',
      name: 'Desktop Hero',
      deviceIcon: <Monitor className="w-3.5 h-3.5" />,
      aspectClass: 'aspect-video',
      targetResolution: '1920 × 1080',
      dimensions: { width: 1920, height: 1080 },
      safeZoneCutoffRisk: fpX < 0.25 || fpX > 0.75,
      nudgeApplied: fpX < 0.25 || fpX > 0.75,
    },
    {
      ratio: '4:5',
      name: 'Mobile Feed',
      deviceIcon: <Smartphone className="w-3.5 h-3.5" />,
      aspectClass: 'aspect-[4/5]',
      targetResolution: '1080 × 1350',
      dimensions: { width: 1080, height: 1350 },
      // if focal point is too low, upper head could get cut off in 4:5
      safeZoneCutoffRisk: (faceRegion && fpY > 0.62) || false,
      nudgeApplied: (faceRegion && fpY > 0.62) || false,
    },
    {
      ratio: '1:1',
      name: 'Avatar / Thumbnail',
      deviceIcon: <Square className="w-3.5 h-3.5" />,
      aspectClass: 'aspect-square',
      targetResolution: '800 × 800',
      dimensions: { width: 800, height: 800 },
      safeZoneCutoffRisk: false,
      nudgeApplied: false,
    },
    {
      ratio: '1.91:1',
      name: 'OpenGraph Social Card',
      deviceIcon: <Share2 className="w-3.5 h-3.5" />,
      aspectClass: 'aspect-[1.91/1]',
      targetResolution: '1200 × 630',
      dimensions: { width: 1200, height: 630 },
      safeZoneCutoffRisk: fpY < 0.25 || fpY > 0.75,
      nudgeApplied: fpY < 0.25 || fpY > 0.75,
    },
  ];

  return (
    <div className="bg-edge-panel border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-edge-cyan" />
            <span>Smart Responsive Crop Derivatives</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time viewport simulation centered dynamically around your <strong className="text-gray-200">Smart Gravity Pin</strong>
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-edge-emerald bg-edge-emerald/10 border border-edge-emerald/20 px-2.5 py-1 rounded-full font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Broken-Crop Guard Active</span>
        </div>
      </div>

      {/* Grid of 4 Responsive Aspect Previews */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {crops.map((crop) => {
          const isSelected = params.aspectRatio === crop.ratio;

          // Object-position nudged coordinates if safe zone warning triggered
          const finalX = crop.nudgeApplied && crop.ratio === '16:9' ? (fpX < 0.25 ? 0.35 : 0.65) : fpX;
          const finalY = crop.nudgeApplied && crop.ratio === '4:5' ? Math.min(fpY, 0.42) : fpY;

          return (
            <div
              key={crop.ratio}
              onClick={() => onSelectRatio(crop.ratio)}
              className={`group relative rounded-xl border p-2 cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-edge-well border-edge-cyan ring-1 ring-edge-cyan shadow-lg shadow-edge-cyan/10'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              {/* Header Label */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-gray-200 flex items-center gap-1.5 truncate">
                  <span className="text-edge-cyan">{crop.deviceIcon}</span>
                  <span>{crop.name}</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-bold">
                  {crop.ratio}
                </span>
              </div>

              {/* Aspect Ratio Preview Stage */}
              <div className={`relative w-full ${crop.aspectClass} rounded-lg overflow-hidden bg-edge-obsidian border border-white/10 group-hover:border-edge-cyan/40 transition-colors`}>
                <img
                  src={asset.originUrl}
                  alt={crop.name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                  style={{
                    objectPosition: `${finalX * 100}% ${finalY * 100}%`,
                  }}
                />

                {/* Simulated Focus Pin Indicator in mini view */}
                <div
                  className="absolute w-2 h-2 rounded-full bg-edge-cyan border border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${finalX * 100}%`,
                    top: `${finalY * 100}%`,
                  }}
                />

                {/* Warning / Nudge Overlay badge */}
                {crop.safeZoneCutoffRisk && (
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-edge-amber/90 text-edge-obsidian text-[9px] font-bold font-mono flex items-center gap-1 shadow-md">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Auto-Nudged</span>
                  </div>
                )}
              </div>

              {/* Footer specs */}
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>{crop.targetResolution}</span>
                <span className="text-edge-emerald font-semibold">Ready</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

