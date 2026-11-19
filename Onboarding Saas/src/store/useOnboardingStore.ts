import { create } from 'zustand';
import confetti from 'canvas-confetti';
import type {
  RolePersona,
  IndustryTemplate,
  StepStatus,
  ProgressStyle,
  WorkspaceDraft,
  EnrichedCompanyData,
  DelegatedStepInfo,
  SampleRecord
} from '../types';

export const STEP_ORDER = ['identity', 'persona', 'integrations', 'team'] as const;
export type StepSlug = typeof STEP_ORDER[number];

export const STEP_METADATA: Record<StepSlug, { number: string; title: string; defaultTimeEstimate: string }> = {
  identity: { number: '01', title: 'Workspace Identity', defaultTimeEstimate: '⏱ ~45s left' },
  persona: { number: '02', title: 'Role & Goals', defaultTimeEstimate: '⏱ ~30s left' },
  integrations: { number: '03', title: 'Data & Telemetry', defaultTimeEstimate: '⏱ ~15s left' },
  team: { number: '04', title: 'Invite Collaborators', defaultTimeEstimate: '⏱ ~5s left' }
};

interface ActivationMilestone {
  id: string;
  title: string;
  completed: boolean;
  delegated?: boolean;
  delegatedTo?: string;
  guideTourTarget?: string;
}

interface OnboardingStoreState {
  // Navigation & View
  activeView: 'onboarding' | 'dashboard' | 'admin' | 'teammate_portal';
  currentStepSlug: StepSlug;
  stepIndex: number;
  activeProgressStyle: ProgressStyle;
  
  // Workspace State
  workspaceDraft: WorkspaceDraft;
  
  // Role & Goals
  rolePersona: RolePersona | null;
  selectedGoals: string[];
  
  // Step Progression
  stepStatuses: Record<StepSlug, StepStatus>;
  completedSteps: StepSlug[];
  skippedSteps: StepSlug[];
  delegatedSteps: Record<string, DelegatedStepInfo>;
  completionPercentage: number;
  timeRemainingEstimate: string;
  
  // Domain Enrichment
  isEnriching: boolean;
  enrichedCompany: EnrichedCompanyData | null;
  autoEnrichDismissed: boolean;
  
  // Sample Data Sandbox
  isSampleDataActive: boolean;
  sampleDataRecords: SampleRecord[];
  
  // Post-Setup In-App Activation Dock
  dockCollapsed: boolean;
  activationMilestones: ActivationMilestone[];
  rewardClaimed: boolean;
  guidedTourActive: boolean;
  tourTargetElement: string | null;
  
  // UI States & Toast
  toastMessage: { title: string; subtitle?: string; type: 'success' | 'info' | 'delegated' } | null;
  flyToDockAnimation: boolean;
  activeDelegationToken: string | null;

  // Actions
  setActiveView: (view: 'onboarding' | 'dashboard' | 'admin' | 'teammate_portal') => void;
  setProgressStyle: (style: ProgressStyle) => void;
  goToStep: (step: StepSlug) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Form updates
  setWorkspaceDraft: (draft: Partial<WorkspaceDraft>) => void;
  setBrandColor: (color: string) => void;
  setRolePersona: (role: RolePersona) => void;
  toggleGoal: (goalId: string) => void;
  
  // Step actions
  completeCurrentStep: () => void;
  skipCurrentStep: () => void;
  delegateCurrentStep: (email: string, note?: string) => Promise<string>;
  markDelegationComplete: (stepSlug: string, assigneeName: string) => void;
  
  // Domain enrichment
  enrichDomain: (emailOrDomain: string) => Promise<boolean>;
  dismissEnrichment: () => void;
  
  // Sample data
  toggleSampleData: (enable: boolean) => Promise<void>;
  purgeSampleData: () => Promise<void>;
  
  // Post-Onboarding Dock
  toggleDockCollapsed: () => void;
  toggleMilestone: (id: string) => void;
  startGuidedTour: (targetKey: string) => void;
  dismissGuidedTour: () => void;
  triggerRewardUnlock: () => void;
  
  // Notification Toast
  setToast: (toast: { title: string; subtitle?: string; type: 'success' | 'info' | 'delegated' } | null) => void;
  
  // Real-time synchronization
  initWebSocket: () => void;
}

// Function to calculate endowed percentage
function calculatePercentage(
  completed: StepSlug[],
  delegated: Record<string, DelegatedStepInfo>
): number {
  let percent = 20; // Starts at 20% endowed progress
  if (completed.includes('identity')) percent += 25;
  if (completed.includes('persona')) percent += 20;
  if (completed.includes('integrations') || delegated['integrations']) percent += 20;
  if (completed.includes('team')) percent += 15;
  return Math.min(percent, 100);
}

// Update CSS Custom Properties
function updateCssBrandVariables(color: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--workspace-brand', color);
    
    // Convert hex to rgb for ring
    const hex = color.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      document.documentElement.style.setProperty('--workspace-brand-ring', `rgba(${r}, ${g}, ${b}, 0.25)`);
      document.documentElement.style.setProperty('--workspace-brand-light', `rgba(${r}, ${g}, ${b}, 0.08)`);
    }
  }
}

export const useOnboardingStore = create<OnboardingStoreState>((set, get) => ({
  activeView: 'onboarding',
  currentStepSlug: 'identity',
  stepIndex: 0,
  activeProgressStyle: 'segmented',
  
  workspaceDraft: {
    name: 'Acme Cloud Studio',
    slug: 'acme-studio',
    domain: 'vercel.com',
    brandColor: '#4F46E5',
    logoUrl: 'https://avatar.vercel.sh/acme.svg?text=AC',
    industryTemplate: 'saas',
    hasSampleData: true,
    trialDaysLeft: 14
  },
  
  rolePersona: 'engineering',
  selectedGoals: ['ci_cd_telemetry', 'api_monitoring'],
  
  stepStatuses: {
    identity: 'in_progress',
    persona: 'upcoming',
    integrations: 'upcoming',
    team: 'upcoming'
  },
  completedSteps: [],
  skippedSteps: [],
  delegatedSteps: {},
  completionPercentage: 20, // Endowed progress
  timeRemainingEstimate: '⏱ ~45s left',
  
  isEnriching: false,
  enrichedCompany: null,
  autoEnrichDismissed: false,
  
  isSampleDataActive: true,
  sampleDataRecords: [],
  
  dockCollapsed: false,
  activationMilestones: [
    { id: 'brand_workspace', title: 'Create & brand your workspace', completed: true },
    { id: 'select_template', title: 'Select your team workflow template', completed: true },
    { id: 'connect_slack', title: 'Connect Slack product notifications', completed: false },
    { id: 'install_sdk', title: 'Install Production SDK / Telemetry', completed: false, delegated: false, guideTourTarget: 'sdk-config-btn' },
    { id: 'first_rule', title: 'Create your first live automation rule', completed: false, guideTourTarget: 'new-automation-btn' }
  ],
  rewardClaimed: false,
  guidedTourActive: false,
  tourTargetElement: null,
  
  toastMessage: null,
  flyToDockAnimation: false,
  activeDelegationToken: null,

  setActiveView: (view) => set({ activeView: view }),
  setProgressStyle: (style) => set({ activeProgressStyle: style }),

  goToStep: (step) => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx !== -1) {
      set((state) => ({
        currentStepSlug: step,
        stepIndex: idx,
        timeRemainingEstimate: STEP_METADATA[step].defaultTimeEstimate,
        stepStatuses: {
          ...state.stepStatuses,
          [step]: state.stepStatuses[step] === 'completed' ? 'completed' : 'in_progress'
        }
      }));
    }
  },

  nextStep: () => {
    const { stepIndex } = get();
    if (stepIndex < STEP_ORDER.length - 1) {
      const nextSlug = STEP_ORDER[stepIndex + 1];
      get().goToStep(nextSlug);
    } else {
      // Finished all wizard steps! Enter main SaaS dashboard
      set({ activeView: 'dashboard' });
      // Trigger subtle celebration toast
      get().setToast({
        title: '🎉 Welcome to your workspace!',
        subtitle: 'Your customized SaaS environment is ready. Check the setup dock for next steps.',
        type: 'success'
      });
    }
  },

  prevStep: () => {
    const { stepIndex } = get();
    if (stepIndex > 0) {
      const prevSlug = STEP_ORDER[stepIndex - 1];
      get().goToStep(prevSlug);
    }
  },

  setWorkspaceDraft: (draft) => {
    set((state) => {
      const updated = { ...state.workspaceDraft, ...draft };
      if (draft.brandColor) {
        updateCssBrandVariables(draft.brandColor);
      }
      return { workspaceDraft: updated };
    });
  },

  setBrandColor: (color) => {
    updateCssBrandVariables(color);
    set((state) => ({
      workspaceDraft: { ...state.workspaceDraft, brandColor: color }
    }));
  },

  setRolePersona: (role) => {
    set({ rolePersona: role });
  },

  toggleGoal: (goalId) => {
    set((state) => {
      const exists = state.selectedGoals.includes(goalId);
      const goals = exists
        ? state.selectedGoals.filter((g) => g !== goalId)
        : [...state.selectedGoals, goalId];
      return { selectedGoals: goals };
    });
  },

  completeCurrentStep: () => {
    const { currentStepSlug, completedSteps, delegatedSteps } = get();
    const newCompleted = Array.from(new Set([...completedSteps, currentStepSlug]));
    const newPct = calculatePercentage(newCompleted, delegatedSteps);
    
    set((state) => ({
      completedSteps: newCompleted,
      completionPercentage: newPct,
      stepStatuses: {
        ...state.stepStatuses,
        [currentStepSlug]: 'completed'
      }
    }));

    // Post telemetry to backend asynchronously
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step_slug: currentStepSlug,
        event_type: 'step_completed',
        metadata: { percentage: newPct }
      })
    }).catch(() => {});

    get().nextStep();
  },

  skipCurrentStep: () => {
    const { currentStepSlug, skippedSteps, stepIndex } = get();
    const newSkipped = Array.from(new Set([...skippedSteps, currentStepSlug]));
    
    // Trigger the "Fly-To-Corner" animation
    set({ flyToDockAnimation: true });
    setTimeout(() => set({ flyToDockAnimation: false }), 650);

    set((state) => ({
      skippedSteps: newSkipped,
      stepStatuses: {
        ...state.stepStatuses,
        [currentStepSlug]: 'skipped'
      }
    }));

    // Notification informing user that step moved to in-app activation dock
    get().setToast({
      title: 'Saved to In-App Dock',
      subtitle: `"${STEP_METADATA[currentStepSlug].title}" can be completed anytime from your dashboard.`,
      type: 'info'
    });

    // Log telemetry
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step_slug: currentStepSlug,
        event_type: 'step_skipped'
      })
    }).catch(() => {});

    if (stepIndex === STEP_ORDER.length - 1) {
      set({ activeView: 'dashboard' });
    } else {
      get().nextStep();
    }
  },

  delegateCurrentStep: async (email, note) => {
    const { currentStepSlug, completedSteps, delegatedSteps } = get();
    const token = `tk_${Math.random().toString(36).substring(2, 10)}`;
    
    const newDelegated: DelegatedStepInfo = {
      email,
      token,
      status: 'pending',
      note
    };

    const updatedDelegatedMap = {
      ...delegatedSteps,
      [currentStepSlug]: newDelegated
    };

    const newPct = calculatePercentage(completedSteps, updatedDelegatedMap);

    set((state) => ({
      delegatedSteps: updatedDelegatedMap,
      completionPercentage: newPct,
      stepStatuses: {
        ...state.stepStatuses,
        [currentStepSlug]: 'delegated'
      },
      // Update activation milestones dock too
      activationMilestones: state.activationMilestones.map((m) =>
        m.id === 'install_sdk'
          ? { ...m, delegated: true, delegatedTo: email.split('@')[0] }
          : m
      )
    }));

    // Dispatch to backend API
    try {
      await fetch('/api/delegate-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step_slug: currentStepSlug,
          assignee_email: email,
          note
        })
      });
    } catch (e) {
      console.warn('API delegate step offline, synced locally', e);
    }

    get().setToast({
      title: '🤝 Step delegated to teammate!',
      subtitle: `Magic link dispatched to ${email}. You can proceed without waiting.`,
      type: 'delegated'
    });

    return token;
  },

  markDelegationComplete: (stepSlug, assigneeName) => {
    const { delegatedSteps, completedSteps } = get();
    const existing = delegatedSteps[stepSlug];
    if (existing) {
      const updatedDelegated = {
        ...delegatedSteps,
        [stepSlug]: {
          ...existing,
          status: 'completed' as const,
          completedBy: assigneeName,
          completedAt: new Date().toLocaleTimeString()
        }
      };

      const newCompleted = Array.from(new Set([...completedSteps, stepSlug as StepSlug]));
      const newPct = calculatePercentage(newCompleted, updatedDelegated);

      set((state) => ({
        delegatedSteps: updatedDelegated,
        completedSteps: newCompleted,
        completionPercentage: newPct,
        stepStatuses: {
          ...state.stepStatuses,
          [stepSlug]: 'completed'
        },
        activationMilestones: state.activationMilestones.map((m) =>
          m.id === 'install_sdk'
            ? { ...m, completed: true, delegated: false }
            : m
        )
      }));

      // Celebrate!
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.8 }
      });

      get().setToast({
        title: `🎉 ${assigneeName} just completed your setup!`,
        subtitle: `Your Production SDK / Telemetry connection is now live.`,
        type: 'success'
      });
    }
  },

  enrichDomain: async (emailOrDomain) => {
    set({ isEnriching: true });
    try {
      const res = await fetch(`/api/enrich-domain?domain=${encodeURIComponent(emailOrDomain)}`);
      const data = await res.json();
      if (data.enriched && data.data) {
        const enriched: EnrichedCompanyData = data.data;
        set((state) => ({
          isEnriching: false,
          enrichedCompany: enriched,
          autoEnrichDismissed: false,
          workspaceDraft: {
            ...state.workspaceDraft,
            name: enriched.name,
            slug: enriched.slug,
            domain: enriched.domain,
            brandColor: enriched.brandColor,
            logoUrl: enriched.logoUrl,
            industryTemplate: enriched.industry
          }
        }));
        updateCssBrandVariables(enriched.brandColor);
        return true;
      }
    } catch (e) {
      console.warn('Enrichment fetch failed', e);
    }
    set({ isEnriching: false });
    return false;
  },

  dismissEnrichment: () => {
    set({ autoEnrichDismissed: true });
  },

  toggleSampleData: async (enable) => {
    set((state) => ({
      isSampleDataActive: enable,
      workspaceDraft: { ...state.workspaceDraft, hasSampleData: enable }
    }));

    if (enable) {
      try {
        const res = await fetch('/api/sample-data/seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ industry: get().workspaceDraft.industryTemplate })
        });
        const data = await res.json();
        if (data.records) set({ sampleDataRecords: data.records });
      } catch (e) {}
    } else {
      get().purgeSampleData();
    }
  },

  purgeSampleData: async () => {
    try {
      await fetch('/api/sample-data/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    } catch (e) {}

    set((state) => ({
      isSampleDataActive: false,
      sampleDataRecords: [],
      workspaceDraft: { ...state.workspaceDraft, hasSampleData: false }
    }));

    get().setToast({
      title: '🧹 Sample Data Purged',
      subtitle: 'All demo records have been cleaned. Your workspace is now 100% production-ready.',
      type: 'info'
    });
  },

  toggleDockCollapsed: () => {
    set((state) => ({ dockCollapsed: !state.dockCollapsed }));
  },

  toggleMilestone: (id) => {
    set((state) => {
      const updated = state.activationMilestones.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m
      );
      const allCompleted = updated.every((m) => m.completed);
      if (allCompleted && !state.rewardClaimed) {
        setTimeout(() => get().triggerRewardUnlock(), 250);
      }
      return { activationMilestones: updated };
    });
  },

  startGuidedTour: (targetKey) => {
    set({
      guidedTourActive: true,
      tourTargetElement: targetKey,
      dockCollapsed: true
    });
    get().setToast({
      title: '⚡ Guided Tour Active',
      subtitle: 'The target action has been spotlighted on your dashboard.',
      type: 'info'
    });
  },

  dismissGuidedTour: () => {
    set({ guidedTourActive: false, tourTargetElement: null });
  },

  triggerRewardUnlock: () => {
    set((state) => ({
      rewardClaimed: true,
      workspaceDraft: {
        ...state.workspaceDraft,
        trialDaysLeft: 28 // Extended from 14d -> 28d!
      }
    }));

    // Trigger high-celebration confetti shower!
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });

    get().setToast({
      title: '🏆 100% Activation Complete! Reward Unlocked',
      subtitle: '+14 Days Free Pro Trial added to your workspace (Now 28 Days Left).',
      type: 'success'
    });
  },

  setToast: (toast) => {
    set({ toastMessage: toast });
    if (toast) {
      setTimeout(() => {
        if (get().toastMessage === toast) {
          set({ toastMessage: null });
        }
      }, 5000);
    }
  },

  initWebSocket: () => {
    if (typeof window === 'undefined') return;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'onboarding:step_completed') {
            get().markDelegationComplete(payload.step_slug, payload.assignee_name || 'Marcus');
          }
        } catch (e) {}
      };

      ws.onerror = () => {
        // Fallback gracefully without breaking UI
      };
    } catch (e) {}
  }
}));
