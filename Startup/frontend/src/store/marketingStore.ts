import { create } from 'zustand';
import { PersonaLens, BillingInterval, PlanTierId, VerifiedTestimonial, QuoteRecord } from '../types/index.js';

interface MarketingState {
  // Persona & Lens
  activePersonaLens: PersonaLens;
  visitedPersonas: PersonaLens[];
  setActivePersonaLens: (lens: PersonaLens) => void;

  // Billing & Usage Sliders
  billingInterval: BillingInterval;
  setBillingInterval: (interval: BillingInterval) => void;
  seats: number;
  setSeats: (seats: number) => void;
  eventsK: number;
  setEventsK: (eventsK: number) => void;
  selectedPlan: PlanTierId;
  setSelectedPlan: (plan: PlanTierId) => void;

  // Scrubber Progress (Chaos vs Clarity)
  chaosScrubberProgress: number;
  setChaosScrubberProgress: (progress: number) => void;

  // Interactive Hero Product Sandbox State
  activeSandboxTab: 'workflows' | 'edge-mesh' | 'observability' | 'vault';
  setActiveSandboxTab: (tab: 'workflows' | 'edge-mesh' | 'observability' | 'vault') => void;
  sandboxToggles: {
    zeroDowntimeCanary: boolean;
    edgeAiCache: boolean;
    databaseBranching: boolean;
    soc2AuditTrail: boolean;
  };
  toggleSandboxFeature: (feature: keyof MarketingState['sandboxToggles']) => void;
  sandboxTerminalLogs: string[];
  addTerminalLog: (log: string) => void;
  clearTerminalLogs: () => void;
  sandboxActionsCount: number;
  incrementSandboxAction: () => void;

  // Real-time Workspace Claim
  workspaceSlugInput: string;
  setWorkspaceSlugInput: (slug: string) => void;

  // Modals & Drawers
  isCommandKOpen: boolean;
  setIsCommandKOpen: (open: boolean) => void;
  isCfoModalOpen: boolean;
  setIsCfoModalOpen: (open: boolean) => void;
  isEnterpriseModalOpen: boolean;
  setIsEnterpriseModalOpen: (open: boolean) => void;
  isBlueprintDrawerOpen: boolean;
  setIsBlueprintDrawerOpen: (open: boolean) => void;
  activeBlueprintTestimonial: VerifiedTestimonial | null;
  setActiveBlueprintTestimonial: (t: VerifiedTestimonial | null) => void;

  // Quotes
  activeQuote: QuoteRecord | null;
  setActiveQuote: (quote: QuoteRecord | null) => void;

  // Session Duration
  sessionStartTime: number;
}

export const useMarketingStore = create<MarketingState>((set, get) => ({
  activePersonaLens: 'founder',
  visitedPersonas: ['founder'],
  setActivePersonaLens: (lens) => {
    const current = get().visitedPersonas;
    const updated = current.includes(lens) ? current : [...current, lens];
    set({
      activePersonaLens: lens,
      visitedPersonas: updated,
      sandboxActionsCount: get().sandboxActionsCount + 1
    });
  },

  billingInterval: 'annual',
  setBillingInterval: (interval) => set({ billingInterval: interval }),
  seats: 12,
  setSeats: (seats) => set({ seats }),
  eventsK: 250,
  setEventsK: (eventsK) => set({ eventsK }),
  selectedPlan: 'pro',
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),

  chaosScrubberProgress: 50,
  setChaosScrubberProgress: (progress) => set({ chaosScrubberProgress: progress }),

  activeSandboxTab: 'workflows',
  setActiveSandboxTab: (tab) => {
    set({ activeSandboxTab: tab });
    get().incrementSandboxAction();
  },

  sandboxToggles: {
    zeroDowntimeCanary: true,
    edgeAiCache: true,
    databaseBranching: false,
    soc2AuditTrail: true
  },
  toggleSandboxFeature: (feature) => {
    const current = get().sandboxToggles;
    const nextVal = !current[feature];
    set({
      sandboxToggles: {
        ...current,
        [feature]: nextVal
      }
    });
    get().incrementSandboxAction();
    get().addTerminalLog(
      `[CONFIG] Feature "${feature}" toggled -> ${nextVal ? 'ENABLED (active)' : 'DISABLED'}`
    );
  },

  sandboxTerminalLogs: [
    '✓ Edge mesh initial sync complete (35 global regions)',
    '✓ Environment snapshot branch #preview-feat-42 verified',
    '● Zero-downtime canary traffic gate listening on port 443',
    '⚡ Median global P99 latency: 11.4ms (Healthy)'
  ],
  addTerminalLog: (log) => {
    set((state) => ({
      sandboxTerminalLogs: [
        ...state.sandboxTerminalLogs.slice(-14),
        `[${new Date().toLocaleTimeString()}] ${log}`
      ]
    }));
  },
  clearTerminalLogs: () => set({ sandboxTerminalLogs: [] }),
  sandboxActionsCount: 4,
  incrementSandboxAction: () => set((state) => ({ sandboxActionsCount: state.sandboxActionsCount + 1 })),

  workspaceSlugInput: '',
  setWorkspaceSlugInput: (slug) => set({ workspaceSlugInput: slug }),

  isCommandKOpen: false,
  setIsCommandKOpen: (open) => set({ isCommandKOpen: open }),
  isCfoModalOpen: false,
  setIsCfoModalOpen: (open) => set({ isCfoModalOpen: open }),
  isEnterpriseModalOpen: false,
  setIsEnterpriseModalOpen: (open) => set({ isEnterpriseModalOpen: open }),
  isBlueprintDrawerOpen: false,
  setIsBlueprintDrawerOpen: (open) => set({ isBlueprintDrawerOpen: open }),
  activeBlueprintTestimonial: null,
  setActiveBlueprintTestimonial: (t) => set({ activeBlueprintTestimonial: t, isBlueprintDrawerOpen: !!t }),

  activeQuote: null,
  setActiveQuote: (quote) => set({ activeQuote: quote }),

  sessionStartTime: Date.now()
}));
