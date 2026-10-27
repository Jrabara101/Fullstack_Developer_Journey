// ============================================================================
// Account & Deal 360° Command Center (Slide-Over / Full Inspector)
// 3-Column Split: Enriched Vitals • Omnichannel Stream & AI Brief • Buying Committee & Warm Intro
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  Calendar, 
  Mail, 
  Phone, 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Zap, 
  ChevronRight, 
  Plus,
  Flame,
  Globe,
  Building,
  DollarSign,
  Share2,
  Check
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { 
  formatCurrency, 
  formatRelativeTime, 
  STAGE_CONFIG, 
  STAGE_ORDER, 
  getRelationshipStrength, 
  evaluateDealHealth,
  autoEnrichDomain
} from '../../utils/crmUtils';

export default function Account360Inspector() {
  const {
    deals,
    companies,
    contacts,
    stakeholders,
    interactions,
    teamConnections,
    selectedDealId,
    setSelectedDealId,
    attemptMoveDealStage,
    addInteraction,
    addOrUpdateStakeholder,
    updateDeal
  } = useCRM();

  const deal = deals.find(d => d.id === selectedDealId);
  const company = companies.find(c => c.id === deal?.company_id);

  // Inspector tabs & composer
  const [composerTab, setComposerTab] = useState('note'); // 'note' | 'email' | 'call' | 'handoff'
  const [composerText, setComposerText] = useState('');
  const [composerSubject, setComposerSubject] = useState('');
  const [selectedContactForInteraction, setSelectedContactForInteraction] = useState('');
  const [isAiBriefExpanded, setIsAiBriefExpanded] = useState(true);
  const [warmIntroRequested, setWarmIntroRequested] = useState(false);

  // Domain auto-enrich test input
  const [testDomainInput, setTestDomainInput] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);

  // Add Stakeholder modal state
  const [isAddingStakeholder, setIsAddingStakeholder] = useState(false);
  const [newStakeholderContactId, setNewStakeholderContactId] = useState('');
  const [newStakeholderRole, setNewStakeholderRole] = useState('champion');
  const [newStakeholderSentiment, setNewStakeholderSentiment] = useState('positive');

  if (!deal || !company) return null;

  const health = evaluateDealHealth(deal, stakeholders);

  // Deal stakeholders & contacts
  const dealStakeholders = stakeholders.filter(s => s.deal_id === deal.id);
  const dealInteractions = interactions.filter(i => i.deal_id === deal.id || i.company_id === company.id);

  // Team connections to this company's contacts
  const availableTeamConnections = teamConnections.filter(tc => {
    return contacts.some(c => c.company_id === company.id && c.id === tc.contact_id);
  });

  const handleCreateInteraction = (e) => {
    e.preventDefault();
    if (!composerText.trim()) return;

    let type = 'note';
    let direction = 'internal';
    let subject = composerSubject || 'Internal Team Note';

    if (composerTab === 'email') {
      type = 'email';
      direction = 'outbound';
      subject = composerSubject || 'Outbound Follow-up Email';
    } else if (composerTab === 'call') {
      type = 'call';
      direction = 'outbound';
      subject = composerSubject || 'Executive Call Notes';
    } else if (composerTab === 'handoff') {
      type = 'system_signal';
      direction = 'internal';
      subject = '🚀 AE → CSM Closed-Won Handoff Brief';
    }

    addInteraction({
      company_id: company.id,
      deal_id: deal.id,
      contact_id: selectedContactForInteraction || dealStakeholders[0]?.contact_id || null,
      actor_user_id: 'usr-1',
      actor_name: 'Alex Rivera',
      actor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
      type,
      direction,
      subject,
      body: composerText,
      metadata: {
        template: composerTab
      }
    });

    setComposerText('');
    setComposerSubject('');
  };

  const handleAddStakeholderSubmit = (e) => {
    e.preventDefault();
    if (!newStakeholderContactId) return;

    addOrUpdateStakeholder({
      deal_id: deal.id,
      contact_id: newStakeholderContactId,
      buying_role: newStakeholderRole,
      sentiment: newStakeholderSentiment,
      notes: 'Added from Account 360 Committee Manager'
    });

    setIsAddingStakeholder(false);
  };

  const handleTestAutoEnrich = () => {
    if (!testDomainInput) return;
    setIsEnriching(true);
    setTimeout(() => {
      const enriched = autoEnrichDomain(testDomainInput);
      setIsEnriching(false);
      alert(`Auto-Enrichment Resolved!\nCompany: ${enriched.name}\nHeadcount: ${enriched.employee_range}\nIndustry: ${enriched.industry}\nFunding: ${enriched.enriched_metadata.funding_round}`);
      setTestDomainInput('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* 3-Pane Command Center Slide-Over Drawer */}
      <div className="w-full max-w-6xl h-full bg-surface-light dark:bg-surface-dark border-l border-hairline-light dark:border-hairline-dark flex flex-col shadow-2xl overflow-hidden animate-slide-left">
        {/* ================================================================== */}
        {/* TOP IDENTITY & INTERACTIVE STAGE STEPPER HEADER                     */}
        {/* ================================================================== */}
        <div className="px-6 py-4 border-b border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark flex flex-wrap items-center justify-between gap-4">
          {/* Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-hairline-light dark:border-hairline-dark flex items-center justify-center text-xl shadow-xs font-bold shrink-0">
              {company.favicon || '🏢'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400 dark:text-slate-500 font-semibold">
                  {deal.deal_code}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  {company.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-brand dark:text-brand-dark font-medium border border-indigo-200 dark:border-indigo-800/40">
                  {company.tier.toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {deal.title}
              </h2>
            </div>
          </div>

          {/* Center: ARR & Stage Stepper */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">
                Contract ARR
              </span>
              <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatCurrency(deal.amount_cents)}
                <span className="text-xs text-slate-400 font-normal"> / yr</span>
              </span>
            </div>

            {/* Interactive Chevron Stage Stepper */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-hairline-light dark:border-hairline-dark text-xs">
              {STAGE_ORDER.slice(0, 6).map((stageKey) => {
                const isCurrent = deal.stage === stageKey;
                const isPassed = STAGE_ORDER.indexOf(deal.stage) > STAGE_ORDER.indexOf(stageKey);

                return (
                  <button
                    key={stageKey}
                    onClick={() => attemptMoveDealStage(deal.id, stageKey)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all text-[11px] ${
                      isCurrent
                        ? 'bg-brand text-white shadow-xs'
                        : isPassed
                        ? 'text-emerald-600 dark:text-emerald-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    {STAGE_CONFIG[stageKey].label}
                  </button>
                );
              })}
            </div>

            {/* Close Inspector */}
            <button
              onClick={() => setSelectedDealId(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 3-COLUMN SPLIT ARCHITECTURE                                        */}
        {/* ================================================================== */}
        <div className="flex-1 flex overflow-hidden">
          {/* ================================================================ */}
          {/* LEFT PANE (280px): ENRICHED VITALS & PINNED NEXT STEP              */}
          {/* ================================================================ */}
          <div className="w-72 shrink-0 border-r border-hairline-light dark:border-hairline-dark p-4 overflow-y-auto space-y-4 bg-surface-light dark:bg-surface-dark">
            {/* Pinned "Next Step" Commitment Card */}
            <div className="p-3.5 rounded-xl border border-brand/30 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-brand dark:text-brand-dark">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Scheduled Next Action
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {deal.next_step_due_date || 'No Date'}
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {deal.next_step_action || 'No next step locked. Click below to add commitment.'}
              </p>
              <button
                onClick={() => {
                  const newAction = prompt('Update Next Step Action:', deal.next_step_action || '');
                  if (newAction) {
                    updateDeal(deal.id, { next_step_action: newAction });
                  }
                }}
                className="w-full text-center text-[11px] font-medium text-brand dark:text-brand-dark hover:underline pt-1 block"
              >
                Edit Next Step & Due Date ↵
              </button>
            </div>

            {/* Auto-Enriched Company Profile */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Enriched Account Vitals
                </span>
                <span className="text-[10px] text-emerald-500 font-medium">● Verified</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-hairline-light/50 dark:border-hairline-dark/50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Domain
                  </span>
                  <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-indigo-500 hover:underline flex items-center gap-1"
                  >
                    {company.domain}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-hairline-light/50 dark:border-hairline-dark/50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> Headcount
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {company.employee_range}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-hairline-light/50 dark:border-hairline-dark/50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Annual Rev
                  </span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {formatCurrency(company.annual_revenue_cents)}
                  </span>
                </div>

                <div className="py-1 border-b border-hairline-light/50 dark:border-hairline-dark/50">
                  <span className="text-slate-400 block mb-1">Industry Taxonomy</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {company.industry}
                  </span>
                </div>

                <div className="py-1 border-b border-hairline-light/50 dark:border-hairline-dark/50">
                  <span className="text-slate-400 block mb-1">Headquarters & Timezone</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {company.enriched_metadata.headquarters}
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-indigo-500">
                    <Clock className="w-3 h-3" />
                    <span>Local Time: {new Date().toLocaleTimeString('en-US', { timeZone: company.enriched_metadata.timezone || 'America/Los_Angeles', hour: '2-digit', minute: '2-digit' })} ({company.enriched_metadata.timezone})</span>
                  </div>
                </div>

                {/* Tech Stack Tags */}
                <div className="py-1">
                  <span className="text-slate-400 block mb-1.5">Detected Tech Stack</span>
                  <div className="flex flex-wrap gap-1">
                    {(company.enriched_metadata.tech_stack || []).map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-hairline-light dark:border-hairline-dark text-slate-700 dark:text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Zero-Admin Enrichment Tester Sandbox */}
            <div className="pt-2 border-t border-hairline-light dark:border-hairline-dark space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Instant Auto-Enricher Tool
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. anthropic.com"
                  value={testDomainInput}
                  onChange={(e) => setTestDomainInput(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-800 dark:text-slate-200 outline-hidden focus:border-brand"
                />
                <button
                  onClick={handleTestAutoEnrich}
                  disabled={isEnriching}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shrink-0"
                >
                  {isEnriching ? '...' : 'Lookup'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Resolves firmographics & tech stack on the fly.
              </p>
            </div>
          </div>

          {/* ================================================================ */}
          {/* CENTER STAGE: TIMELINE & PRE-CALL BRIEF                           */}
          {/* ================================================================ */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark">
            {/* AI 60-Second Pre-Meeting Briefing Banner */}
            <div className="p-4 border-b border-hairline-light dark:border-hairline-dark bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-indigo-500 text-white flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    60-Second Pre-Call Briefing • Architecture & Closing Review
                  </span>
                </div>
                <button
                  onClick={() => setIsAiBriefExpanded(prev => !prev)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {isAiBriefExpanded ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {isAiBriefExpanded && (
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 mt-2 pl-7 leading-relaxed">
                  <p>
                    <strong className="text-slate-900 dark:text-slate-100">Executive Summary:</strong> Champion (Elena Rostova) confirmed budget sign-off with David Chen (CFO) yesterday. Legal redlines on Section 8 (Data Residency) have been approved.
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-slate-100">Key Objective Today:</strong> Walk through final seat license tier schedule with David Chen and secure signature by Friday.
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 font-mono">
                    <span>📍 SF Weather: 64°F / Sunny</span>
                    <span>•</span>
                    <span>⚡ Sandbox Seat Usage: 96%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Inline Activity Composer */}
            <div className="p-4 border-b border-hairline-light dark:border-hairline-dark bg-surface-light dark:bg-surface-dark">
              {/* Tab Selector */}
              <div className="flex items-center gap-2 mb-2.5">
                <button
                  onClick={() => setComposerTab('note')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    composerTab === 'note'
                      ? 'bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Internal Note</span>
                </button>

                <button
                  onClick={() => setComposerTab('email')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    composerTab === 'email'
                      ? 'bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </button>

                <button
                  onClick={() => setComposerTab('call')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    composerTab === 'call'
                      ? 'bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Log Call</span>
                </button>

                <button
                  onClick={() => setComposerTab('handoff')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    composerTab === 'handoff'
                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-2xs border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-500" />
                  <span>AE → CSM Handoff</span>
                </button>
              </div>

              {/* Composer Input Area */}
              <form onSubmit={handleCreateInteraction} className="space-y-2">
                {composerTab === 'email' && (
                  <input
                    type="text"
                    placeholder="Subject line..."
                    value={composerSubject}
                    onChange={(e) => setComposerSubject(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-900 dark:text-slate-100 outline-hidden focus:border-brand"
                  />
                )}

                {composerTab === 'handoff' && (
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300">
                    <p className="font-semibold mb-1">Collaborative Deal Room Handoff Template</p>
                    <p className="text-[11px] opacity-90">Preserve discovery goals, technical architecture sign-offs, and CSM renewal milestones.</p>
                  </div>
                )}

                <textarea
                  rows={2}
                  placeholder={
                    composerTab === 'note' 
                      ? 'Log internal discovery note (supports @mentions)...' 
                      : composerTab === 'email' 
                      ? 'Write email to stakeholders...' 
                      : composerTab === 'call'
                      ? 'Meeting highlights, next commitments, objections...'
                      : 'Structured handoff deliverables, promised integrations, CSM assignment...'
                  }
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-900 dark:text-slate-100 outline-hidden focus:border-brand resize-none"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Press <kbd className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border">Ctrl+Enter</kbd> to submit
                  </span>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand hover:bg-brand-hover text-white shadow-xs transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Log {composerTab === 'handoff' ? 'Handoff' : 'Activity'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Omnichannel Activity Timeline Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span>Omnichannel Timeline ({dealInteractions.length} events)</span>
                <span className="text-[10px] font-normal normal-case">Emails • Calls • Meetings • Signals</span>
              </div>

              <div className="space-y-3">
                {dealInteractions.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark shadow-2xs space-y-2 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {item.type === 'email' ? (
                          <span className="p-1 rounded-md bg-blue-500/10 text-blue-500">
                            <Mail className="w-3.5 h-3.5" />
                          </span>
                        ) : item.type === 'meeting' ? (
                          <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-500">
                            <Calendar className="w-3.5 h-3.5" />
                          </span>
                        ) : item.type === 'stage_transition' ? (
                          <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-500">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        ) : item.type === 'system_signal' ? (
                          <span className="p-1 rounded-md bg-amber-500/10 text-amber-500">
                            <Zap className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded-md bg-purple-500/10 text-purple-500">
                            <FileText className="w-3.5 h-3.5" />
                          </span>
                        )}

                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.subject}
                        </span>

                        {item.metadata?.opened_count && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            Opened {item.metadata.opened_count}x
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {formatRelativeTime(item.occurred_at)}
                      </span>
                    </div>

                    {/* Body */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.body}
                    </p>

                    {/* Footer / Actor */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-hairline-light/50 dark:border-hairline-dark/50">
                      <span>Logged by {item.actor_name}</span>
                      {item.metadata?.attachments && (
                        <span className="font-mono text-[10px] text-indigo-500">
                          📎 {item.metadata.attachments.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* RIGHT PANE (320px): BUYING COMMITTEE & WARM-INTRO PATHFINDER      */}
          {/* ================================================================ */}
          <div className="w-80 shrink-0 p-4 overflow-y-auto space-y-4 bg-surface-light dark:bg-surface-dark">
            {/* Buying Committee Stakeholder Role Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Buying Committee ({dealStakeholders.length})
                </span>
                <button
                  onClick={() => setIsAddingStakeholder(prev => !prev)}
                  className="text-xs text-brand dark:text-brand-dark hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add Stakeholder
                </button>
              </div>

              {/* Single Threaded Risk Warning Callout */}
              {health.isSingleThreadedRisk && (
                <div className="p-3 rounded-xl bg-crimson-signal/10 border border-crimson-border space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-crimson-deep dark:text-red-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Single-Threaded Risk Alert</span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                    This deal is in late stage ({STAGE_CONFIG[deal.stage]?.label}) without an engaged Economic Buyer. Add CFO or finance stakeholder to protect momentum.
                  </p>
                </div>
              )}

              {/* Add Stakeholder Form */}
              {isAddingStakeholder && (
                <form onSubmit={handleAddStakeholderSubmit} className="p-3 rounded-xl border border-brand/40 bg-surface-elevated-light dark:bg-surface-elevated-dark space-y-2">
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block">
                    Map New Stakeholder
                  </span>

                  <select
                    value={newStakeholderContactId}
                    onChange={(e) => setNewStakeholderContactId(e.target.value)}
                    className="w-full text-xs p-1.5 rounded-lg border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-slate-800 dark:text-slate-200"
                    required
                  >
                    <option value="">Select contact...</option>
                    {contacts.filter(c => c.company_id === company.id).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.first_name} {c.last_name} ({c.job_title})
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <select
                      value={newStakeholderRole}
                      onChange={(e) => setNewStakeholderRole(e.target.value)}
                      className="p-1 rounded-lg border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-slate-800 dark:text-slate-200"
                    >
                      <option value="champion">Champion</option>
                      <option value="economic_buyer">Economic Buyer</option>
                      <option value="technical_evaluator">Technical Gatekeeper</option>
                      <option value="procurement">Procurement</option>
                      <option value="blocker">Potential Blocker</option>
                    </select>

                    <select
                      value={newStakeholderSentiment}
                      onChange={(e) => setNewStakeholderSentiment(e.target.value)}
                      className="p-1 rounded-lg border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-slate-800 dark:text-slate-200"
                    >
                      <option value="positive">Advocate (🟢)</option>
                      <option value="neutral">Neutral (🟡)</option>
                      <option value="negative">Skeptical (🔴)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingStakeholder(false)}
                      className="px-2 py-1 text-xs text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-xs bg-brand text-white rounded-lg font-medium"
                    >
                      Save Stakeholder
                    </button>
                  </div>
                </form>
              )}

              {/* Stakeholder Cards */}
              <div className="space-y-2.5">
                {dealStakeholders.map((sh) => {
                  const contact = contacts.find(c => c.id === sh.contact_id);
                  if (!contact) return null;

                  return (
                    <div
                      key={sh.contact_id}
                      className="p-3 rounded-xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark space-y-2 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={contact.avatar_url}
                            alt={contact.first_name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-hairline-light dark:ring-hairline-dark"
                          />
                          <div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                              {contact.first_name} {contact.last_name}
                            </span>
                            <span className="text-[10px] text-slate-400 block line-clamp-1">
                              {contact.job_title}
                            </span>
                          </div>
                        </div>

                        {/* Sentiment Chip */}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          sh.sentiment === 'positive'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : sh.sentiment === 'negative'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {sh.sentiment === 'positive' ? '🟢 Advocate' : sh.sentiment === 'negative' ? '🔴 Skeptical' : '🟡 Neutral'}
                        </span>
                      </div>

                      {/* Role Pill & Last Touch */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {sh.buying_role.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          Touch: {sh.last_touch || '2d ago'}
                        </span>
                      </div>

                      {/* Notes / Alerts */}
                      {sh.alert && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-1.5 rounded-md">
                          {sh.alert}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* "Who Knows Whom" Team Connection Pathfinder */}
            <div className="space-y-3 pt-3 border-t border-hairline-light dark:border-hairline-dark">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                "Who Knows Whom" Warm-Intro Pathfinder
              </span>

              {availableTeamConnections.length > 0 ? (
                availableTeamConnections.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Warm Path: @{tc.user_name}</span>
                      </div>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-500 font-semibold">
                        {tc.strength_score}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                      {tc.relationship_context}
                    </p>

                    <button
                      onClick={() => {
                        setWarmIntroRequested(true);
                        setTimeout(() => setWarmIntroRequested(false), 2500);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                      {warmIntroRequested ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Intro Request Dispatched!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Request Warm Intro from @{tc.user_name.split(' ')[0]}</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-hairline-light dark:border-hairline-dark text-center text-xs text-slate-400">
                  No internal team overlap found on target contacts yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
