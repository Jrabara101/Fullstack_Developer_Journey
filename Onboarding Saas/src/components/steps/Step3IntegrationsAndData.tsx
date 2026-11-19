import React, { useState } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { DelegateStepModal } from './DelegateStepModal';
import {
  GitBranch,
  Copy,
  Check,
  Radio,
  Handshake,
  Zap,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

const SlackGlyph: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path d="M6 15a2.5 2.5 0 0 1-2.5-2.5v-2A2.5 2.5 0 0 1 6 8h2v4.5A2.5 2.5 0 0 1 6 15z" fill="#E01E5A"/>
    <path d="M8.5 6A2.5 2.5 0 0 1 11 3.5h2A2.5 2.5 0 0 1 15.5 6v2H11A2.5 2.5 0 0 1 8.5 6z" fill="#36C5F0"/>
    <path d="M18 8.5A2.5 2.5 0 0 1 20.5 11v2a2.5 2.5 0 0 1-2.5 2.5h-2V11a2.5 2.5 0 0 1 2.5-2.5z" fill="#2EB67D"/>
    <path d="M15.5 18a2.5 2.5 0 0 1-2.5 2.5h-2A2.5 2.5 0 0 1 8.5 18v-2h4.5a2.5 2.5 0 0 1 2.5 2.5z" fill="#ECB22E"/>
  </svg>
);

export const Step3IntegrationsAndData: React.FC = () => {
  const {
    delegatedSteps,
    markDelegationComplete,
    rolePersona,
    completeCurrentStep
  } = useOnboardingStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [simulatedPing, setSimulatedPing] = useState(false);
  const [slackConnected, setSlackConnected] = useState(true);

  const sdkCommand = 'npm install @acme/sdk && npx acme init --key=pk_live_98a73b40e1';

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(sdkCommand);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSimulatePing = () => {
    setSimulatedPing(true);
    setTimeout(() => {
      markDelegationComplete('integrations', 'Telemetry Worker');
    }, 1200);
  };

  const currentDelegation = delegatedSteps['integrations'];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          Connect your telemetry & data pipeline
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Stream real-time events into your workspace. Technical steps can be completed now or delegated to your engineering team.
        </p>
      </div>

      {/* Integration 1: Slack Notifications (Ready/Connected) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 p-2">
              <SlackGlyph className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Slack Notification Bridge
                </span>
                {slackConnected && (
                  <span className="text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Connected to #product-alerts
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Delivers instant deployment, spike anomaly, and conversion pings to your team.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSlackConnected(!slackConnected)}
            className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 self-start sm:self-auto"
          >
            {slackConnected ? 'Configure Channels' : 'Connect Slack'}
          </button>
        </div>
      </div>

      {/* Integration 2: Production SDK & Event Listener */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4.5 space-y-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-brand-custom flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Install Telemetry Snippet or Connect Database
                </h3>
                <span className="text-[10px] font-mono font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                  ⚡ High Impact
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paste this one-line CLI initialization command into your codebase terminal.
              </p>
            </div>
          </div>
        </div>

        {/* Copyable Code Snippet Box */}
        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-xs font-mono text-slate-200 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            <span className="text-emerald-400 select-none">$</span>
            <span className="whitespace-nowrap">{sdkCommand}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyCommand}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-medium flex items-center gap-1.5 shrink-0 transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Live Listener & Simulation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
              {simulatedPing ? '✓ Telemetry handshake verified! (35ms)' : '📡 Waiting for first event ping...'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSimulatePing}
            disabled={simulatedPing}
            className="text-[11px] font-medium text-brand-custom hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <Zap className="w-3 h-3" />
            <span>{simulatedPing ? 'Event Received!' : 'Test / Simulate Ping'}</span>
          </button>
        </div>
      </div>

      {/* Prominent "Ask a Teammate" Delegation Callout Card */}
      {!currentDelegation ? (
        <div className="rounded-xl border border-violet-500/30 bg-violet-50/60 dark:bg-violet-950/20 p-4 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-violet-950 dark:text-violet-200">
                  Not the person who manages code or production databases?
                </h4>
                <p className="text-xs text-violet-800/80 dark:text-violet-300/80 mt-0.5 leading-relaxed">
                  Send a scoped magic link to an engineer. They can complete just this step without full admin access, and you can jump straight into your workspace now.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-colors"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Ask a Teammate</span>
            </button>
          </div>
        </div>
      ) : (
        /* Delegated Active Banner */
        <div className="rounded-xl border border-violet-300 dark:border-violet-800 bg-violet-50/90 dark:bg-violet-950/40 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-200 dark:bg-violet-900 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold text-xs">
                🤝
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-violet-900 dark:text-violet-200">
                    Step Delegated to {currentDelegation.email}
                  </span>
                  <span className="text-[10px] font-mono bg-violet-200 dark:bg-violet-900 text-violet-800 dark:text-violet-200 px-1.5 py-0.2 rounded">
                    {currentDelegation.status === 'completed' ? '✓ Completed' : 'Pending Teammate'}
                  </span>
                </div>
                <p className="text-xs text-violet-700 dark:text-violet-300 mt-0.5">
                  Magic link active. You can safely proceed to the next step while they complete setup.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/?view=delegate&token=${currentDelegation.token}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-violet-700 dark:text-violet-300 hover:underline flex items-center gap-1 font-medium px-2 py-1"
              >
                <span>Simulate Teammate</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={completeCurrentStep}
                className="text-xs font-semibold text-white bg-brand-custom px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1"
              >
                <span>Continue →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delegation Modal */}
      <DelegateStepModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
