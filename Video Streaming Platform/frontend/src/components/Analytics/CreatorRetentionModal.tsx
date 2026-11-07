import React, { useState, useMemo } from 'react';
import { X, TrendingUp, Users, Clock, Monitor, Smartphone, Play, Zap } from 'lucide-react';
import { Video } from '../../types/video';

interface CreatorRetentionModalProps {
  video: Video;
  onClose: () => void;
  onSeek: (seconds: number) => void;
}

export const CreatorRetentionModal: React.FC<CreatorRetentionModalProps> = ({ video, onClose, onSeek }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ sec: number; retention: number; x: number; y: number } | null>(null);

  const stats = video.retentionStats || {
    averagePercentageViewed: 74.2,
    completionRate: 61.8,
    peakReplayTimeMs: 654000,
    totalWatchHours: 4210,
    deviceBreakdown: [
      { name: 'Desktop Cinema (4K/1440p)', percentage: 58 },
      { name: 'Mobile / Tablet', percentage: 29 },
      { name: 'Living Room TV', percentage: 13 }
    ]
  };

  // Generate 100 retention curve points (100% -> gradual drop to ~62%, with peak spikes where replayed)
  const retentionCurve = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      let val = 100 - Math.pow(i, 0.78) * 1.05;
      // Replay bump around 42% (e.g. 10:58)
      if (i >= 38 && i <= 46) {
        val += 6.5;
      }
      return {
        percent: i,
        sec: Math.floor((i / 100) * video.durationSeconds),
        retention: Math.min(100, Math.max(30, Math.round(val * 10) / 10))
      };
    });
  }, [video.durationSeconds]);

  const svgPath = useMemo(() => {
    const width = 800;
    const height = 180;
    const points = retentionCurve.map((pt, idx) => {
      const x = (idx / (retentionCurve.length - 1)) * width;
      // Invert Y: 100% retention at y=10, 0% at y=height
      const y = height - (pt.retention / 100) * (height - 20);
      return { x, y };
    });

    let d = `M 0,${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` Q ${p0.x},${p0.y} ${cpX},${(p0.y + p1.y) / 2}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last.x},${last.y}`;
    
    // Fill path
    const fillPath = `${d} L ${width},${height} L 0,${height} Z`;
    return { linePath: d, fillPath };
  }, [retentionCurve]);

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#12141a] border border-white/15 rounded-2xl p-6 shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Second-by-Second Viewer Retention Telemetry</h3>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                PRO STUDIO
              </span>
            </div>
            <p className="text-xs text-slate-400">Redis-buffered second slices & drop-off analysis</p>
          </div>
        </div>

        {/* KPI Triad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[11px] text-slate-400 mb-0.5">Avg % Viewed</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {stats.averagePercentageViewed}%
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
              <span>+8.4% above cinema avg</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[11px] text-slate-400 mb-0.5">Completion Rate</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {stats.completionRate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {Math.round(video.viewsCount * (stats.completionRate / 100)).toLocaleString()} full completions
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[11px] text-slate-400 mb-0.5">Peak Replay Moment</div>
            <div className="text-xl font-bold font-mono text-amber-300 tabular-nums">
              {formatSec(Math.floor(stats.peakReplayTimeMs / 1000))}
            </div>
            <button
              onClick={() => {
                onSeek(stats.peakReplayTimeMs / 1000);
                onClose();
              }}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1"
            >
              <Play size={10} />
              <span>Jump to peak moment</span>
            </button>
          </div>
        </div>

        {/* Interactive Retention Curve SVG Chart */}
        <div className="p-4 rounded-xl bg-black/50 border border-white/10 mb-5 relative">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Viewer Retention Percentage</span>
            <span className="font-mono text-[11px] text-slate-500">Duration: {formatSec(video.durationSeconds)}</span>
          </div>

          <div className="relative w-full h-[180px]">
            <svg 
              viewBox="0 0 800 180" 
              preserveAspectRatio="none" 
              className="w-full h-full cursor-crosshair"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, x / rect.width));
                const idx = Math.floor(ratio * (retentionCurve.length - 1));
                const pt = retentionCurve[idx];
                setHoveredPoint({ sec: pt.sec, retention: pt.retention, x, y: e.clientY - rect.top });
              }}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={() => {
                if (hoveredPoint) {
                  onSeek(hoveredPoint.sec);
                  onClose();
                }
              }}
            >
              <defs>
                <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={svgPath.fillPath} fill="url(#retentionGrad)" />
              <path d={svgPath.linePath} fill="none" stroke="#34D399" strokeWidth="2.5" />
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div 
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-[#12141a]/95 border border-white/20 rounded-lg px-2.5 py-1 text-xs shadow-xl z-20"
                style={{ left: `${hoveredPoint.x}px`, top: `${hoveredPoint.y}px` }}
              >
                <div className="font-mono text-emerald-300 font-bold">{hoveredPoint.retention}% retained</div>
                <div className="text-[10px] text-slate-400 font-mono">@ {formatSec(hoveredPoint.sec)} (Click to jump)</div>
              </div>
            )}
          </div>
        </div>

        {/* Device & Bandwidth Breakdown Ribbon */}
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-2">Device & Resolution Breakdown</div>
          <div className="grid grid-cols-3 gap-2">
            {stats.deviceBreakdown.map((dev, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {idx === 0 ? <Monitor size={14} className="text-indigo-400" /> : <Smartphone size={14} className="text-slate-400" />}
                  <span className="text-slate-300 truncate max-w-[120px]">{dev.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{dev.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
