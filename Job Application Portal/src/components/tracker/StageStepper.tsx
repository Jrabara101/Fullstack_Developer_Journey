import React from 'react';
import { Check, Clock, Calendar, Sparkles } from 'lucide-react';

interface StageStepperProps {
  currentStageIndex: number;
  stages: string[];
  status: string;
}

export const StageStepper: React.FC<StageStepperProps> = ({
  currentStageIndex,
  stages,
  status
}) => {
  const isRejected = status === 'rejected';
  const isWithdrawn = status === 'withdrawn';
  const isOffer = status === 'offer_extended' || status === 'hired';

  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="min-w-[650px] flex items-center justify-between relative">
        {/* Track Line behind */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-brand-600 transition-all duration-700 -z-0"
          style={{
            width: `${Math.min(100, (currentStageIndex / (stages.length - 1)) * 100)}%`
          }}
        />

        {stages.map((stageName, index) => {
          const isCompleted = index < currentStageIndex || isOffer;
          const isCurrent = index === currentStageIndex && !isRejected && !isWithdrawn;
          const isFuture = index > currentStageIndex && !isOffer;

          return (
            <div key={index} className="flex flex-col items-center text-center relative z-10 group">
              {/* Stepper Node Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-brand-600 text-white ring-4 ring-brand-500/30 shadow-md scale-110'
                    : 'bg-surface-elevated-light dark:bg-surface-elevated-dark border-2 border-divider-light dark:border-divider-dark text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                  </span>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Stage Label */}
              <div className="mt-2.5 max-w-[110px]">
                <p
                  className={`text-xs font-medium leading-tight ${
                    isCurrent
                      ? 'text-brand-600 dark:text-brand-400 font-bold'
                      : isCompleted
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {stageName}
                </p>
                {isCurrent && (
                  <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
                    Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
