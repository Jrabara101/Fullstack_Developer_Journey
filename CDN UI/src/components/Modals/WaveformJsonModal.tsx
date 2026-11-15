import React, { useState } from 'react';
import { 
  X, 
  FileJson, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  Zap,
  Activity
} from 'lucide-react';
import { MediaAsset } from '../../types';
import { EdgeService } from '../../services/edgeService';

interface WaveformJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: MediaAsset;
}

export const WaveformJsonModal: React.FC<WaveformJsonModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  if (!isOpen) return null;

  const waveformUrl = EdgeService.getWaveformJsonUrl(asset);
  const waveformPayload = {
    version: 1,
    assetId: asset.id,
    filename: asset.filename,
    durationSeconds: asset.duration || 180,
    channels: 2,
    sampleRate: 48000,
    samplePoints: asset.waveform?.length || 120,
    integratedLufs: asset.originalLufs || -23.4,
    peaks: asset.waveform || []
  };

  const jsonString = JSON.stringify(waveformPayload, null, 2);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(waveformUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-edge-panel border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-edge-obsidian/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-edge-amber/20 border border-edge-amber/30 flex items-center justify-center text-edge-amber">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Instant Scrub Waveform JSON Companion</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-edge-amber/15 text-edge-amber border border-edge-amber/30 font-bold uppercase">
                  1.2 KB Edge Endpoint
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Render instant zero-buffering visual waveforms in web & mobile players
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Endpoint URL Bar */}
          <div>
            <div className="text-[11px] font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
              <span>Public Edge Endpoint:</span>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1 text-edge-amber hover:text-amber-300 font-mono transition-colors"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-edge-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied URL!' : 'Copy Waveform URL'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-edge-obsidian border border-white/10 break-all text-edge-amber">
              {waveformUrl}
            </div>
          </div>

          {/* Mini Waveform Visualization */}
          <div className="p-3 rounded-xl bg-edge-obsidian border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center gap-1 text-white">
                <Activity className="w-3 h-3 text-edge-amber" />
                <span>Computed 120-Point Peak Array</span>
              </span>
              <span>1.2 KB Compressed JSON</span>
            </div>

            <div className="flex items-end gap-[2px] h-12 w-full justify-between">
              {asset.waveform?.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 bg-edge-amber rounded-full"
                  style={{ height: `${Math.max(10, v * 100)}%` }}
                />
              ))}
            </div>
          </div>

          {/* Raw JSON Payload */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-gray-300 mb-1.5">
              <span>Companion Edge JSON Payload:</span>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1 text-edge-cyan hover:text-cyan-300 transition-colors"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-edge-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copied JSON!' : 'Copy Payload'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-edge-obsidian border border-white/10 text-gray-300 max-h-48 overflow-y-auto leading-relaxed shadow-inner">
              {jsonString}
            </pre>
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

