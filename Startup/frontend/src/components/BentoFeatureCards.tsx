import React, { useState } from 'react';
import { useMarketingStore } from '../store/marketingStore.js';
import { CLIENT_BENTO_FEATURES } from '../data/clientData.js';
import {
  Terminal,
  Activity,
  ShieldCheck,
  Zap,
  Globe,
  Sliders,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export const BentoFeatureCards: React.FC = () => {
  const { activePersonaLens, incrementSandboxAction } = useMarketingStore();
  const [canaryRate, setCanaryRate] = useState(15);
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [keyHash, setKeyHash] = useState('kms-256-a9f4e2b8109c');

  // Spotlight mouse tracking on each card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleKeyRotate = () => {
    setIsRotatingKey(true);
    incrementSandboxAction();
    setTimeout(() => {
      setKeyHash(`kms-256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`);
      setIsRotatingKey(false);
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {CLIENT_BENTO_FEATURES.map((feature) => {
        const personaData = feature.personaCopy[activePersonaLens];
        const isWide = feature.gridSpan === 'col-span-2';

        return (
          <div
            key={feature.id}
            onMouseMove={handleMouseMove}
            className={`bento-card card-spotlight p-6 sm:p-7 flex flex-col justify-between ${
              isWide ? 'lg:col-span-2' : 'lg:col-span-1'
            }`}
          >
            {/* Top Badge & Metric Callout */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium">
                  {feature.badgeText}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  {personaData.metricCallout}
                </span>
              </div>

              {/* Title & Persona Copy */}
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {feature.title}
                </h4>
                <p className="text-sm font-semibold text-indigo-300 mt-2">
                  {personaData.headline}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                  {personaData.description}
                </p>
              </div>
            </div>

            {/* Live Interactive Micro-Widget inside each Bento bay */}
            <div className="mt-6 pt-5 border-t border-white/10">
              {/* Widget 1: Live Terminal */}
              {feature.interactiveWidgetType === 'live-terminal' && (
                <div className="rounded-xl bg-[#06080F] border border-white/10 p-3.5 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] pb-1 border-b border-white/5">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" /> CLI Sandbox
                    </span>
                    <span className="text-emerald-400">⚡ Provisioned in 2.8s</span>
                  </div>
                  <div className="text-slate-300 space-y-1 text-[11px]">
                    <div className="text-indigo-400 font-semibold">$ acme branch create --db-fork</div>
                    <div className="text-slate-400">→ Forked PostgreSQL snapshot in 180ms</div>
                    <div className="text-emerald-400">✓ Isolated URL: https://pr-412.preview.acme.dev</div>
                  </div>
                </div>
              )}

              {/* Widget 2: Latency Chart */}
              {feature.interactiveWidgetType === 'latency-chart' && (
                <div className="rounded-xl bg-[#06080F] border border-white/10 p-3.5 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Activity className="w-3.5 h-3.5" /> Anycast P99
                    </span>
                    <span className="text-emerald-400 font-bold">11.4ms</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>SFO-1</span>
                      <span className="text-emerald-400">7.9ms</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full w-[25%]" />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>LHR-1</span>
                      <span className="text-emerald-400">11.8ms</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-cyan-500 h-1.5 rounded-full w-[38%]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Widget 3: Workflow Canary Toggle */}
              {feature.interactiveWidgetType === 'workflow-toggle' && (
                <div className="rounded-xl bg-[#06080F] border border-white/10 p-3.5 font-mono text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Zap className="w-3.5 h-3.5" /> Canary Shifting
                    </span>
                    <span className="text-white font-bold">{canaryRate}% Traffic</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={canaryRate}
                    onChange={(e) => {
                      setCanaryRate(Number(e.target.value));
                      incrementSandboxAction();
                    }}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Healthy (0.00% 5xx)</span>
                    <span className="text-emerald-400">Auto-Rollback Ready</span>
                  </div>
                </div>
              )}

              {/* Widget 4: Security Vault */}
              {feature.interactiveWidgetType === 'security-vault' && (
                <div className="rounded-xl bg-[#06080F] border border-white/10 p-3.5 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-1 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" /> Active AES-256 Hardware Key
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[280px]">
                      {keyHash}
                    </div>
                  </div>
                  <button
                    onClick={handleKeyRotate}
                    disabled={isRotatingKey}
                    className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isRotatingKey ? 'Rotating...' : 'Rotate Key Now'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
