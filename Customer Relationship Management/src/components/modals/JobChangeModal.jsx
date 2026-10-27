// ============================================================================
// Job-Change Radar & Smart Duplicate Merger Modal
// Turns champion transitions into instant pipeline expansion opportunities
// ============================================================================

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  Briefcase, 
  Check, 
  Send, 
  Copy, 
  Merge,
  Building2
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export default function JobChangeModal() {
  const {
    isJobChangeModalOpen,
    setIsJobChangeModalOpen,
    jobChangeAlerts,
    createNewDeal,
    dismissJobChange,
    setSelectedDealId
  } = useCRM();

  const [activeTab, setActiveTab] = useState('job_changes'); // 'job_changes' | 'duplicates'
  const [createdSuccess, setCreatedSuccess] = useState(false);

  if (!isJobChangeModalOpen) return null;

  const alert = jobChangeAlerts[0];

  const handleCreateExpansionDeal = () => {
    if (!alert) return;

    createNewDeal({
      domain: 'openai.com',
      title: 'OpenAI — Enterprise Foundation Model Telemetry Tier',
      amount: '120000',
      stage: 'discovery',
      nextStepAction: `Introductory sync with Sarah Jenkins (VP Product, ex-Vercel champion)`,
      nextStepDueDate: new Date(Date.now() + 2 * 86400 * 1000).toISOString().split('T')[0]
    });

    setCreatedSuccess(true);
    setTimeout(() => {
      dismissJobChange(alert.id);
      setIsJobChangeModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark shadow-2xl p-6 space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-brand dark:text-brand-dark border border-indigo-500/20 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Network Intelligence Radar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Passive harvesting flags executive movements & duplicate account records
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsJobChangeModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-hairline-light dark:border-hairline-dark pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('job_changes')}
            className={`pb-1 transition-colors ${
              activeTab === 'job_changes'
                ? 'text-brand dark:text-brand-dark border-b-2 border-brand'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Champion Job Changes ({jobChangeAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`pb-1 transition-colors ${
              activeTab === 'duplicates'
                ? 'text-brand dark:text-brand-dark border-b-2 border-brand'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Smart Deduplication (1 Pair)
          </button>
        </div>

        {activeTab === 'job_changes' ? (
          alert ? (
            <div className="space-y-4 text-xs">
              {/* Alert card */}
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={alert.avatar_url}
                      alt={alert.contact_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {alert.contact_name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <span className="line-through">{alert.previous_company}</span>
                        <ArrowRight className="w-3 h-3 text-indigo-500" />
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{alert.new_company}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {alert.impact_level}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-elevated-light dark:bg-surface-elevated-dark border border-hairline-light dark:border-hairline-dark text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    New Title: <span className="font-bold">{alert.new_title}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {alert.summary}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => dismissJobChange(alert.id)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Dismiss
                </button>

                <button
                  onClick={handleCreateExpansionDeal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-brand hover:bg-brand-hover text-white shadow-xs transition-all active:scale-95"
                >
                  {createdSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Opportunity Created!</span>
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-4 h-4" />
                      <span>1-Click Launch OpenAI Expansion Deal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No active job changes detected. All champions current.
            </div>
          )
        ) : (
          /* Deduplication tab */
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl border border-hairline-light dark:border-hairline-dark bg-slate-50 dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Potential Duplicate Account Detected
                </span>
                <span className="text-[10px] font-mono text-indigo-500">98% Match</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Record <strong>"Stripe Inc"</strong> (stripe.com) shares 100% domain overlap and identical tax ID with <strong>"Stripe Core"</strong>.
              </p>
              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => alert('Records merged successfully! All historical interactions preserved.')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs"
                >
                  <Merge className="w-3.5 h-3.5" />
                  <span>Merge Records Safely</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
