import React from 'react';
import { TableAlert } from '../../types/game.js';
import { ShieldAlert, Trophy, Flame, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface AlertToastProps {
  alerts: TableAlert[];
  errorMessage: string | null;
}

export const AlertToast: React.FC<AlertToastProps> = ({ alerts, errorMessage }) => {
  return (
    <div className="fixed top-14 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {/* Error message from server */}
      {errorMessage && (
        <div className="bg-red-950/95 border-2 border-red-500 text-white p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3 pointer-events-auto animate-in slide-in-from-top duration-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-black uppercase tracking-wider font-mono text-red-200">
              Action Rejected
            </span>
            <span className="text-xs text-red-100 font-medium mt-0.5">
              {errorMessage}
            </span>
          </div>
        </div>
      )}

      {/* Table alerts */}
      {alerts.map((alert) => {
        const isWin = alert.type === 'win';
        const isBluff = alert.type === 'bluff';

        return (
          <div
            key={alert.id}
            className={cn(
              "p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3 pointer-events-auto border animate-in slide-in-from-right duration-300",
              isWin
                ? "bg-amber-950/95 border-amber-400 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                : isBluff
                ? "bg-rose-950/95 border-rose-500 text-rose-100 shadow-[0_0_25px_rgba(239,35,60,0.5)]"
                : "bg-slate-900/95 border-slate-700 text-slate-100"
            )}
          >
            {isWin ? (
              <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : isBluff ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Flame className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            )}

            <div className="flex flex-col text-left">
              <span className="text-xs font-black uppercase tracking-wider font-mono">
                {alert.message}
              </span>
              {alert.subText && (
                <span className="text-xs opacity-90 mt-0.5 font-sans">
                  {alert.subText}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
