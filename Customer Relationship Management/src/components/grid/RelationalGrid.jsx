// ============================================================================
// Attio-Style Relational Spreadsheet Grid
// 38px Row Density, Inline Keyboard Editing, Pinned Aggregate Summary Row
// ============================================================================

import React, { useState } from 'react';
import { 
  Building2, 
  ArrowUpDown, 
  Flame, 
  Users, 
  Calendar, 
  Sparkles, 
  Check, 
  ShieldAlert,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { 
  formatCurrency, 
  STAGE_CONFIG, 
  STAGE_ORDER, 
  getRelationshipStrength, 
  evaluateDealHealth 
} from '../../utils/crmUtils';

export default function RelationalGrid() {
  const {
    deals,
    companies,
    contacts,
    stakeholders,
    teamConnections,
    selectedDealId,
    setSelectedDealId,
    searchQuery,
    updateDeal,
    attemptMoveDealStage
  } = useCRM();

  // Sorting state
  const [sortField, setSortField] = useState('amount_cents');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Inline editing state: { dealId, field, value }
  const [editingCell, setEditingCell] = useState(null);
  const [flashSavedId, setFlashSavedId] = useState(null);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter & Sort
  const processedDeals = deals
    .filter(deal => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const company = companies.find(c => c.id === deal.company_id);
      return (
        deal.title.toLowerCase().includes(q) ||
        deal.deal_code.toLowerCase().includes(q) ||
        company?.name.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'company') {
        const compA = companies.find(c => c.id === a.company_id)?.name || '';
        const compB = companies.find(c => c.id === b.company_id)?.name || '';
        valA = compA.toLowerCase();
        valB = compB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Calculate pinned summary rollups
  const totalARR = processedDeals.reduce((sum, d) => sum + d.amount_cents, 0);
  const avgARR = processedDeals.length > 0 ? Math.round(totalARR / processedDeals.length) : 0;
  const avgProbability = processedDeals.length > 0 
    ? Math.round(processedDeals.reduce((sum, d) => sum + (d.win_probability || 0), 0) / processedDeals.length)
    : 0;

  const handleCellBlurOrEnter = (dealId, field, finalValue) => {
    let parsed = finalValue;
    if (field === 'amount_cents') {
      const cleanNum = String(finalValue).replace(/[^0-9.]/g, '');
      parsed = Math.round(Number(cleanNum || 0) * 100);
    } else if (field === 'win_probability') {
      parsed = Math.min(100, Math.max(0, parseInt(finalValue) || 0));
    }

    updateDeal(dealId, { [field]: parsed });
    setEditingCell(null);
    setFlashSavedId(`${dealId}-${field}`);
    setTimeout(() => setFlashSavedId(null), 800);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-canvas-light dark:bg-canvas-dark p-6">
      {/* Table Container with custom hairlines */}
      <div className="flex-1 flex flex-col rounded-2xl border border-hairline-light dark:border-hairline-dark bg-surface-light dark:bg-surface-dark overflow-hidden shadow-2xs">
        {/* Table Viewport */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse select-none">
            {/* Header */}
            <thead className="sticky top-0 z-10 bg-surface-elevated-light dark:bg-surface-elevated-dark border-b border-hairline-light dark:border-hairline-dark text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th 
                  onClick={() => toggleSort('company')}
                  className="px-3 py-2.5 border-r border-hairline-light dark:border-hairline-dark cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Company</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="px-3 py-2.5 border-r border-hairline-light dark:border-hairline-dark min-w-[200px]">
                  <span>Deal Title & Code</span>
                </th>

                <th className="px-3 py-2.5 border-r border-hairline-light dark:border-hairline-dark w-36">
                  <span>Stage</span>
                </th>

                <th 
                  onClick={() => toggleSort('amount_cents')}
                  className="px-3 py-2.5 border-r border-hairline-light dark:border-hairline-dark text-right cursor-pointer hover:text-slate-900 dark:hover:text-white w-32"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>ARR Value</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th 
                  onClick={() => toggleSort('win_probability')}
                  className="px-3 py-2.5 border-r border-hairline-light dark:border-hairline-dark w-28 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Win Prob</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="px-3 py-2.5 border-r border-hairline-light dark:border-hairline-dark w-36">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Connection</span>
                  </div>
                </th>

                <th className="px-3 py-2.5 border-r border-hairline-light dark:border-hairline-dark w-36">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Committee</span>
                  </div>
                </th>

                <th className="px-3 py-2.5 border-r border-hairline-light dark:border-hairline-dark min-w-[200px]">
                  <span>Warm Intro Path</span>
                </th>

                <th className="px-3 py-2.5 border-r border-hairline-light dark:border-hairline-dark min-w-[240px]">
                  <span>Next Step Action</span>
                </th>

                <th className="px-3 py-2.5 w-32">
                  <span>Owner</span>
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-hairline-light dark:divide-hairline-dark text-xs">
              {processedDeals.map((deal) => {
                const company = companies.find(c => c.id === deal.company_id);
                const health = evaluateDealHealth(deal, stakeholders);

                // Stakeholders engaged
                const dealStakeholders = stakeholders.filter(s => s.deal_id === deal.id);
                const engagedContacts = contacts.filter(c => 
                  dealStakeholders.some(s => s.contact_id === c.id) || (deal.stakeholder_ids || []).includes(c.id)
                );

                const maxRelScore = engagedContacts.length > 0 
                  ? Math.max(...engagedContacts.map(c => c.relationship_score || 50))
                  : 50;
                const relStrength = getRelationshipStrength(maxRelScore);

                // Team connection warm intro
                const connection = teamConnections.find(tc => 
                  engagedContacts.some(c => c.id === tc.contact_id)
                );

                const isRowSelected = selectedDealId === deal.id;

                return (
                  <tr
                    key={deal.id}
                    onClick={() => setSelectedDealId(deal.id)}
                    className={`h-[38px] cursor-pointer transition-colors ${
                      isRowSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-surface-elevated-dark/70'
                    }`}
                  >
                    {/* 1. Company with Favicon */}
                    <td className="px-3 py-1.5 border-r border-hairline-light dark:border-hairline-dark whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{company?.favicon || '🏢'}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {company?.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {company?.domain}
                        </span>
                      </div>
                    </td>

                    {/* 2. Deal Title & Code */}
                    <td className="px-3 py-1.5 border-r border-hairline-light dark:border-hairline-dark">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                          {deal.deal_code}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[260px]">
                          {deal.title}
                        </span>
                      </div>
                    </td>

                    {/* 3. Stage Dropdown */}
                    <td 
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 border-r border-hairline-light dark:border-hairline-dark whitespace-nowrap"
                    >
                      <select
                        value={deal.stage}
                        onChange={(e) => attemptMoveDealStage(deal.id, e.target.value)}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-brand ${
                          deal.stage === 'closed_won'
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : deal.stage === 'closed_lost'
                            ? 'text-red-500 bg-red-500/10'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {STAGE_ORDER.map(sKey => (
                          <option key={sKey} value={sKey}>
                            {STAGE_CONFIG[sKey].label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* 4. ARR Value (Inline Editable Tabular) */}
                    <td 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCell({ dealId: deal.id, field: 'amount_cents', value: deal.amount_cents / 100 });
                      }}
                      className={`px-3 py-1.5 border-r border-hairline-light dark:border-hairline-dark text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100 ${
                        flashSavedId === `${deal.id}-amount_cents` ? 'flash-saved' : ''
                      }`}
                    >
                      {editingCell?.dealId === deal.id && editingCell?.field === 'amount_cents' ? (
                        <input
                          autoFocus
                          type="number"
                          defaultValue={editingCell.value}
                          onBlur={(e) => handleCellBlurOrEnter(deal.id, 'amount_cents', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellBlurOrEnter(deal.id, 'amount_cents', e.currentTarget.value);
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="w-24 px-1.5 py-0.5 text-right font-mono text-xs rounded border border-brand bg-surface-elevated-light dark:bg-surface-elevated-dark ring-2 ring-brand/30 outline-hidden"
                        />
                      ) : (
                        formatCurrency(deal.amount_cents)
                      )}
                    </td>

                    {/* 5. Win Probability (Inline Editable) */}
                    <td 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCell({ dealId: deal.id, field: 'win_probability', value: deal.win_probability });
                      }}
                      className="px-3 py-1.5 border-r border-hairline-light dark:border-hairline-dark"
                    >
                      {editingCell?.dealId === deal.id && editingCell?.field === 'win_probability' ? (
                        <input
                          autoFocus
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={editingCell.value}
                          onBlur={(e) => handleCellBlurOrEnter(deal.id, 'win_probability', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellBlurOrEnter(deal.id, 'win_probability', e.currentTarget.value);
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="w-16 px-1.5 py-0.5 font-mono text-xs rounded border border-brand bg-surface-elevated-light dark:bg-surface-elevated-dark ring-2 ring-brand/30 outline-hidden"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] tabular-nums text-slate-700 dark:text-slate-300 w-7">
                            {deal.win_probability}%
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${deal.win_probability}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 6. Relationship Strength */}
                    <td className="px-3 py-1.5 border-r border-hairline-light dark:border-hairline-dark whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium text-[10px] border ${relStrength.bgClass}`}>
                        <span>{relStrength.emoji}</span>
                        <span>{relStrength.label}</span>
                        <span className="font-mono opacity-80">{maxRelScore}/100</span>
                      </span>
                    </td>

                    {/* 7. Buying Committee Stack */}
                    <td className="px-3 py-1.5 border-r border-hairline-light dark:border-hairline-dark whitespace-nowrap">
                      <div className="flex items-center -space-x-1.5">
                        {engagedContacts.slice(0, 3).map((c, i) => (
                          <img
                            key={c.id || i}
                            src={c.avatar_url}
                            alt={c.first_name}
                            className="w-5 h-5 rounded-full ring-2 ring-surface-light dark:ring-surface-dark object-cover"
                            title={`${c.first_name} ${c.last_name}`}
                          />
                        ))}
                        <span className="pl-2 font-mono text-[10px] text-slate-400">
                          {engagedContacts.length}
                        </span>
                      </div>
                    </td>

                    {/* 8. Warm Intro Pathfinder */}
                    <td className="px-3 py-1.5 border-r border-hairline-light dark:border-hairline-dark whitespace-nowrap">
                      {connection ? (
                        <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400">
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          <span>Via @{connection.user_name.split(' ')[0]}</span>
                          <span className="text-[10px] font-mono text-slate-400">({connection.interaction_count}x touch)</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Direct Inbound</span>
                      )}
                    </td>

                    {/* 9. Next Step Action (Inline Editable) */}
                    <td 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCell({ dealId: deal.id, field: 'next_step_action', value: deal.next_step_action || '' });
                      }}
                      className="px-3 py-1.5 border-r border-hairline-light dark:border-hairline-dark"
                    >
                      {editingCell?.dealId === deal.id && editingCell?.field === 'next_step_action' ? (
                        <input
                          autoFocus
                          type="text"
                          defaultValue={editingCell.value}
                          onBlur={(e) => handleCellBlurOrEnter(deal.id, 'next_step_action', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellBlurOrEnter(deal.id, 'next_step_action', e.currentTarget.value);
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="w-full px-1.5 py-0.5 font-sans text-xs rounded border border-brand bg-surface-elevated-light dark:bg-surface-elevated-dark ring-2 ring-brand/30 outline-hidden"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                            {deal.next_step_action || <span className="text-amber-500 text-[11px]">⚠️ No next step set</span>}
                          </span>
                          {deal.next_step_due_date && (
                            <span className="font-mono text-[9px] text-slate-400 shrink-0">
                              {deal.next_step_due_date.slice(5)}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 10. Deal Owner */}
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      <span className="text-slate-600 dark:text-slate-300 text-xs">
                        {deal.owner_name}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pinned Bottom Aggregate Summary Row */}
        <div className="px-4 py-2.5 bg-surface-elevated-light dark:bg-surface-elevated-dark border-t border-hairline-light dark:border-hairline-dark flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400">
            <span>Aggregates ({processedDeals.length} filtered deals)</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">SUM:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatCurrency(totalARR)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">AVG:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatCurrency(avgARR)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">AVG WIN PROB:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {avgProbability}%
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Click any cell to edit • Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border text-slate-500">Enter</kbd> to save
          </div>
        </div>
      </div>
    </div>
  );
}
