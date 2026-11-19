import React, { useState } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import {
  Check,
  ChevronUp,
  ChevronDown,
  Gift,
  Trophy,
  Zap,
  Handshake,
  RotateCw,
  ExternalLink,
  Sparkles,
  X
} from 'lucide-react';

export const DashboardActivationWidget: React.FC = () => {
  const {
    dockCollapsed,
    toggleDockCollapsed,
    activationMilestones,
    toggleMilestone,
    startGuidedTour,
    rewardClaimed,
    workspaceDraft,
    markDelegationComplete
  } = useOnboardingStore();

  const [reminded, setReminded] = useState(false);

  const completedCount = activationMilestones.filter((m) => m.completed).length;
  const totalCount = activationMilestones.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const handleRemindTeammate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReminded(true);
    setTimeout(() => {
      // Simulate teammate completing it
      markDelegationComplete('install_sdk', 'Marcus (Staff Eng)');
    }, 1800);
  };

  // SVG ring calculations
  const size = 36;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="fixed bottom-5 right-5 z-40 w-88 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Capsule Header (Click to toggle expand/collapse) */}
      <div
        onClick={toggleDockCollapsed}
        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          {/* Radial Ring or Trophy */}
          {rewardClaimed ? (
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold text-base shadow-xs animate-bounce">
              🏆
            </div>
          ) : (
            <div className="relative inline-flex items-center justify-center w-9 h-9">
              <svg width={size} height={size} className="transform -rotate-90">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-slate-100 dark:text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="var(--workspace-brand, #4F46E5)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[10px] font-bold font-mono text-slate-800 dark:text-slate-200">
                {percentage}%
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Getting Started
              </h4>
              {rewardClaimed && (
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 px-1.5 py-0.2 rounded font-semibold">
                  Unlocked!
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {completedCount} of {totalCount} completed • 🎁 +14d Pro Trial
            </p>
          </div>
        </div>

        <button
          type="button"
          className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700"
        >
          {dockCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Checklist Drawer */}
      {!dockCollapsed && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3 max-h-96 overflow-y-auto">
          {/* Reward Incentive Banner */}
          <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-pink-50/60 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/20 p-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <Gift className="w-4 h-4 text-brand-custom shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  {rewardClaimed ? '🎉 Pro Trial Reward Activated!' : '🎁 Activation Trial Booster'}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block leading-relaxed">
                  {rewardClaimed
                    ? 'Your workspace trial has been extended to 28 Days Left ($120 Value).'
                    : 'Complete all 5 milestones to unlock 14 extra days of Pro ($120 value) for your team.'}
                </span>
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            {activationMilestones.map((item, idx) => {
              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border transition-all text-xs ${
                    item.completed
                      ? 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 line-through'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleMilestone(item.id)}
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                          item.completed
                            ? 'bg-emerald-500 text-white'
                            : 'border border-slate-300 dark:border-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <span className="truncate font-medium">{item.title}</span>
                    </div>

                    {/* Specific Action or Badge */}
                    {!item.completed && item.delegated && (
                      <button
                        type="button"
                        onClick={handleRemindTeammate}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 hover:bg-violet-200 flex items-center gap-1 shrink-0"
                      >
                        <RotateCw className="w-2.5 h-2.5" />
                        <span>{reminded ? 'Ping Sent!' : `Sent to @${item.delegatedTo || 'marcus'}`}</span>
                      </button>
                    )}

                    {!item.completed && item.guideTourTarget && !item.delegated && (
                      <button
                        type="button"
                        onClick={() => startGuidedTour(item.guideTourTarget!)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-custom text-white hover:opacity-90 flex items-center gap-1 shrink-0 shadow-2xs"
                      >
                        <Zap className="w-2.5 h-2.5" />
                        <span>Guided Tour →</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dismiss button when reward claimed */}
          {rewardClaimed && (
            <button
              type="button"
              onClick={toggleDockCollapsed}
              className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500 hover:text-slate-800 text-center font-medium transition-colors"
            >
              Dismiss Activation Checklist
            </button>
          )}
        </div>
      )}
    </div>
  );
};
