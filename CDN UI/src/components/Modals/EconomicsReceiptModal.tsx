import React from 'react';
import { 
  X, 
  TrendingDown, 
  Zap, 
  Leaf, 
  BatteryCharging, 
  Users, 
  DollarSign, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { MediaAsset } from '../../types';
import { EdgeService } from '../../services/edgeService';

interface EconomicsReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAsset: MediaAsset;
}

export const EconomicsReceiptModal: React.FC<EconomicsReceiptModalProps> = ({
  isOpen,
  onClose,
  activeAsset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-edge-panel border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-edge-obsidian/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-edge-emerald/20 border border-edge-emerald/30 flex items-center justify-center text-edge-emerald">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Bandwidth Economics & Latency Receipt</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-edge-emerald/15 text-edge-emerald border border-edge-emerald/30 font-bold uppercase">
                  Verified Edge Metrics
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Monthly cost avoidance and performance gains across 284 edge points of presence
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

        {/* Modal Body / Receipt */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Hero Value Block */}
          <div className="rounded-2xl bg-gradient-to-br from-edge-emerald/15 via-edge-well to-edge-obsidian border border-edge-emerald/30 p-5">
            <div className="text-xs font-mono uppercase tracking-wider text-edge-emerald font-semibold mb-1">
              Plain-Language Impact Statement
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              "Edge Optimization saved <span className="text-edge-emerald">1.84 TB</span> of raw origin egress this month (<span className="text-edge-cyan">$147.20 saved</span>) and cut average mobile image/audio load time by <span className="text-edge-amber">1.9 seconds</span>."
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-300 font-mono">
              <span>Origin Egress Rate: $0.08 / GB</span>
              <span>•</span>
              <span className="text-edge-emerald font-semibold">99.4% Cache Hit Ratio</span>
            </div>
          </div>

          {/* 4 Tangible Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-edge-well border border-white/5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-edge-emerald/10 border border-edge-emerald/20 flex items-center justify-center text-edge-emerald shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Cloud Bill Egress Avoided</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">$147.20 USD</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Based on AWS S3 & GCP Cloud Storage baseline egress rates</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-edge-well border border-white/5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-edge-cyan/10 border border-edge-cyan/20 flex items-center justify-center text-edge-cyan shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Global Time Saved by Users</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">82.4 Hours</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Cumulative browser buffering wait time eliminated worldwide</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-edge-well border border-white/5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Estimated Carbon Offset</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">42.6 kg CO₂e</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Reduced radio transmitter wattage over cellular networks</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-edge-well border border-white/5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-edge-amber/10 border border-edge-amber/20 flex items-center justify-center text-edge-amber shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Save-Data Users Protected</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">8,410 Mobile Visitors</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Auto-downgraded without layout shift to prevent quota exhaust</div>
              </div>
            </div>
          </div>

          {/* Current Asset Math Formula */}
          <div className="p-4 rounded-xl bg-edge-obsidian border border-white/10 space-y-2">
            <div className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>Active Asset Surrogate Formula:</span>
              <span className="font-mono text-edge-cyan">{activeAsset.filename}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/50 font-mono text-xs text-gray-300 border border-white/5">
              bytesSaved = (originBytes - edgeBytes) × requestCount
              <br />
              <span className="text-edge-emerald">
                = ({EdgeService.formatBytes(activeAsset.originBytes)} - {EdgeService.formatBytes(activeAsset.originBytes * 0.02)}) × {activeAsset.totalRequestsMonth.toLocaleString()} requests
              </span>
              <br />
              <strong className="text-white">
                = ~{((activeAsset.originBytes * 0.98 * activeAsset.totalRequestsMonth) / 1000000000).toFixed(1)} GB saved on this asset alone!
              </strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-edge-obsidian/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

