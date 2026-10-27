// ============================================================================
// New Deal Modal with Zero-Admin Instant Domain Auto-Enrichment
// Auto-populates company logo, headcount, industry & funding round with shimmer
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Plus, X, Sparkles, Building2, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { autoEnrichDomain, STAGE_CONFIG, STAGE_ORDER } from '../../utils/crmUtils';

export default function NewDealModal() {
  const { isNewDealModalOpen, setIsNewDealModalOpen, createNewDeal } = useCRM();

  const [domainInput, setDomainInput] = useState('');
  const [dealTitle, setDealTitle] = useState('');
  const [amount, setAmount] = useState('75000');
  const [stage, setStage] = useState('discovery');
  const [nextStepAction, setNextStepAction] = useState('Initial architecture & requirements alignment');
  const [nextStepDueDate, setNextStepDueDate] = useState(
    new Date(Date.now() + 3 * 86400 * 1000).toISOString().split('T')[0]
  );

  const [enrichedData, setEnrichedData] = useState(null);
  const [isEnriching, setIsEnriching] = useState(false);

  // Auto-enrich on typing domain with debounce
  useEffect(() => {
    if (!domainInput.includes('.')) {
      setEnrichedData(null);
      return;
    }

    setIsEnriching(true);
    const timer = setTimeout(() => {
      const data = autoEnrichDomain(domainInput);
      setEnrichedData(data);
      setIsEnriching(false);
      if (!dealTitle || dealTitle.endsWith('— Expansion')) {
        setDealTitle(`${data.name} — Core Platform License`);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [domainInput]);

  if (!isNewDealModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    createNewDeal({
      domain: domainInput,
      title: dealTitle || `${domainInput} — Expansion`,
      amount,
      stage,
      nextStepAction,
      nextStepDueDate
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark shadow-2xl p-6 space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Create New Opportunity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Zero-Admin capture: just type a domain to auto-enrich all firmographics
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewDealModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Domain Input with Instant Auto-Enrichment Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Company Domain / Work Email
            </label>
            <div className="relative">
              <input
                autoFocus
                type="text"
                required
                placeholder="e.g. anthropic.com or elena@linear.app"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/20 ${
                  isEnriching ? 'enrichment-shimmer' : ''
                }`}
              />
              {isEnriching && (
                <span className="absolute right-3 top-2.5 text-[10px] text-indigo-500 font-mono flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Auto-Enriching...
                </span>
              )}
            </div>

            {/* Enriched Pill Preview */}
            {enrichedData && !isEnriching && (
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{enrichedData.favicon}</span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      {enrichedData.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {enrichedData.industry} • {enrichedData.employee_range}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                  {enrichedData.enriched_metadata?.funding_round || 'Verified'}
                </span>
              </div>
            )}
          </div>

          {/* Deal Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Deal Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Anthropic — Distributed Inference Cluster"
              value={dealTitle}
              onChange={(e) => setDealTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 outline-hidden focus:border-brand"
            />
          </div>

          {/* ARR Value & Initial Stage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Contract ARR (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-6 pr-3 py-2 text-xs font-mono rounded-xl border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 outline-hidden focus:border-brand"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Initial Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 outline-hidden focus:border-brand"
              >
                {STAGE_ORDER.slice(0, 5).map(sKey => (
                  <option key={sKey} value={sKey}>
                    {STAGE_CONFIG[sKey].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stage-Gate Next Action */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Committed Next Action
            </label>
            <input
              type="text"
              required
              value={nextStepAction}
              onChange={(e) => setNextStepAction(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 outline-hidden focus:border-brand"
            />
          </div>

          {/* Follow-up Due Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Target Follow-Up Due Date
            </label>
            <input
              type="date"
              required
              value={nextStepDueDate}
              onChange={(e) => setNextStepDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 outline-hidden focus:border-brand"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsNewDealModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-brand hover:bg-brand-hover text-white shadow-xs transition-all active:scale-95"
            >
              <span>Create Deal & Auto-Enrich</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
