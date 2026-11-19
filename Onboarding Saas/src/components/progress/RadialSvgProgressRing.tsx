import React from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';

interface Props {
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
}

export const RadialSvgProgressRing: React.FC<Props> = ({
  size = 44,
  strokeWidth = 4,
  showText = true
}) => {
  const { completionPercentage } = useOnboardingStore();
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressRingGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            fill="transparent"
          />
          <defs>
            <linearGradient id="progressRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--workspace-brand, #4F46E5)" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center percentage label */}
        <span className="absolute text-[11px] font-bold font-mono font-tabular text-slate-800 dark:text-slate-200">
          {completionPercentage}%
        </span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {completionPercentage}% Complete
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium font-mono">
            {completionPercentage >= 100 ? '🎉 All Set!' : '✨ Endowed Momentum'}
          </span>
        </div>
      )}
    </div>
  );
};
