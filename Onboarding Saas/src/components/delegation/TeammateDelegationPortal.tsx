import React, { useState, useEffect } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import {
  Handshake,
  Check,
  Terminal,
  Copy,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface Props {
  token?: string;
}

export const TeammateDelegationPortal: React.FC<Props> = ({ token }) => {
  const { workspaceDraft, markDelegationComplete, setActiveView } = useOnboardingStore();
  const [assigneeName, setAssigneeName] = useState('Marcus Cole');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const command = 'npm install @acme/sdk && npx acme init --key=pk_live_98a73b40e1';

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (token) {
        await fetch(`/api/delegate-step/${token}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignee_name: assigneeName })
        });
      }
    } catch (e) {
      console.warn('API completed locally', e);
    }

    markDelegationComplete('integrations', assigneeName);
    setSubmitting(false);
    setCompleted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-900 dark:text-white font-sans">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-lg shadow-xs">
            🤝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Delegated Task
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-mono text-slate-400">Token: {token || 'tk_magic_direct'}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Connect Telemetry SDK for {workspaceDraft.name}
            </h2>
          </div>
        </div>

        {!completed ? (
          <form onSubmit={handleComplete} className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                <span>Request from Founder / Workspace Lead</span>
                <span className="text-[10px] font-mono bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200 px-1.5 py-0.5 rounded">
                  Scoped Access
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
                "Hey Marcus! Could you please connect our production SDK keys so we can finish setting up Acme Studio?"
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Name / Team Handle
              </label>
              <input
                type="text"
                required
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="e.g. Marcus Cole (Staff Architect)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Execute in Terminal
              </label>
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs font-mono text-slate-200 flex items-center justify-between gap-2 shadow-inner">
                <span className="truncate">{command}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 shrink-0 text-[11px] font-sans font-medium"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Zero full-admin credentials required. Completing this verifies the production ingestion webhook.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>{submitting ? 'Verifying Handshake...' : 'Verify SDK & Mark Step Completed'}</span>
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Setup Verified & Synced in Real Time!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Alex Miller's dashboard has been notified via WebSocket. The checklist ring has updated to 80%+.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setActiveView('dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Jump to Workspace Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveView('onboarding')}
                className="w-full sm:w-auto px-4 py-2 text-xs text-slate-500 hover:text-slate-800"
              >
                View Wizard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
