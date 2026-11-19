import React, { useEffect } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import type { RolePersona } from '../../types';
import {
  Code2,
  Briefcase,
  Layers,
  LineChart,
  Check,
  Zap,
  Terminal,
  Activity,
  GitBranch,
  ShieldAlert,
  Users
} from 'lucide-react';

interface PersonaCardDef {
  id: RolePersona;
  hotkey: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  goals: Array<{ id: string; label: string; icon: React.ElementType }>;
}

const PERSONAS: PersonaCardDef[] = [
  {
    id: 'engineering',
    hotkey: '1',
    title: 'Software Engineer / Architecture',
    subtitle: 'CI/CD webhooks, SDK telemetry, API latency monitoring & issue sync.',
    badge: 'Unlocks: GitHub App + SDK Quickstart',
    icon: Code2,
    goals: [
      { id: 'ci_cd_telemetry', label: 'Monitor CI/CD Pipelines & Deployments', icon: GitBranch },
      { id: 'api_monitoring', label: 'Track API Latency & p99 Errors', icon: Activity },
      { id: 'sdk_integration', label: 'Install Telemetry SDK in Production', icon: Terminal }
    ]
  },
  {
    id: 'founder',
    hotkey: '2',
    title: 'Founder / Executive',
    subtitle: 'Run-rate metrics, board-level KPI dashboards, runway & investor updates.',
    badge: 'Tailors: ARR Gauges + Executive Views',
    icon: Briefcase,
    goals: [
      { id: 'arr_tracking', label: 'Real-time ARR & Net Dollar Retention', icon: LineChart },
      { id: 'team_activation', label: 'Team Setup & Activation Velocity', icon: Users },
      { id: 'delegated_setup', label: 'Delegate Technical Integrations', icon: Zap }
    ]
  },
  {
    id: 'product',
    hotkey: '3',
    title: 'Product & Design Lead',
    subtitle: 'User journey mapping, feature delivery velocity & Figma handoff workflows.',
    badge: 'Unlocks: Linear Sync + Sprint Kanban',
    icon: Layers,
    goals: [
      { id: 'feature_delivery', label: 'Sprint Roadmaps & Milestone Velocity', icon: Layers },
      { id: 'figma_sync', label: 'Figma Component & Design Handoffs', icon: Zap },
      { id: 'user_funnel', label: 'Activation & Onboarding Analytics', icon: Activity }
    ]
  },
  {
    id: 'operations',
    hotkey: '4',
    title: 'Operations & RevOps',
    subtitle: 'Pipeline velocity, CRM enrichment, billing health & compliance audits.',
    badge: 'Unlocks: CRM Hub + Conversion Stream',
    icon: LineChart,
    goals: [
      { id: 'crm_stream', label: 'Inbound Lead Velocity & Conversion', icon: LineChart },
      { id: 'billing_health', label: 'Dispute & Payment Failure Protection', icon: ShieldAlert },
      { id: 'automation_rules', label: 'Automate Repetitive Team Hand-offs', icon: Zap }
    ]
  }
];

export const Step2PersonaAndGoals: React.FC = () => {
  const { rolePersona, setRolePersona, selectedGoals, toggleGoal, setWorkspaceDraft } = useOnboardingStore();

  // Listen to keyboard hotkeys [1] - [4]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key;
      const found = PERSONAS.find((p) => p.hotkey === key);
      if (found) {
        setRolePersona(found.id);
        if (found.id === 'founder') setWorkspaceDraft({ industryTemplate: 'fintech' });
        if (found.id === 'engineering') setWorkspaceDraft({ industryTemplate: 'saas' });
        if (found.id === 'product') setWorkspaceDraft({ industryTemplate: 'agency' });
        if (found.id === 'operations') setWorkspaceDraft({ industryTemplate: 'ecommerce' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setRolePersona, setWorkspaceDraft]);

  const activePersonaObj = PERSONAS.find((p) => p.id === rolePersona) || PERSONAS[0];

  const handleSelectPersona = (p: PersonaCardDef) => {
    setRolePersona(p.id);
    if (p.id === 'founder') setWorkspaceDraft({ industryTemplate: 'fintech' });
    if (p.id === 'engineering') setWorkspaceDraft({ industryTemplate: 'saas' });
    if (p.id === 'product') setWorkspaceDraft({ industryTemplate: 'agency' });
    if (p.id === 'operations') setWorkspaceDraft({ industryTemplate: 'ecommerce' });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          How will you primarily use Acme Studio?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          We'll dynamically tailor your default workspace views, metrics, and shortcuts. You can change this anytime.
        </p>
      </div>

      {/* Interactive 4-Card Persona Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {PERSONAS.map((item) => {
          const isSelected = rolePersona === item.id;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => handleSelectPersona(item)}
              role="button"
              tabIndex={0}
              className={`rounded-xl border p-4 cursor-pointer transition-all flex flex-col justify-between text-left group relative ${
                isSelected
                  ? 'border-brand-custom bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-brand-custom shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top Row: Icon + Hotkey pill */}
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-brand-custom text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:text-brand-custom'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 text-[11px] font-mono font-medium text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {item.hotkey}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>

              {/* Bottom Chip */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] font-medium font-mono text-brand-custom">
                  {item.badge}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-brand-custom text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Sub-Goals for Selected Persona */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
          Select Key Focus Areas for your {activePersonaObj.title}:
        </label>
        <div className="space-y-2">
          {activePersonaObj.goals.map((goal) => {
            const isChecked = selectedGoals.includes(goal.id);
            const GoalIcon = goal.icon;
            return (
              <div
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs font-medium ${
                  isChecked
                    ? 'border-brand-custom bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      isChecked ? 'bg-brand-custom text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    <GoalIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>{goal.label}</span>
                </div>

                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'bg-brand-custom border-brand-custom text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
