import React, { useState, useRef, useCallback } from 'react';
import { useMarketingStore } from '../store/marketingStore.js';
import { AlertTriangle, CheckCircle2, Sliders, ArrowLeftRight, Clock, ShieldAlert, Zap, Layers, RefreshCw } from 'lucide-react';

export const ChaosVsClarityScrubber: React.FC = () => {
  const { chaosScrubberProgress, setChaosScrubberProgress, incrementSandboxAction } = useMarketingStore();
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const progress = Math.max(5, Math.min(95, (x / rect.width) * 100));
      setChaosScrubberProgress(Math.round(progress));
    },
    [setChaosScrubberProgress]
  );

  const handleMouseDown = () => {
    setIsDragging(true);
    incrementSandboxAction();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header & Quick Preset Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
            Workflow Comparator: The Old Way vs. Acme Clarity
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Drag the scrubber to contrast 14 fragmented manual steps with 1-click automated clarity.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setChaosScrubberProgress(15)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              chaosScrubberProgress < 30
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            Inspect Chaos
          </button>
          <button
            onClick={() => setChaosScrubberProgress(50)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              chaosScrubberProgress >= 30 && chaosScrubberProgress <= 70
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            Split 50/50
          </button>
          <button
            onClick={() => setChaosScrubberProgress(85)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              chaosScrubberProgress > 70
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            Inspect Clarity
          </button>
        </div>
      </div>

      {/* Main Scrubber Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        className="relative h-[380px] sm:h-[340px] rounded-2xl border border-white/10 bg-[#06080F] overflow-hidden select-none cursor-ew-resize shadow-2xl"
      >
        {/* RIGHT SIDE: ACME CLARITY (Full background layer) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#06121f] via-[#09152b] to-[#0d1c3a] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Unified Acme Platform (Single Action)
            </span>
            <span className="text-xs font-mono text-emerald-400">Time: 4.2 Seconds</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-1.5">
              <div className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> 1-Click Declarative Deploy
              </div>
              <p className="text-xs text-slate-300">
                Push code to GitHub. Edge proxy auto-builds, tests, and deploys without writing bash or YAML.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-1.5">
              <div className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> 380ms Canary Rollback
              </div>
              <p className="text-xs text-slate-300">
                Anomaly heuristic tripwires catch 5xx regressions instantly and revert before end users notice.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-1.5">
              <div className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Isolated DB Branching
              </div>
              <p className="text-xs text-slate-300">
                Instant database copy-on-write clones for every PR with automated data masking.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-t border-white/10 pt-3">
            <span className="text-emerald-400">✓ 99.994% Availability SLA</span>
            <span>Sleeps to $0 when idle overnight</span>
          </div>
        </div>

        {/* LEFT SIDE: LEGACY CHAOS (Clipped layer based on scrubber progress) */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-br from-[#1a0f0a] via-[#24130d] to-[#170a06] border-r border-amber-500/40 p-6 flex flex-col justify-between overflow-hidden transition-all duration-75"
          style={{ width: `${chaosScrubberProgress}%` }}
        >
          <div className="flex items-center justify-between min-w-[280px]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Legacy Status Quo (14 Fragile Steps)
            </span>
            <span className="text-xs font-mono text-amber-400">Time: 45 to 90 Minutes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto min-w-[360px] sm:min-w-[620px]">
            <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/30 space-y-1.5">
              <div className="text-amber-400 text-xs font-mono font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Manual Staging Syncs
              </div>
              <p className="text-xs text-slate-300">
                Waiting on the infra lead to SSH into staging, update secrets, and manually run migration scripts.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-red-500/30 space-y-1.5">
              <div className="text-red-400 text-xs font-mono font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Friday Release Panic
              </div>
              <p className="text-xs text-slate-300">
                A bad Docker tag corrupts production at 4:45 PM. Slack notifications light up with 42 angry pings.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/30 space-y-1.5">
              <div className="text-amber-400 text-xs font-mono font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Idle Cloud Waste
              </div>
              <p className="text-xs text-slate-300">
                12 orphan dev servers running 24/7 on AWS incurring $4,800/mo while engineers are asleep.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-amber-400/80 font-mono border-t border-amber-500/20 pt-3 min-w-[280px]">
            <span>⚠️ High Configuration Drift Risk</span>
            <span>Manual rollback: 45 min downtime</span>
          </div>
        </div>

        {/* Draggable Divider Handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center -ml-0.5"
          style={{ left: `${chaosScrubberProgress}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center font-bold text-xs hover:scale-110 transition-transform">
            <ArrowLeftRight className="w-4 h-4 text-slate-900" />
          </div>
        </div>
      </div>
    </div>
  );
};
