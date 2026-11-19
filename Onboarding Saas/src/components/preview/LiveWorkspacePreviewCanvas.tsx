import React, { useState } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import {
  Activity,
  Terminal,
  GitBranch,
  Layers,
  Users,
  LineChart,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Search,
  Bell,
  Sparkles,
  FlaskConical,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Database
} from 'lucide-react';

export const LiveWorkspacePreviewCanvas: React.FC = () => {
  const { workspaceDraft, rolePersona, isSampleDataActive } = useOnboardingStore();
  const [activeTab, setActiveTab] = useState<'metrics' | 'pipeline' | 'activity'>('metrics');

  const brandColor = workspaceDraft.brandColor || '#4F46E5';

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative">
      {/* Top Floating Glassmorphic Indicator Pill */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 mb-4 shadow-xs select-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-slate-700 dark:text-slate-300">
          LIVE WORKSPACE PREVIEW — acme.app/<strong className="text-slate-900 dark:text-white font-semibold">{workspaceDraft.slug || 'studio'}</strong>
        </span>
      </div>

      {/* Miniature SaaS Application Frame */}
      <div className="w-full max-w-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all duration-300 flex flex-col min-h-[520px]">
        {/* Window Titlebar */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>

          {/* Search bar simulation */}
          <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-400 w-52 justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Search className="w-3 h-3 text-slate-400" />
              <span className="truncate">{workspaceDraft.name}</span>
            </div>
            <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-700 px-1 rounded">⌘K</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 text-slate-400">
            <Bell className="w-3.5 h-3.5" />
            <div
              className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ backgroundColor: brandColor }}
            >
              {workspaceDraft.name.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Application Body: Mini Sidebar + Dynamic Content Canvas */}
        <div className="flex-1 flex overflow-hidden">
          {/* Mini Sidebar */}
          <div className="w-36 bg-slate-50/50 dark:bg-slate-950/40 border-r border-slate-100 dark:border-slate-800/80 p-3 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              {/* Workspace Badge */}
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold shadow-2xs"
                  style={{ backgroundColor: brandColor }}
                >
                  {workspaceDraft.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {workspaceDraft.name}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">Pro Trial</div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <div
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-white transition-colors"
                  style={{ backgroundColor: brandColor }}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </div>

                <div className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Pipelines</span>
                </div>

                <div className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Automations</span>
                </div>

                <div className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Team</span>
                </div>
              </div>
            </div>

            {/* Trial badge */}
            <div className="p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-[10px] text-indigo-900 dark:text-indigo-200">
              <span className="font-semibold block">14d Pro Trial</span>
              <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono">Full Access</span>
            </div>
          </div>

          {/* Main Stage Content */}
          <div className="flex-1 p-4 bg-white dark:bg-slate-900 overflow-y-auto space-y-4">
            {/* Sample Data Banner Overlay */}
            {isSampleDataActive && (
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200 animate-in fade-in">
                <span className="flex items-center gap-1.5 font-medium">
                  <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                  Realistic sample data loaded
                </span>
                <span className="text-[9px] font-mono bg-amber-200/60 dark:bg-amber-900/60 px-1 rounded">
                  1-Click Removable
                </span>
              </div>
            )}

            {/* Role Responsive Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {rolePersona === 'founder' && 'Executive Performance & ARR'}
                  {rolePersona === 'engineering' && 'Service Health & Telemetry'}
                  {rolePersona === 'product' && 'Delivery Roadmap & Features'}
                  {rolePersona === 'operations' && 'Revenue Ops & Billing Velocity'}
                  {!rolePersona && 'Platform Overview'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Real-time pipeline state for <strong className="text-slate-700 dark:text-slate-300">{workspaceDraft.domain || 'acme.inc'}</strong>
                </p>
              </div>

              {/* Status pill */}
              <span className="text-[10px] font-mono font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Handshake
              </span>
            </div>

            {/* Dynamic Metric Cards based on Role */}
            <div className="grid grid-cols-2 gap-2.5">
              {rolePersona === 'engineering' && (
                <>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>API Latency (p99)</span>
                      <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-base font-bold font-mono font-tabular text-slate-900 dark:text-white mt-1">
                      48ms
                    </div>
                    <div className="text-[10px] font-medium text-emerald-600 mt-0.5">
                      -12ms vs benchmark
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>CI Build Health</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-base font-bold font-mono font-tabular text-slate-900 dark:text-white mt-1">
                      99.4%
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                      18 deploys today
                    </div>
                  </div>
                </>
              )}

              {rolePersona === 'founder' && (
                <>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Annual Run-Rate</span>
                      <TrendingUp className="w-3.5 h-3.5 text-brand-custom" />
                    </div>
                    <div className="text-base font-bold font-mono font-tabular text-slate-900 dark:text-white mt-1">
                      $1,428,900
                    </div>
                    <div className="text-[10px] font-medium text-emerald-600 mt-0.5">
                      +18.4% MoM
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Runway / Reserves</span>
                      <LineChart className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-base font-bold font-mono font-tabular text-slate-900 dark:text-white mt-1">
                      24.8 Mo
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                      Cash positive
                    </div>
                  </div>
                </>
              )}

              {rolePersona === 'product' && (
                <>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Sprint Velocity</span>
                      <Zap className="w-3.5 h-3.5 text-brand-custom" />
                    </div>
                    <div className="text-base font-bold font-mono font-tabular text-slate-900 dark:text-white mt-1">
                      42 Pts
                    </div>
                    <div className="text-[10px] font-medium text-emerald-600 mt-0.5">
                      94% commitment met
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Figma Components</span>
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-base font-bold font-mono font-tabular text-slate-900 dark:text-white mt-1">
                      124 Tokens
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                      Synced via Design System
                    </div>
                  </div>
                </>
              )}

              {rolePersona === 'operations' && (
                <>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Dispute Ratio</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-base font-bold font-mono font-tabular text-slate-900 dark:text-white mt-1">
                      0.042%
                    </div>
                    <div className="text-[10px] font-medium text-emerald-600 mt-0.5">
                      Top tier risk score
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Active Workflows</span>
                      <Zap className="w-3.5 h-3.5 text-brand-custom" />
                    </div>
                    <div className="text-base font-bold font-mono font-tabular text-slate-900 dark:text-white mt-1">
                      18 Rules
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                      1.4k executions / day
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Interactive Event Feed */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Recent Telemetry Stream
                </span>
                <span className="text-[10px] font-mono text-slate-400">100% Synced</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {rolePersona === 'engineering' && 'POST /api/v1/telemetry [200 OK]'}
                      {rolePersona === 'founder' && 'Stripe Invoice #8912 Paid ($4,200)'}
                      {rolePersona === 'product' && 'PR #492 Merged into production'}
                      {rolePersona === 'operations' && 'Payout Batch #401 Settled via ACH'}
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[10px]">12s ago</span>
                </div>

                <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      Slack #product-alerts notification dispatched
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[10px]">45s ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
