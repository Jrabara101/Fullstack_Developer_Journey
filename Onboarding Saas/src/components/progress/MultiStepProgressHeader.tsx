import React from 'react';
import { useOnboardingStore, STEP_ORDER, STEP_METADATA } from '../../store/useOnboardingStore';
import { SegmentedPillTrack } from './SegmentedPillTrack';
import { RadialSvgProgressRing } from './RadialSvgProgressRing';
import { MilestoneBreadcrumbTimeline } from './MilestoneBreadcrumbTimeline';
import { Sparkles, Clock, Layers, CircleDot, GitBranch } from 'lucide-react';

export const MultiStepProgressHeader: React.FC = () => {
  const {
    currentStepSlug,
    stepIndex,
    completionPercentage,
    timeRemainingEstimate,
    workspaceDraft,
    activeProgressStyle,
    setProgressStyle
  } = useOnboardingStore();

  const currentMeta = STEP_METADATA[currentStepSlug];
  const totalSteps = STEP_ORDER.length;

  return (
    <div className="w-full pb-5 mb-4 border-b border-divider-light dark:border-divider-dark">
      {/* Top Metadata Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
        {/* Left: Brand Monogram + Step Pill */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs transition-colors"
            style={{ backgroundColor: workspaceDraft.brandColor }}
          >
            {workspaceDraft.name.slice(0, 2).toUpperCase() || 'AC'}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Step {currentMeta.number} of 0{totalSteps}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              {currentMeta.title}
            </span>
          </div>
        </div>

        {/* Center: Style switcher pill */}
        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60 text-[11px]">
          <button
            onClick={() => setProgressStyle('segmented')}
            title="Segmented Pill Track"
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
              activeProgressStyle === 'segmented'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Pills</span>
          </button>
          <button
            onClick={() => setProgressStyle('radial')}
            title="Radial SVG Ring"
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
              activeProgressStyle === 'radial'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CircleDot className="w-3 h-3" />
            <span>Radial</span>
          </button>
          <button
            onClick={() => setProgressStyle('milestones')}
            title="Milestone Timeline"
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
              activeProgressStyle === 'milestones'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitBranch className="w-3 h-3" />
            <span>Branched</span>
          </button>
        </div>

        {/* Right: Time-to-Value Chip + Endowed Progress Readout */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{timeRemainingEstimate}</span>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-bold font-mono font-tabular text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full border border-emerald-500/20">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>{completionPercentage}% Done</span>
          </div>
        </div>
      </div>

      {/* Selected Indicator Track */}
      <div className="mt-1">
        {activeProgressStyle === 'segmented' && <SegmentedPillTrack />}
        {activeProgressStyle === 'radial' && (
          <div className="py-1 flex items-center justify-between">
            <RadialSvgProgressRing size={40} strokeWidth={3.5} showText={true} />
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Endowed Momentum</span>
              <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                Step {stepIndex + 1} of {totalSteps} Active
              </span>
            </div>
          </div>
        )}
        {activeProgressStyle === 'milestones' && <MilestoneBreadcrumbTimeline />}
      </div>
    </div>
  );
};
