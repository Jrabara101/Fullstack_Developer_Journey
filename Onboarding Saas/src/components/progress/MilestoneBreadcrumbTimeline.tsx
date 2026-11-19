import React from 'react';
import { useOnboardingStore, STEP_ORDER, STEP_METADATA } from '../../store/useOnboardingStore';
import { Check, Handshake, CornerDownRight } from 'lucide-react';

export const MilestoneBreadcrumbTimeline: React.FC = () => {
  const { currentStepSlug, completedSteps, delegatedSteps, rolePersona, goToStep } = useOnboardingStore();

  const getPersonaMilestoneName = (slug: string) => {
    if (slug === 'integrations') {
      if (rolePersona === 'founder') return 'Connect Stripe & BI';
      if (rolePersona === 'engineering') return 'Install SDK & Webhook';
      if (rolePersona === 'product') return 'Sync Linear & Figma';
      return 'Data & Telemetry';
    }
    if (slug === 'team') {
      if (rolePersona === 'founder') return 'Invite Core Executives';
      if (rolePersona === 'engineering') return 'Invite Tech Leads';
      return 'Invite Teammates';
    }
    return STEP_METADATA[slug as keyof typeof STEP_METADATA]?.title || slug;
  };

  return (
    <div className="w-full overflow-x-auto py-1">
      <div className="flex items-center min-w-max gap-2 text-xs">
        {STEP_ORDER.map((slug, idx) => {
          const isCompleted = completedSteps.includes(slug);
          const isCurrent = currentStepSlug === slug;
          const isDelegated = !!delegatedSteps[slug];
          const title = getPersonaMilestoneName(slug);

          return (
            <React.Fragment key={slug}>
              {idx > 0 && (
                <div
                  className={`w-6 h-0.5 transition-colors ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}

              <button
                onClick={() => goToStep(slug)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                  isCurrent
                    ? 'border-brand-custom bg-brand-light text-slate-900 font-semibold ring-1 ring-brand-ring'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300'
                    : isDelegated
                    ? 'border-violet-300 bg-violet-50 text-violet-700'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : isDelegated ? (
                  <Handshake className="w-3 h-3 text-violet-600" />
                ) : (
                  <span className="font-mono text-[10px] opacity-75">{idx + 1}</span>
                )}
                <span>{title}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
