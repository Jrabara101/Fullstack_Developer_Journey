import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Shield, 
  Sliders, 
  Code, 
  Lock, 
  RefreshCw, 
  Zap, 
  Sparkles,
  Info,
  Layers,
  FileCheck,
  AlertOctagon
} from 'lucide-react';
import { 
  MediaAsset, 
  TransformationParams, 
  CachePreset, 
  ImageFormat, 
  CropMode,
  HotlinkDomain
} from '../../types';
import { CACHE_PRESETS, HOTLINK_DOMAINS } from '../../data/mockAssets';
import { EdgeDeliveryMetrics, EdgeService } from '../../services/edgeService';

interface TransformationInspectorProps {
  asset: MediaAsset;
  params: TransformationParams;
  metrics: EdgeDeliveryMetrics;
  onUpdateParams: (newParams: Partial<TransformationParams>) => void;
  selectedCachePreset: CachePreset;
  onSelectCachePreset: (preset: CachePreset) => void;
  onOpenCodeDrawer: () => void;
  onOpenHotlinkModal: () => void;
}

export const TransformationInspector: React.FC<TransformationInspectorProps> = ({
  asset,
  params,
  metrics,
  onUpdateParams,
  selectedCachePreset,
  onSelectCachePreset,
  onOpenCodeDrawer,
  onOpenHotlinkModal,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [hotlinkList, setHotlinkList] = useState<HotlinkDomain[]>(HOTLINK_DOMAINS);
  const isImage = asset.type === 'image';

  const fullCdnUrl = EdgeService.buildCdnUrl(asset, params);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullCdnUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleUpdateDomainStatus = (domainName: string, status: 'blocked' | 'watermarked' | 'whitelisted') => {
    setHotlinkList(prev => prev.map(d => d.domain === domainName ? { ...d, status } : d));
  };

  return (
    <aside className="bg-edge-panel border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-5">
      {/* 1. Live Color-Coded CDN URL Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-edge-cyan animate-pulse"></span>
            <span>Live Edge Stream Endpoint</span>
          </span>
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1 text-[11px] text-edge-cyan hover:text-cyan-300 font-mono transition-colors"
          >
            {copiedUrl ? <Check className="w-3 h-3 text-edge-emerald" /> : <Copy className="w-3 h-3" />}
            <span>{copiedUrl ? 'Copied URL!' : 'Copy URL'}</span>
          </button>
        </div>

        {/* Monospace Color-Coded URL Display */}
        <div className="p-2.5 rounded-xl bg-edge-obsidian border border-white/10 font-mono text-xs break-all leading-relaxed shadow-inner">
          <span className="text-gray-400">https://cdn.edgestream.io/media/</span>
          <span className="text-white font-bold">{asset.filename}</span>
          <span className="text-edge-cyan">?f={params.saveData ? 'webp' : (params.format === 'auto' ? 'avif' : params.format)}</span>
          {isImage ? (
            <>
              <span className="text-edge-amber">&w={params.width}</span>
              <span className="text-edge-emerald">&q={params.quality}</span>
              <span className="text-purple-400">&crop={params.cropMode}</span>
              <span className="text-pink-400">&fp={Math.round(params.focalPoint.x * 100)},{Math.round(params.focalPoint.y * 100)}</span>
              {params.aspectRatio !== 'original' && <span className="text-yellow-400">&ar={params.aspectRatio}</span>}
              {params.saveData && <span className="text-orange-400">&savedata=1</span>}
            </>
          ) : (
            <>
              <span className="text-edge-amber">&br={params.audioBitrate}</span>
              {params.normalizeLufs && <span className="text-edge-emerald">&lufs=-16</span>}
              {params.trimEnd > params.trimStart && (
                <span className="text-pink-400">&trim={Math.round(params.trimStart)},{Math.round(params.trimEnd)}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2. Image Transformations Panel (Only for images) */}
      {isImage && (
        <div className="space-y-4 pt-3 border-t border-white/10">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-edge-cyan" />
              <span>Format & Quality Tuning</span>
            </span>
            <span className="text-[10px] font-mono text-edge-emerald font-semibold">
              Perceptual: {metrics.perceptualScore}/100
            </span>
          </div>

          {/* Format Radio Pills */}
          <div>
            <div className="text-[11px] text-gray-400 mb-1.5 font-medium">Negotiated Edge Format:</div>
            <div className="grid grid-cols-5 gap-1 p-1 bg-edge-well rounded-xl border border-white/5 text-xs font-mono">
              {(['auto', 'avif', 'webp', 'jpeg', 'png'] as ImageFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => onUpdateParams({ format: fmt })}
                  className={`py-1.5 rounded-lg text-center font-bold uppercase transition-all ${
                    params.format === fmt
                      ? 'bg-edge-cyan text-edge-obsidian shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider with Live Visual Score */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
              <span>Compression Quality:</span>
              <span className="font-mono text-white font-bold">{params.quality}%</span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              value={params.quality}
              onChange={(e) => onUpdateParams({ quality: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-1">
              <span>Aggressive (30%)</span>
              <span>Retina Standard (80%)</span>
              <span>Master (100%)</span>
            </div>
          </div>

          {/* Width Dimension Preset Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
              <span>Max Width Breakpoint:</span>
              <span className="font-mono text-edge-cyan font-bold">{params.width} px</span>
            </div>
            <input
              type="range"
              min={480}
              max={2400}
              step={40}
              value={params.width}
              onChange={(e) => onUpdateParams({ width: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex items-center gap-1.5 mt-1.5">
              {[640, 1080, 1200, 1920, 2400].map((w) => (
                <button
                  key={w}
                  onClick={() => onUpdateParams({ width: w })}
                  className={`flex-1 py-1 rounded text-[10px] font-mono font-semibold border transition-all ${
                    params.width === w
                      ? 'bg-edge-cyan/20 border-edge-cyan text-edge-cyan'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {w}w
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Plain-English Cache Behavior Presets */}
      <div className="pt-3 border-t border-white/10">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-edge-emerald" />
            <span>Plain-English Cache Intent</span>
          </span>
          <span className="text-[10px] font-mono text-edge-emerald">Surrogate Atomic</span>
        </div>

        <div className="space-y-2">
          {CACHE_PRESETS.map((preset) => {
            const isSelected = selectedCachePreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => onSelectCachePreset(preset)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-edge-well border-edge-emerald ring-1 ring-edge-emerald/40 shadow-md text-white'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>{preset.title}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-edge-emerald/20 text-edge-emerald' : 'bg-white/5 text-gray-400'
                  }`}>
                    {preset.badge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {preset.description}
                </p>
                <div className="mt-1.5 pt-1.5 border-t border-white/5 font-mono text-[10px] text-gray-500 truncate select-all">
                  Cache-Control: {preset.headerString}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Bandwidth Thief & Hotlink Shield Radar Mini */}
      <div className="pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          <span className="flex items-center gap-1.5 text-edge-rose">
            <Shield className="w-3.5 h-3.5" />
            <span>Hotlink Shield Radar</span>
          </span>
          <button
            onClick={onOpenHotlinkModal}
            className="text-[10px] font-mono text-edge-cyan hover:underline lowercase"
          >
            view all ({hotlinkList.length})
          </button>
        </div>

        <div className="p-3 rounded-xl bg-edge-well border border-white/10 space-y-2.5">
          <div className="text-[11px] text-gray-300 flex items-center justify-between">
            <span className="font-semibold text-white">Blocked 14,200 leech requests</span>
            <span className="text-edge-emerald font-mono font-bold">18.2 GB Saved</span>
          </div>

          {hotlinkList.slice(0, 2).map((item) => (
            <div key={item.domain} className="flex items-center justify-between text-xs gap-2 pt-2 border-t border-white/5">
              <div className="min-w-0 flex items-center gap-1.5">
                <span className="text-sm">{item.avatar}</span>
                <span className="font-mono text-[11px] text-gray-300 truncate" title={item.domain}>
                  {item.domain}
                </span>
              </div>

              {/* Status pill / Toggle */}
              <select
                value={item.status}
                onChange={(e) => handleUpdateDomainStatus(item.domain, e.target.value as any)}
                className="bg-edge-obsidian border border-white/10 rounded-lg text-[10px] font-mono font-semibold py-1 px-1.5 text-gray-200 focus:outline-none focus:border-edge-cyan"
              >
                <option value="blocked">🛡️ Block</option>
                <option value="watermarked">🏷️ Watermark</option>
                <option value="whitelisted">✅ Whitelist</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Production Code Recipe Box Trigger */}
      <div className="pt-3 border-t border-white/10">
        <button
          onClick={onOpenCodeDrawer}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-edge-cyan/20 to-edge-emerald/20 hover:from-edge-cyan/30 hover:to-edge-emerald/30 border border-edge-cyan/40 text-edge-cyan font-bold text-xs tracking-wide transition-all shadow-lg active:scale-98"
        >
          <Code className="w-4 h-4" />
          <span>&lt;/&gt; Copy Production Drop-In Component</span>
        </button>
      </div>
    </aside>
  );
};

