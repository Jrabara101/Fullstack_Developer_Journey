import React from 'react';
import { useMarketingStore } from '../store/marketingStore.js';
import {
  X,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Layers,
  Activity,
  Server
} from 'lucide-react';

export const StackBlueprintDrawer: React.FC = () => {
  const {
    isBlueprintDrawerOpen,
    setIsBlueprintDrawerOpen,
    activeBlueprintTestimonial
  } = useMarketingStore();

  if (!isBlueprintDrawerOpen || !activeBlueprintTestimonial) return null;

  const t = activeBlueprintTestimonial;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-full bg-[#0D111C] border-l border-white/10 p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="space-y-6">
          {/* Top Bar with Close */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                <Layers className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Architecture Blueprint
              </span>
            </div>
            <button
              onClick={() => setIsBlueprintDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Profile & Stage */}
          <div className="flex items-center gap-3">
            <img
              src={t.avatarUrl}
              alt={t.authorName}
              className="w-12 h-12 rounded-full object-cover border border-indigo-500/30"
            />
            <div>
              <h4 className="text-base font-bold text-white">{t.authorName}</h4>
              <p className="text-xs text-slate-400">
                {t.authorRole} at <span className="text-indigo-300 font-semibold">{t.companyName}</span>
              </p>
              <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                Stage: {t.companyStage}
              </span>
            </div>
          </div>

          {/* Verified Telemetry Delta Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 font-mono text-xs space-y-1">
            <div className="text-slate-400 text-[10px] uppercase">VERIFIED PRODUCTION DELTA</div>
            <div className="text-xl font-extrabold text-emerald-400">{t.verifiedMetric.deltaValue}</div>
            <div className="text-[11px] text-slate-300">
              {t.verifiedMetric.label} · Recorded in {t.verifiedMetric.timeframe}
            </div>
          </div>

          {/* Quote */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 text-xs sm:text-sm text-slate-200 italic leading-relaxed">
            "{t.quote}"
          </div>

          {/* Blueprint Configuration Modules */}
          <div className="space-y-3">
            <h5 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Platform Modules Deployed:
            </h5>
            <div className="space-y-2">
              {t.blueprintUsed.map((module, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#06080F] border border-white/10 flex items-center justify-between text-xs font-mono"
                >
                  <span className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    {module}
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Specs */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 text-xs font-mono">
            <div className="text-[10px] text-slate-400 uppercase">SPECIFICATIONS</div>
            <div className="flex justify-between text-slate-300">
              <span>Traffic Shifting:</span>
              <span className="text-emerald-400">Blue/Green Canary (380ms)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Edge Regions:</span>
              <span>35 Anycast PoPs</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Compliance:</span>
              <span>SOC2 Type II + Automated KMS</span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-6 border-t border-white/10">
          <button
            onClick={() => {
              setIsBlueprintDrawerOpen(false);
              const cta = document.getElementById('instant-provision-dock');
              if (cta) cta.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
          >
            <span>Deploy This Exact Architecture</span>
            <Zap className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
