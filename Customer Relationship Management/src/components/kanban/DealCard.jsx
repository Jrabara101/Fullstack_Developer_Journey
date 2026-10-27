// ============================================================================
// High-Velocity Kanban Deal Card
// Stakeholder Overlap Avatars, Rot Sentinel Amber Frost & Next-Step Gate
// ============================================================================

import React from 'react';
import { 
  Calendar, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Circle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { formatCurrency, evaluateDealHealth, getRelationshipStrength } from '../../utils/crmUtils';

export default function DealCard({ deal, onDragStart, onDragOver, onDrop }) {
  const {
    companies,
    contacts,
    stakeholders,
    selectedDealId,
    setSelectedDealId,
    rottingFilterActive,
    updateDeal
  } = useCRM();

  const company = companies.find(c => c.id === deal.company_id);
  const health = evaluateDealHealth(deal, stakeholders);

  // Engaged stakeholders for this deal
  const dealStakeholders = stakeholders.filter(s => s.deal_id === deal.id);
  const engagedContacts = contacts.filter(c => 
    dealStakeholders.some(s => s.contact_id === c.id) || (deal.stakeholder_ids || []).includes(c.id)
  );

  // Best relationship score among engaged contacts
  const maxRelScore = engagedContacts.length > 0 
    ? Math.max(...engagedContacts.map(c => c.relationship_score || 50))
    : 50;
  const relStrength = getRelationshipStrength(maxRelScore);

  const isSelected = selectedDealId === deal.id;

  // Dimming logic when Rotting Deals filter is toggled
  const isDimmed = rottingFilterActive && !health.isRotting;

  const toggleNextStepDone = (e) => {
    e.stopPropagation();
    if (deal.next_step_action) {
      updateDeal(deal.id, {
        next_step_action: `Completed: ${deal.next_step_action}`,
        next_step_due_date: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, deal.stage)}
      onClick={() => setSelectedDealId(deal.id)}
      className={`group relative rounded-xl border p-3.5 select-none cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-brand ring-2 ring-brand/30 bg-surface-elevated-light dark:bg-surface-elevated-dark shadow-indigo-glow'
          : 'border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark hover:border-brand/40 shadow-2xs'
      } ${health.isRotting ? 'border-amber-500/40 bg-amber-500/[0.02] dark:bg-amber-500/[0.04]' : ''} ${
        health.isRotting && rottingFilterActive ? 'deal-rot-pulse border-amber-500/70' : ''
      } ${isDimmed ? 'opacity-35 scale-[0.98]' : 'opacity-100'}`}
    >
      {/* Top Row: Company Favicon + Name + Deal Value Pill */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 border border-hairline-light dark:border-hairline-dark flex items-center justify-center text-xs shrink-0 font-medium">
            {company?.favicon || '🏢'}
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {company?.name || 'Account'}
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
            {deal.deal_code}
          </span>
        </div>

        {/* Tabular ARR Value Pill */}
        <div className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 border border-hairline-light/60 dark:border-hairline-dark/60 shrink-0">
          {formatCurrency(deal.amount_cents)}
        </div>
      </div>

      {/* Deal Title */}
      <h4 className="text-xs font-medium text-slate-900 dark:text-slate-100 leading-snug mb-2.5 line-clamp-2">
        {deal.title}
      </h4>

      {/* Stakeholder Strip & Relationship Momentum Meter */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pt-1">
        {/* Overlapping Avatar Stack */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {engagedContacts.length > 0 ? (
            engagedContacts.slice(0, 3).map((c, i) => (
              <img
                key={c.id || i}
                src={c.avatar_url}
                alt={`${c.first_name} ${c.last_name}`}
                title={`${c.first_name} ${c.last_name} (${c.job_title})`}
                className="w-5 h-5 rounded-full ring-2 ring-surface-elevated-light dark:ring-surface-elevated-dark object-cover"
              />
            ))
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center text-slate-500">
              ?
            </div>
          )}
          {engagedContacts.length > 3 && (
            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[9px] font-mono flex items-center justify-center text-slate-600 dark:text-slate-300 ring-2 ring-surface-elevated-light dark:ring-surface-elevated-dark">
              +{engagedContacts.length - 3}
            </span>
          )}
          <span className="pl-2 text-[10px] text-slate-400 font-medium">
            {engagedContacts.length} {engagedContacts.length === 1 ? 'contact' : 'contacts'}
          </span>
        </div>

        {/* 5-Segment Mini Relationship Signal Bar */}
        <div className="flex items-center gap-1" title={`Relationship Momentum: ${relStrength.label} (${maxRelScore}/100)`}>
          <span className="text-[10px]">{relStrength.emoji}</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((bar) => (
              <span
                key={bar}
                className={`w-1 h-2 rounded-xs transition-colors ${
                  bar <= relStrength.bars
                    ? relStrength.dotClass
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Conditional Warning / Deal Rot Sentinels */}
      {health.isRotting && (
        <div className="mb-2 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
          <span className="truncate">{health.warningText}</span>
        </div>
      )}

      {health.isSingleThreadedRisk && !health.isRotting && (
        <div className="mb-2 px-2 py-1 rounded-md bg-crimson-signal/10 border border-crimson-border flex items-center gap-1.5 text-[11px] text-crimson-deep dark:text-red-400 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-crimson-deep shrink-0" />
          <span className="truncate">Single-Threaded: Need Economic Buyer</span>
        </div>
      )}

      {/* Footer: Stage-Gate Scheduled Next Action */}
      <div className="pt-2 border-t border-hairline-light dark:border-hairline-dark flex items-center justify-between gap-2 text-[11px]">
        {deal.next_step_action ? (
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 min-w-0">
            <button
              onClick={toggleNextStepDone}
              className="hover:text-emerald-500 transition-colors shrink-0"
              title="Mark Next Step Completed"
            >
              {deal.next_step_action.startsWith('Completed:') ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-500" />
              )}
            </button>
            <span className="truncate text-[10px] text-slate-700 dark:text-slate-300">
              {deal.next_step_action}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>⚠️ No Next Step Set</span>
          </div>
        )}

        {deal.next_step_due_date && (
          <span className="font-mono text-[9px] text-slate-400 shrink-0">
            {deal.next_step_due_date.slice(5)}
          </span>
        )}
      </div>
    </div>
  );
}
