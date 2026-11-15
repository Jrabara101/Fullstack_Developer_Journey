import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  RotateCcw, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { MediaAsset, AssetVersion } from '../../types';
import { INITIAL_ASSET_VERSIONS } from '../../data/mockAssets';
import { EdgeService } from '../../services/edgeService';

interface AssetSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: MediaAsset;
  onSwapCompleted: (newVersionNum: number) => void;
}

export const AssetSwapModal: React.FC<AssetSwapModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSwapCompleted,
}) => {
  const [versions, setVersions] = useState<AssetVersion[]>(
    INITIAL_ASSET_VERSIONS[asset.id] || [
      {
        version: 2,
        hash: 'sha256_8f3a9021cb7419e48c1b',
        timestamp: 'Just now',
        bytes: asset.originBytes,
        summary: 'Current live edge pointer',
        isCurrent: true,
      },
      {
        version: 1,
        hash: 'sha256_10a9f39002bb5d49aa01',
        timestamp: '2 days ago',
        bytes: Math.round(asset.originBytes * 1.15),
        summary: 'Previous revision master',
        isCurrent: false,
      }
    ]
  );

  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentVersion = versions.find(v => v.isCurrent) || versions[0];

  const handleRollback = (targetVer: AssetVersion) => {
    if (targetVer.isCurrent) return;
    setIsSwapping(true);

    setTimeout(() => {
      setVersions(prev => prev.map(v => ({
        ...v,
        isCurrent: v.version === targetVer.version
      })));
      setIsSwapping(false);
      setSwapSuccess(`Successfully rolled back to Version ${targetVer.version}! Edge alias updated.`);
      onSwapCompleted(targetVer.version);
      setTimeout(() => setSwapSuccess(null), 3500);
    }, 1200);
  };

  const handleSimulateNewUpload = () => {
    setIsSwapping(true);
    setTimeout(() => {
      const nextVerNum = Math.max(...versions.map(v => v.version)) + 1;
      const newVer: AssetVersion = {
        version: nextVerNum,
        hash: `sha256_${Math.random().toString(16).slice(2, 12)}...`,
        timestamp: 'Just now',
        bytes: Math.round(asset.originBytes * 0.95),
        summary: 'Color-corrected studio master revision',
        isCurrent: true
      };

      setVersions(prev => [newVer, ...prev.map(v => ({ ...v, isCurrent: false }))]);
      setIsSwapping(false);
      setSwapSuccess(`New file pinned as Version ${nextVerNum}! Public URL preserved with 0s downtime.`);
      onSwapCompleted(nextVerNum);
      setTimeout(() => setSwapSuccess(null), 3500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-edge-panel border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-edge-obsidian/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-edge-indigo/20 border border-edge-indigo/30 flex items-center justify-center text-edge-indigo">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Zero-Downtime Asset Swap & Version Pinning</span>
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Immutable Blob Hashing → Mutable Edge Pointer ({asset.filename})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Explanation Banner */}
          <div className="p-3.5 rounded-xl bg-edge-well border border-white/5 text-gray-300 leading-relaxed">
            Replace <strong className="text-white font-mono">{asset.filename}</strong> with a corrected audio cut or retouched hero image without breaking links, changing CDN URLs, or experiencing caching delay. Reassigning the pointer triggers an instant atomic surrogate-key cache invalidation.
          </div>

          {swapSuccess && (
            <div className="p-3 rounded-xl bg-edge-emerald/20 border border-edge-emerald/40 text-edge-emerald font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{swapSuccess}</span>
            </div>
          )}

          {/* Current Live Pointer Card */}
          <div className="p-4 rounded-xl bg-edge-obsidian border border-edge-cyan/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-edge-cyan font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-edge-cyan animate-pulse"></span>
                <span>Active Production Alias Pointer</span>
              </span>
              <span className="text-white font-mono font-bold">Version {currentVersion.version}</span>
            </div>

            <div className="font-mono text-gray-300 truncate text-[11px] select-all bg-black/40 p-2 rounded-lg border border-white/5">
              Blob Hash: {currentVersion.hash} • {EdgeService.formatBytes(currentVersion.bytes)}
            </div>
          </div>

          {/* Upload Corrected File Action */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-300">
                <UploadCloud className="w-4 h-4 text-edge-cyan" />
              </div>
              <div>
                <div className="font-semibold text-white">Upload Corrected File Revision</div>
                <div className="text-[10px] text-gray-400">Maintains current public CDN URL seamlessly</div>
              </div>
            </div>

            <button
              onClick={handleSimulateNewUpload}
              disabled={isSwapping}
              className="px-3 py-1.5 rounded-lg bg-edge-cyan/20 hover:bg-edge-cyan/30 text-edge-cyan border border-edge-cyan/40 font-semibold transition-all text-xs"
            >
              {isSwapping ? 'Swapping Blob...' : 'Upload & Pin'}
            </button>
          </div>

          {/* Version History & 1-Click Rollback */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Version Revision History & Rollback</span>
            </div>

            <div className="space-y-2">
              {versions.map((v) => (
                <div
                  key={v.version}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    v.isCurrent
                      ? 'bg-edge-well border-edge-cyan/40'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">v{v.version}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{v.timestamp}</span>
                      {v.isCurrent && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-edge-cyan/20 text-edge-cyan font-bold">
                          CURRENT LIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate mt-0.5">{v.summary}</div>
                  </div>

                  {!v.isCurrent && (
                    <button
                      onClick={() => handleRollback(v)}
                      disabled={isSwapping}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-gray-200 border border-white/10 font-mono text-[11px] transition-colors shrink-0"
                    >
                      <RotateCcw className="w-3 h-3 text-edge-indigo" />
                      <span>Rollback</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-edge-obsidian/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

