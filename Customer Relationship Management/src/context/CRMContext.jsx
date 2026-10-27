// ============================================================================
// AetherCRM Core Context & Global State Engine
// Supports zero-admin enrichment, stage-gate enforcement, inline editing & persistence
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_COMPANIES,
  INITIAL_CONTACTS,
  INITIAL_DEALS,
  INITIAL_STAKEHOLDERS,
  INITIAL_INTERACTIONS,
  INITIAL_TEAM_CONNECTIONS,
  INITIAL_JOB_CHANGE_ALERTS
} from '../data/mockData';
import { autoEnrichDomain, evaluateDealHealth, STAGE_CONFIG } from '../utils/crmUtils';

const CRMContext = createContext(null);

export function CRMProvider({ children }) {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('aether_theme') || 'dark';
  });

  // Core entities
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem('aether_companies');
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('aether_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [deals, setDeals] = useState(() => {
    const saved = localStorage.getItem('aether_deals');
    return saved ? JSON.parse(saved) : INITIAL_DEALS;
  });

  const [stakeholders, setStakeholders] = useState(() => {
    const saved = localStorage.getItem('aether_stakeholders');
    return saved ? JSON.parse(saved) : INITIAL_STAKEHOLDERS;
  });

  const [interactions, setInteractions] = useState(() => {
    const saved = localStorage.getItem('aether_interactions');
    return saved ? JSON.parse(saved) : INITIAL_INTERACTIONS;
  });

  const [teamConnections, setTeamConnections] = useState(() => {
    const saved = localStorage.getItem('aether_team_connections');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_CONNECTIONS;
  });

  const [jobChangeAlerts, setJobChangeAlerts] = useState(() => {
    const saved = localStorage.getItem('aether_job_alerts');
    return saved ? JSON.parse(saved) : INITIAL_JOB_CHANGE_ALERTS;
  });

  // UI Navigation & View Switcher
  const [activeView, setActiveView] = useState('kanban'); // 'kanban' | 'grid' | 'forecast' | 'reconnect'
  const [selectedDealId, setSelectedDealId] = useState('deal-1'); // Default to Stripe deal for instant inspection
  const [searchQuery, setSearchQuery] = useState('');
  const [rottingFilterActive, setRottingFilterActive] = useState(false);

  // Modals & Triggers
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [isJobChangeModalOpen, setIsJobChangeModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [stageGatePending, setStageGatePending] = useState(null); // { dealId, targetStage, nextStepAction, nextStepDueDate, winProbability }

  // Forecast Slippage Simulation (dealId -> boolean)
  const [forecastSlippages, setForecastSlippages] = useState({});

  // Sync theme with HTML class & storage
  useEffect(() => {
    localStorage.setItem('aether_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist state
  useEffect(() => {
    localStorage.setItem('aether_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('aether_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('aether_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('aether_stakeholders', JSON.stringify(stakeholders));
  }, [stakeholders]);

  useEffect(() => {
    localStorage.setItem('aether_interactions', JSON.stringify(interactions));
  }, [interactions]);

  useEffect(() => {
    localStorage.setItem('aether_team_connections', JSON.stringify(teamConnections));
  }, [teamConnections]);

  useEffect(() => {
    localStorage.setItem('aether_job_alerts', JSON.stringify(jobChangeAlerts));
  }, [jobChangeAlerts]);

  // Global Keyboard Shortcuts (Cmd+K, L, C, etc.)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is actively typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsNewDealModalOpen(true);
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setRottingFilterActive(prev => !prev);
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update a deal with optimistic updates
  const updateDeal = (dealId, updates) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return { ...d, ...updates, updated_at: new Date().toISOString() };
      }
      return d;
    }));
  };

  // Attempt Stage Move with Stage-Gate Enforcement
  const attemptMoveDealStage = (dealId, targetStage) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    if (deal.stage === targetStage) return;

    // Check if target stage is an active pipeline stage requiring next step
    const activePipelineStages = ['discovery', 'demo', 'proposal', 'negotiation'];
    const isTargetActive = activePipelineStages.includes(targetStage);
    const hasValidFutureStep = deal.next_step_action && deal.next_step_due_date && (new Date(deal.next_step_due_date) >= new Date(new Date().toISOString().split('T')[0]));

    // If moving into an active stage without a future next step, trigger the Stage-Gate Micro-Dialog
    if (isTargetActive && !hasValidFutureStep) {
      setStageGatePending({
        dealId,
        targetStage,
        currentNextStep: deal.next_step_action || '',
        currentDueDate: deal.next_step_due_date || new Date(Date.now() + 3 * 86400 * 1000).toISOString().split('T')[0],
        currentProbability: STAGE_CONFIG[targetStage]?.defaultProbability || deal.win_probability
      });
      return;
    }

    // Direct transition
    executeStageTransition(dealId, targetStage, deal.next_step_action, deal.next_step_due_date, STAGE_CONFIG[targetStage]?.defaultProbability || deal.win_probability);
  };

  // Execute stage transition and log audit event in interactions timeline
  const executeStageTransition = (dealId, targetStage, nextStepAction, nextStepDueDate, winProbability) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    const fromStage = deal.stage;
    const nowIso = new Date().toISOString();

    // Check for celebration on Closed Won
    if (targetStage === 'closed_won') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe fallback
      }
    }

    // Update deal record
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          stage: targetStage,
          next_step_action: nextStepAction,
          next_step_due_date: nextStepDueDate,
          win_probability: winProbability !== undefined ? winProbability : d.win_probability,
          forecast_category: targetStage === 'closed_won' ? 'closed' : targetStage === 'negotiation' ? 'commit' : targetStage === 'proposal' ? 'best_case' : 'pipeline',
          stage_entered_at: nowIso,
          updated_at: nowIso
        };
      }
      return d;
    }));

    // Add immutable audit log to interactions feed
    const auditInteraction = {
      id: `int-audit-${Date.now()}`,
      company_id: deal.company_id,
      deal_id: deal.id,
      contact_id: null,
      actor_user_id: 'usr-1',
      actor_name: 'Alex Rivera',
      actor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
      type: 'stage_transition',
      direction: 'internal',
      subject: `Stage Transition: ${fromStage.toUpperCase()} → ${targetStage.toUpperCase()}`,
      body: `Deal moved from ${STAGE_CONFIG[fromStage]?.label || fromStage} to ${STAGE_CONFIG[targetStage]?.label || targetStage}.${nextStepAction ? ` Locked next action: "${nextStepAction}" (due ${nextStepDueDate})` : ''}`,
      metadata: {
        from_stage: fromStage,
        to_stage: targetStage,
        amount_cents: deal.amount_cents,
        win_probability: winProbability
      },
      occurred_at: nowIso
    };

    setInteractions(prev => [auditInteraction, ...prev]);
    setStageGatePending(null);
  };

  // Add new omnichannel interaction (note, email, call, CSM handoff)
  const addInteraction = (newInteraction) => {
    const item = {
      id: `int-${Date.now()}`,
      occurred_at: new Date().toISOString(),
      ...newInteraction
    };

    setInteractions(prev => [item, ...prev]);

    // Update contact relationship score if contact associated
    if (newInteraction.contact_id) {
      setContacts(prev => prev.map(c => {
        if (c.id === newInteraction.contact_id) {
          return {
            ...c,
            last_interaction_at: item.occurred_at,
            relationship_score: Math.min(100, c.relationship_score + 12),
            updated_at: item.occurred_at
          };
        }
        return c;
      }));
    }
  };

  // Create new deal with auto-enrichment
  const createNewDeal = ({ title, domain, amount, stage, nextStepAction, nextStepDueDate }) => {
    const enriched = autoEnrichDomain(domain);
    let company = companies.find(c => c.domain.toLowerCase() === enriched.domain.toLowerCase());

    if (!company) {
      company = {
        id: `comp-${Date.now()}`,
        name: enriched.name,
        domain: enriched.domain,
        logo_url: `https://logo.clearbit.com/${enriched.domain}`,
        favicon: enriched.favicon,
        industry: enriched.industry,
        employee_range: enriched.employee_range,
        annual_revenue_cents: enriched.annual_revenue_cents,
        tier: enriched.tier,
        lifecycle_stage: 'prospect',
        health_score: 85,
        owner_name: 'Alex Rivera',
        owner_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        enriched_metadata: enriched.enriched_metadata
      };
      setCompanies(prev => [company, ...prev]);
    }

    const codeNum = Math.floor(100 + Math.random() * 900);
    const newDeal = {
      id: `deal-${Date.now()}`,
      deal_code: `DEAL-${codeNum}`,
      title: title || `${company.name} — Expansion`,
      company_id: company.id,
      owner_id: 'usr-1',
      owner_name: 'Alex Rivera',
      stage: stage || 'discovery',
      amount_cents: Math.round(Number(amount || 50000) * 100),
      currency: 'USD',
      win_probability: STAGE_CONFIG[stage || 'discovery']?.defaultProbability || 40,
      forecast_category: 'pipeline',
      expected_close_date: new Date(Date.now() + 45 * 86400 * 1000).toISOString().split('T')[0],
      next_step_action: nextStepAction || 'Schedule preliminary alignment call',
      next_step_due_date: nextStepDueDate || new Date(Date.now() + 3 * 86400 * 1000).toISOString().split('T')[0],
      stage_entered_at: new Date().toISOString(),
      lost_reason: null,
      sort_order: 2000.0,
      stakeholder_ids: []
    };

    setDeals(prev => [newDeal, ...prev]);
    setSelectedDealId(newDeal.id);
    setIsNewDealModalOpen(false);
  };

  // Buying Committee: Add or update stakeholder
  const addOrUpdateStakeholder = ({ deal_id, contact_id, buying_role, sentiment, notes }) => {
    setStakeholders(prev => {
      const existingIndex = prev.findIndex(s => s.deal_id === deal_id && s.contact_id === contact_id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          buying_role,
          sentiment,
          notes: notes || updated[existingIndex].notes
        };
        return updated;
      }
      return [...prev, {
        deal_id,
        contact_id,
        buying_role,
        sentiment,
        notes: notes || '',
        last_touch: 'Just now'
      }];
    });

    // Make sure deal's stakeholder_ids includes contact
    setDeals(prev => prev.map(d => {
      if (d.id === deal_id) {
        const sIds = d.stakeholder_ids || [];
        if (!sIds.includes(contact_id)) {
          return { ...d, stakeholder_ids: [...sIds, contact_id] };
        }
      }
      return d;
    }));
  };

  // Reconnect triage: Snooze contact
  const snoozeContact = (contactId, days = 14) => {
    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        return {
          ...c,
          keep_in_touch_days: (c.keep_in_touch_days || 30) + days
        };
      }
      return c;
    }));
  };

  // Toggle forecast deal slippage in simulator
  const toggleSlippage = (dealId) => {
    setForecastSlippages(prev => ({
      ...prev,
      [dealId]: !prev[dealId]
    }));
  };

  // Dismiss Job Change Alert
  const dismissJobChange = (alertId) => {
    setJobChangeAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Reset to initial mock data
  const resetToDefaults = () => {
    localStorage.clear();
    setCompanies(INITIAL_COMPANIES);
    setContacts(INITIAL_CONTACTS);
    setDeals(INITIAL_DEALS);
    setStakeholders(INITIAL_STAKEHOLDERS);
    setInteractions(INITIAL_INTERACTIONS);
    setTeamConnections(INITIAL_TEAM_CONNECTIONS);
    setJobChangeAlerts(INITIAL_JOB_CHANGE_ALERTS);
  };

  return (
    <CRMContext.Provider
      value={{
        theme,
        setTheme,
        companies,
        contacts,
        deals,
        stakeholders,
        interactions,
        teamConnections,
        jobChangeAlerts,
        activeView,
        setActiveView,
        selectedDealId,
        setSelectedDealId,
        searchQuery,
        setSearchQuery,
        rottingFilterActive,
        setRottingFilterActive,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isNewDealModalOpen,
        setIsNewDealModalOpen,
        isJobChangeModalOpen,
        setIsJobChangeModalOpen,
        isShortcutsModalOpen,
        setIsShortcutsModalOpen,
        stageGatePending,
        setStageGatePending,
        forecastSlippages,
        toggleSlippage,
        updateDeal,
        attemptMoveDealStage,
        executeStageTransition,
        addInteraction,
        createNewDeal,
        addOrUpdateStakeholder,
        snoozeContact,
        dismissJobChange,
        resetToDefaults
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
