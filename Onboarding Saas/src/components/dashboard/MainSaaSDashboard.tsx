import React, { useState } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { DashboardActivationWidget } from '../dock/DashboardActivationWidget';
import {
  LayoutDashboard,
  GitBranch,
  Activity,
  Zap,
  Users,
  Settings,
  Search,
  Bell,
  FlaskConical,
  Trash2,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  BarChart3,
  ExternalLink,
  ChevronDown,
  X,
  Code2
} from 'lucide-react';

export const MainSaaSDashboard: React.FC = () => {
  const {
    workspaceDraft,
    isSampleDataActive,
    purgeSampleData,
    guidedTourActive,
    tourTargetElement,
    dismissGuidedTour,
    toggleMilestone,
    setActiveView,
    rolePersona
  } = useOnboardingStore();

  const [activeNav, setActiveNav] = useState('overview');
  const [createdRuleModal, setCreatedRuleModal] = useState(false);

  const brandColor = workspaceDraft.brandColor || '#4F46E5';

  const handleCreateRule = () => {
    if (guidedTourActive) {
      toggleMilestone('first_rule');
      dismissGuidedTour();
    }
    setCreatedRuleModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative text-slate-900 dark:text-slate-100 font-sans">
      {/* 1. Pinned Sample Data Purge Bar (when active) */}
      {isSampleDataActive && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-medium flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-slate-950" />
            <span>
              <strong>Sample Data Mode Active:</strong> Currently exploring with 24 demo pipelines, telemetry records, and webhooks.
            </span>
          </div>
          <button
            onClick={() => purgeSampleData()}
            className="px-3 py-1 bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 font-semibold text-[11px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Sample Data & Start Fresh</span>
          </button>
        </div>
      )}

      {/* 2. Top Navigation Bar */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between z-20">
        {/* Left: Workspace Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs"
              style={{ backgroundColor: brandColor }}
            >
              {workspaceDraft.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
                <span>{workspaceDraft.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                acme.app/{workspaceDraft.slug}
              </div>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Trial countdown badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] font-mono font-semibold text-indigo-700 dark:text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>⏱ {workspaceDraft.trialDaysLeft} Days Left in Pro Trial</span>
          </div>
        </div>

        {/* Center: Quick search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-400 w-72 justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search telemetry, pipelines, team...</span>
          </div>
          <span className="font-mono text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('onboarding')}
            className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ← Back to Wizard
          </button>

          <button
            onClick={() => setActiveView('admin')}
            className="text-xs font-semibold text-white bg-slate-800 dark:bg-slate-700 px-3 py-1.5 rounded-lg hover:opacity-90 flex items-center gap-1.5 transition-opacity"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Growth Cockpit</span>
          </button>

          <div
            className="w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center shadow-xs"
            style={{ backgroundColor: brandColor }}
          >
            {workspaceDraft.name.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </header>

      {/* 3. Dashboard Body (Sidebar + Content Stage) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="space-y-1 text-xs font-medium">
              <button
                onClick={() => setActiveNav('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                  activeNav === 'overview'
                    ? 'bg-brand-custom text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview & Health</span>
              </button>

              <button
                onClick={() => setActiveNav('pipelines')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                  activeNav === 'pipelines'
                    ? 'bg-brand-custom text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span>Pipelines & CI/CD</span>
              </button>

              <button
                onClick={() => setActiveNav('automations')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                  activeNav === 'automations'
                    ? 'bg-brand-custom text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Automation Rules</span>
              </button>

              <button
                onClick={() => setActiveNav('team')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                  activeNav === 'team'
                    ? 'bg-brand-custom text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team & Collaborators</span>
              </button>

              <button
                onClick={() => setActiveNav('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                  activeNav === 'settings'
                    ? 'bg-brand-custom text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Workspace Settings</span>
              </button>
            </div>
          </div>

          {/* Connected integrations quick status */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              Active Integrations
            </span>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Slack Alerts</span>
              <span className="text-emerald-600 font-mono">Live</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>SDK Ingestion</span>
              <span className="text-emerald-600 font-mono">35ms</span>
            </div>
          </div>
        </aside>

        {/* Main View Area */}
        <main className="flex-1 p-8 overflow-y-auto space-y-6">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                {workspaceDraft.name} Dashboard
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Customized for {rolePersona || 'Software Engineering'} • Time-to-First-Value achieved in 68 seconds.
              </p>
            </div>

            {/* Quick Action Buttons (One of which is spotlighted during guided tour!) */}
            <div className="flex items-center gap-3">
              <button
                id="sdk-config-btn"
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  tourTargetElement === 'sdk-config-btn'
                    ? 'ring-4 ring-brand-custom border-brand-custom animate-pulse-glow bg-brand-light text-slate-900'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>SDK Config</span>
              </button>

              <button
                id="new-automation-btn"
                onClick={handleCreateRule}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-custom hover:opacity-90 flex items-center gap-2 shadow-xs transition-all ${
                  tourTargetElement === 'new-automation-btn'
                    ? 'ring-4 ring-offset-2 ring-brand-custom animate-pulse-glow'
                    : ''
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Automation Rule</span>
              </button>
            </div>
          </div>

          {/* Guided Tour Spotlight Banner */}
          {guidedTourActive && (
            <div className="p-4 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-custom animate-bounce" />
                <span>
                  <strong>Interactive Guided Tour:</strong> Click <strong>"Create Automation Rule"</strong> highlighted above to complete your final activation milestone!
                </span>
              </div>
              <button
                onClick={dismissGuidedTour}
                className="hover:underline text-[11px] font-mono text-indigo-600 dark:text-indigo-400"
              >
                Dismiss Tour
              </button>
            </div>
          )}

          {/* Key Metric Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Production p99 Latency</span>
                <Cpu className="w-4 h-4 text-brand-custom" />
              </div>
              <div className="text-2xl font-bold font-mono font-tabular text-slate-900 dark:text-white">
                48.2ms
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                ↓ 12ms faster than SLA
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>CI/CD Pipeline Success</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono font-tabular text-slate-900 dark:text-white">
                99.4%
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                24 builds verified today
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Annual Run-Rate (ARR)</span>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold font-mono font-tabular text-slate-900 dark:text-white">
                $1,428,900
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                +18.4% Net Expansion
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Active Automations</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono font-tabular text-slate-900 dark:text-white">
                18 Rules
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                1,420 events routed / hr
              </div>
            </div>
          </div>

          {/* Telemetry Stream & Pipeline Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Real-Time Event Stream
                </h3>
                <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Listening via WebSocket
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>POST /api/v1/telemetry [200 OK]</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">35ms • us-east-1</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>GitHub Webhook: PR #492 Merged</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">2m ago</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Slack Bot: Alert dispatched to #product-alerts</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">4m ago</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Collaborator Roster & Delegations
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  Domain: {workspaceDraft.domain}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
                      AL
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Alex Miller (You)</div>
                      <div className="text-[10px] text-slate-400 font-mono">Owner • Admin</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-[11px]">
                      MC
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Marcus Cole</div>
                      <div className="text-[10px] text-slate-400 font-mono">Staff Architect • Technical Setup</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 px-2 py-0.5 rounded-full">
                    🤝 Delegated Lead
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 4. Persistent Post-Setup In-App Activation Dock */}
      <DashboardActivationWidget />

      {/* Automation Rule Creation Modal (Interactive feedback) */}
      {createdRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                New Automation Rule Created!
              </h3>
              <button
                onClick={() => setCreatedRuleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Rule <strong>"Notify #product-alerts when p99 latency &gt; 80ms"</strong> has been registered and deployed.
            </p>
            <button
              onClick={() => setCreatedRuleModal(false)}
              className="w-full py-2 bg-brand-custom text-white text-xs font-semibold rounded-xl"
            >
              Great, return to dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
