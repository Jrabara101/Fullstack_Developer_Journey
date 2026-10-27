// ============================================================================
// Stage-Gate "Next Step" Enforcement Micro-Dialog
// Prevents pipeline decay by enforcing explicit next action & due date
// ============================================================================

import React, { useState } from 'react';
import { ShieldCheck, Calendar, ArrowRight, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { STAGE_CONFIG, formatCurrency } from '../../utils/crmUtils';

export default function StageGateModal() {
  const { stageGatePending, setStageGatePending, deals, executeStageTransition } = useCRM();

  if (!stageGatePending) return null;

  const { dealId, targetStage, currentNextStep, currentDueDate, currentProbability } = stageGatePending;
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return null;

  const [nextStepAction, setNextStepAction] = useState(currentNextStep || '');
  const [nextStepDueDate, setNextStepDueDate] = useState(
    currentDueDate || new Date(Date.now() + 3 * 86400 * 1000).toISOString().split('T')[0]
  );
  const [probability, setProbability] = useState(
    currentProbability || STAGE_CONFIG[targetStage]?.defaultProbability || 60
  );

  const setPresetDate = (daysToAdd) => {
    const target = new Date(Date.now() + daysToAdd * 86400 * 1000);
    setNextStepDueDate(target.toISOString().split('T')[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nextStepAction.trim()) return;

    executeStageTransition(dealId, targetStage, nextStepAction, nextStepDueDate, Number(probability));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark shadow-2xl p-6 space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Stage-Gate: Guard Deal Momentum
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Advancing <strong className="text-slate-800 dark:text-slate-200">"{deal.title}"</strong> to{' '}
                <span className="text-brand dark:text-brand-dark font-semibold">
                  {STAGE_CONFIG[targetStage]?.label}
                </span>{' '}
                ({formatCurrency(deal.amount_cents)})
              </p>
            </div>
          </div>

          <button
            onClick={() => setStageGatePending(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Alert */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-hairline-light dark:border-hairline-dark text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          💡 <span className="font-semibold text-slate-800 dark:text-slate-200">Zero-Rot Guardrail:</span> Every active pipeline transition requires a committed next milestone so deals never stall in silence.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              What is the concrete next action to advance this deal?
            </label>
            <input
              autoFocus
              type="text"
              required
              placeholder="e.g. Follow up on pricing tier breakdown with @elena"
              value={nextStepAction}
              onChange={(e) => setNextStepAction(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Quick Date Presets & Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Target Follow-Up Due Date
            </label>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => setPresetDate(1)}
                className="px-2.5 py-1 text-[11px] rounded-lg border border-hairline-light dark:border-hairline-dark bg-surface-light dark:bg-surface-dark hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setPresetDate(3)}
                className="px-2.5 py-1 text-[11px] rounded-lg border border-hairline-light dark:border-hairline-dark bg-surface-light dark:bg-surface-dark hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => setPresetDate(7)}
                className="px-2.5 py-1 text-[11px] rounded-lg border border-hairline-light dark:border-hairline-dark bg-surface-light dark:bg-surface-dark hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Next Week
              </button>
            </div>

            <input
              type="date"
              required
              value={nextStepDueDate}
              onChange={(e) => setNextStepDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 outline-hidden focus:border-brand"
            />
          </div>

          {/* Probability Override Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Win Probability Adjustment
              </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {probability}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              step="5"
              value={probability}
              onChange={(e) => setProbability(e.target.value)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setStageGatePending(null)}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-brand hover:bg-brand-hover text-white shadow-xs transition-all active:scale-95"
            >
              <span>Lock Next Step & Move Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
