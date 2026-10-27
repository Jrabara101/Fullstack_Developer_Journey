// ============================================================================
// Multi-Column High-Velocity Kanban Pipeline Board
// Live Column Header Financial Rollups, DND & Stage-Gate Triggering
// ============================================================================

import React, { useState } from 'react';
import { Plus, MoreHorizontal, AlertCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import DealCard from './DealCard';
import { STAGE_CONFIG, STAGE_ORDER, formatCurrency } from '../../utils/crmUtils';

export default function KanbanBoard() {
  const {
    deals,
    companies,
    contacts,
    searchQuery,
    attemptMoveDealStage,
    setIsNewDealModalOpen
  } = useCRM();

  const [draggingDealId, setDraggingDealId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Filter deals based on search query
  const filteredDeals = deals.filter(deal => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const company = companies.find(c => c.id === deal.company_id);
    return (
      deal.title.toLowerCase().includes(q) ||
      deal.deal_code.toLowerCase().includes(q) ||
      company?.name.toLowerCase().includes(q)
    );
  });

  const handleDragStart = (e, dealId) => {
    setDraggingDealId(dealId);
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e, stage) => {
    e.preventDefault();
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain') || draggingDealId;
    setDraggingDealId(null);
    setDragOverStage(null);

    if (dealId) {
      attemptMoveDealStage(dealId, targetStage);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-canvas-light dark:bg-canvas-dark">
      <div className="flex items-start gap-4 min-w-max pb-4 h-full">
        {STAGE_ORDER.map((stageKey) => {
          const config = STAGE_CONFIG[stageKey];
          const stageDeals = filteredDeals.filter(d => d.stage === stageKey);

          // Calculate column totals
          const columnTotalCents = stageDeals.reduce((sum, d) => sum + d.amount_cents, 0);
          const columnWeightedCents = stageDeals.reduce(
            (sum, d) => sum + Math.round(d.amount_cents * (d.win_probability / 100)),
            0
          );

          const isOver = dragOverStage === stageKey;

          return (
            <div
              key={stageKey}
              onDragOver={(e) => handleDragOver(e, stageKey)}
              onDrop={(e) => handleDrop(e, stageKey)}
              className={`w-[290px] shrink-0 flex flex-col max-h-[calc(100vh-140px)] rounded-2xl border transition-all duration-150 ${
                isOver
                  ? 'border-brand ring-2 ring-brand/20 bg-indigo-500/[0.04]'
                  : 'border-hairline-light dark:border-hairline-dark bg-surface-light dark:bg-surface-dark'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-hairline-light dark:border-hairline-dark">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {config.label}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsNewDealModalOpen(true)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                      title="Quick Add Deal"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-Bar: Live Tabular Currency Rollup */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-0.5">
                  <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                    Total: {formatCurrency(columnTotalCents, true)}
                  </span>
                  <span className="tabular-nums">
                    Weighted: {formatCurrency(columnWeightedCents, true)}
                  </span>
                </div>
              </div>

              {/* Deals Container */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[150px]">
                {stageDeals.length > 0 ? (
                  stageDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onDragStart={handleDragStart}
                      onDragOver={(e) => handleDragOver(e, stageKey)}
                      onDrop={(e) => handleDrop(e, stageKey)}
                    />
                  ))
                ) : (
                  <div className="h-28 border border-dashed border-hairline-light dark:border-hairline-dark rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-xs">
                    <span>No active deals</span>
                    <span className="text-[10px] opacity-75">Drop deal here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
