import React from 'react';
import { useOnboardingStore, STEP_ORDER, STEP_METADATA, type StepSlug } from '../../store/useOnboardingStore';
import { Check, ArrowRight, Handshake, ArrowUpRight } from 'lucide-react';

export const SegmentedPillTrack: React.FC = () => {
  const { currentStepSlug, stepStatuses, completedSteps, delegatedSteps, skippedSteps, goToStep } = useOnboardingStore();

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2.5">
        {STEP_ORDER.map((slug, idx) => {
          const isCompleted = completedSteps.includes(slug);
          const isCurrent = currentStepSlug === slug;
          const isDelegated = !!delegatedSteps[slug];
          const isSkipped = skippedSteps.includes(slug);
          const meta = STEP_METADATA[slug];

          // Determine track bar style
          let barClasses = 'h-1.5 rounded-full transition-all duration-300 ';
          let labelText = `${idx + 1}. ${meta.title.split(' ')[0]}`;
          let statusBadge = null;

          if (isCompleted) {
            barClasses += 'bg-emerald-500 shadow-sm shadow-emerald-500/20';
            statusBadge = <Check className="w-3 h-3 text-emerald-600 inline mr-1" />;
          } else if (isCurrent) {
            barClasses += 'bg-brand-custom ring-2 ring-brand-ring animate-pulse-subtle';
            statusBadge = <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-custom mr-1.5"></span>;
          } else if (isDelegated) {
            barClasses += 'bg-violet-500/70 border border-dashed border-violet-400';
            statusBadge = <Handshake className="w-3 h-3 text-violet-500 inline mr-1" />;
          } else if (isSkipped) {
            barClasses += 'bg-amber-400/80';
            statusBadge = <ArrowUpRight className="w-3 h-3 text-amber-500 inline mr-1" />;
          } else {
            barClasses += 'bg-slate-200 dark:bg-slate-700/60';
          }

          return (
            <button
              key={slug}
              onClick={() => goToStep(slug)}
              className="group text-left focus:outline-none"
              title={`Jump to ${meta.title}`}
            >
              <div className={barClasses} />
              <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium font-tabular transition-colors">
                <span
                  className={
                    isCurrent
                      ? 'text-slate-900 font-semibold'
                      : isCompleted
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : isDelegated
                      ? 'text-violet-600'
                      : isSkipped
                      ? 'text-amber-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }
                >
                  {statusBadge}
                  {labelText}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
