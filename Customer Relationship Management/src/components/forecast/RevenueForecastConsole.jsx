// ============================================================================
// Revenue Forecast Console & Interactive Deal Slippage Scenario Simulator
// Real-Time Quota Attainment Meter, Category Horizons & Flagship Deal Simulator
// ============================================================================

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Sliders, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  DollarSign
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { formatCurrency, STAGE_CONFIG } from '../../utils/crmUtils';

export default function RevenueForecastConsole() {
  const { deals, companies, forecastSlippages, toggleSlippage, setSelectedDealId } = useCRM();

  const quotaTargetCents = 120000000; // $1.2M

  // Base calculations
  const closedWonDeals = deals.filter(d => d.stage === 'closed_won');
  const closedWonCents = closedWonDeals.reduce((sum, d) => sum + d.amount_cents, 0);

  // Active pipeline deals
  const openDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost');

  // Calculate actual vs simulated values considering slipped deals
  let simulatedCommitCents = 0;
  let simulatedBestCaseCents = 0;
  let simulatedPipelineCents = 0;

  openDeals.forEach(deal => {
    const isSlipped = forecastSlippages[deal.id];
    if (isSlipped) return; // Slipped deals excluded from current quarter forecast

    const weighted = Math.round(deal.amount_cents * (deal.win_probability / 100));

    if (deal.stage === 'negotiation') {
      simulatedCommitCents += weighted;
    } else if (deal.stage === 'proposal') {
      simulatedBestCaseCents += weighted;
    } else {
      simulatedPipelineCents += weighted;
    }
  });

  const totalForecastCents = closedWonCents + simulatedCommitCents + simulatedBestCaseCents;
  const gapToQuotaCents = Math.max(0, quotaTargetCents - totalForecastCents);
  const quotaAttainmentPct = Math.min(100, Math.round((totalForecastCents / quotaTargetCents) * 100));

  const slippedCount = Object.values(forecastSlippages).filter(Boolean).length;
  const slippedAmountCents = openDeals
    .filter(d => forecastSlippages[d.id])
    .reduce((sum, d) => sum + d.amount_cents, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-canvas-light dark:bg-canvas-dark">
      {/* Top Banner: Forecast Attainment & Scenario Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quota Horizon Meter */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-brand dark:text-brand-dark flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Q4 Revenue Attainment Horizon
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target: {formatCurrency(quotaTargetCents)} • Real-time weighted confidence
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                {quotaAttainmentPct}%
              </span>
              <span className="text-[11px] block font-mono text-emerald-600 dark:text-emerald-400">
                {gapToQuotaCents === 0 ? '✓ Quota Fully Covered' : `${formatCurrency(gapToQuotaCents)} Gap to Target`}
              </span>
            </div>
          </div>

          {/* Stacked Horizon Multi-Layer Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
              {/* Closed Won Layer (Emerald) */}
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (closedWonCents / quotaTargetCents) * 100)}%` }}
                title={`Closed Won: ${formatCurrency(closedWonCents)}`}
              />
              {/* Commit Layer (Cobalt) */}
              <div
                className="h-full bg-cobalt-signal transition-all duration-300"
                style={{ width: `${Math.min(100, (simulatedCommitCents / quotaTargetCents) * 100)}%` }}
                title={`Commit: ${formatCurrency(simulatedCommitCents)}`}
              />
              {/* Best Case Layer (Violet) */}
              <div
                className="h-full bg-violet-signal transition-all duration-300"
                style={{ width: `${Math.min(100, (simulatedBestCaseCents / quotaTargetCents) * 100)}%` }}
                title={`Best Case: ${formatCurrency(simulatedBestCaseCents)}`}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs font-mono pt-1 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Won: {formatCurrency(closedWonCents, true)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cobalt-signal" />
                <span>Commit (90%): {formatCurrency(simulatedCommitCents, true)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-signal" />
                <span>Best Case (60%): {formatCurrency(simulatedBestCaseCents, true)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span>Pipeline (30%): {formatCurrency(simulatedPipelineCents, true)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Simulator Confidence Card */}
        <div className="p-5 rounded-2xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-brand" />
              Scenario Simulator Active
            </span>
            {slippedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                {slippedCount} deal{slippedCount > 1 ? 's' : ''} slipped
              </span>
            )}
          </div>

          <div className="py-2 space-y-1">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {formatCurrency(totalForecastCents)}
            </div>
            <p className="text-xs text-slate-500 leading-snug">
              {slippedCount > 0 
                ? `Simulating impact with ${formatCurrency(slippedAmountCents)} pushed into next quarter.`
                : 'All open enterprise opportunities are modeled on schedule for Q4 close.'}
            </p>
          </div>

          <div className="pt-2 border-t border-hairline-light dark:border-hairline-dark flex items-center justify-between text-xs">
            <span className="text-slate-400">Coverage Ratio:</span>
            <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
              {(totalForecastCents / quotaTargetCents).toFixed(2)}x
            </span>
          </div>
        </div>
      </div>

      {/* Flagship Deal Slippage Simulator Table */}
      <div className="rounded-2xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-hairline-light dark:border-hairline-dark flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Flagship Deals • Slippage Impact Simulator
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Toggle deals to simulate what happens if procurement or contract negotiations slip past quarter-end
            </p>
          </div>
          <span className="text-xs text-indigo-500 font-medium">
            Interactive Sliders
          </span>
        </div>

        <div className="divide-y divide-hairline-light dark:divide-hairline-dark text-xs">
          {openDeals.map((deal) => {
            const company = companies.find(c => c.id === deal.company_id);
            const isSlipped = forecastSlippages[deal.id];

            return (
              <div
                key={deal.id}
                className={`px-5 py-3 flex items-center justify-between gap-4 transition-colors ${
                  isSlipped ? 'bg-amber-500/[0.04]' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
              >
                {/* Deal & Company Info */}
                <div 
                  onClick={() => setSelectedDealId(deal.id)}
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                >
                  <span className="text-base">{company?.favicon || '🏢'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {company?.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {deal.deal_code}
                      </span>
                      <span className="px-2 py-0.2 rounded-full font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {STAGE_CONFIG[deal.stage]?.label}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-md">
                      {deal.title}
                    </p>
                  </div>
                </div>

                {/* Amount & Weighted Value */}
                <div className="flex items-center gap-6 text-right shrink-0">
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums block">
                      {formatCurrency(deal.amount_cents)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Weighted: {formatCurrency(Math.round(deal.amount_cents * (deal.win_probability / 100)))}
                    </span>
                  </div>

                  {/* Simulator Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium ${isSlipped ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                      {isSlipped ? 'Slipped to Q1' : 'Closing Q4'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSlippage(deal.id)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        isSlipped ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isSlipped ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
