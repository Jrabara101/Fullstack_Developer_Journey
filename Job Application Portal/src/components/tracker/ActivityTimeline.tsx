import React from 'react';
import { Eye, CheckCircle2, UserCheck, Calendar, ArrowRight, Clock } from 'lucide-react';
import { StageEvent } from '../../types/index.ts';

interface ActivityTimelineProps {
  events: StageEvent[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events }) => {
  return (
    <div className="rounded-2xl border border-divider-light dark:border-divider-dark bg-surface-elevated-light dark:bg-surface-elevated-dark p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-divider-light dark:border-divider-dark pb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Verified Activity Pulse
        </h4>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Zero Ghosting
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-divider-light dark:before:bg-divider-dark">
        {events.map((evt, i) => {
          const isViewEvent = evt.publicMessage.includes('reviewed') || evt.publicMessage.includes('👁');
          const isAdvance = evt.toStage && !isViewEvent;

          return (
            <div key={evt.id || i} className="relative group text-xs">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] border ${
                  isViewEvent
                    ? 'bg-blue-500 border-blue-600 text-white shadow-xs'
                    : isAdvance
                    ? 'bg-emerald-500 border-emerald-600 text-white'
                    : 'bg-surface-elevated-light dark:bg-surface-elevated-dark border-divider-light dark:border-divider-dark text-slate-500'
                }`}
              >
                {isViewEvent ? <Eye className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
              </div>

              {/* Timestamp */}
              <p className="text-[11px] font-mono text-slate-400 tabular-nums">
                {new Date(evt.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>

              {/* Message */}
              <p className="mt-1 font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {evt.publicMessage}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
