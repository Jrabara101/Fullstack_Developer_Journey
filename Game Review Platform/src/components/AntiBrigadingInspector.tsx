import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AntiBrigadeReport } from '../types';
import { toggleQuarantine } from '../lib/api';
import { ShieldCheck, ShieldAlert, AlertTriangle, X, Check, Activity, RefreshCw } from 'lucide-react';

interface AntiBrigadingInspectorProps {
  report: AntiBrigadeReport;
  isOpen: boolean;
  onClose: () => void;
}

export const AntiBrigadingInspector: React.FC<AntiBrigadingInspectorProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: ({ gameId, patchVersion }: { gameId: string; patchVersion: string }) =>
      toggleQuarantine(gameId, patchVersion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', report.gameId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', report.gameId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-[#0D111C] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#10141F]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-display font-bold text-white text-base tracking-wide">
                Authoritative Anti-Brigading Ledger
              </h2>
              <span className="text-xs font-mono text-slate-400">
                Auditing {report.gameTitle} rating velocity
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Key Metrics Comparison Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#151B2B] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">
                Organic Score (Verified)
              </span>
              <div className="flex items-baseline gap-1 text-2xl font-mono font-extrabold text-emerald-400">
                <span>{report.organicRating.toFixed(1)}</span>
                <span className="text-xs text-emerald-500">★</span>
              </div>
            </div>

            <div className="bg-[#151B2B] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">
                Unfiltered Raw Score
              </span>
              <div className="flex items-baseline gap-1 text-2xl font-mono font-extrabold text-slate-400">
                <span>{report.unfilteredRating.toFixed(1)}</span>
                <span className="text-xs text-slate-500">★</span>
              </div>
            </div>

            <div className="bg-[#151B2B] border border-slate-800 rounded-xl p-3.5 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">
                Quarantine Shield
              </span>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold mt-1 ${
                  report.activeQuarantine
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {report.activeQuarantine ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>ACTIVE</span>
                  </>
                ) : (
                  <span>INACTIVE</span>
                )}
              </div>
            </div>
          </div>

          {/* Telemetry Verdict Notice */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <Activity className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-white block mb-0.5">
                Velocity Anomaly Detection Engine
              </span>
              <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                {report.recommendation}
              </p>
            </div>
          </div>

          {/* Time-Series & Patch Velocity Breakdown Table */}
          <div>
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
              Patch Window Velocity Telemetry
            </h4>

            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#10141F] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Patch</th>
                    <th className="py-2.5 px-3">Reviews</th>
                    <th className="py-2.5 px-3">Mean</th>
                    <th className="py-2.5 px-3">Z-Score</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-[#07090E]">
                  {report.flaggedSpikes.map((spike) => {
                    const isSpike = spike.zScore >= 3.0 || spike.status === 'SURGE_FLAGGED' || spike.status === 'QUARANTINED';
                    return (
                      <tr key={spike.patchVersion} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-cyan-400">
                          {spike.patchVersion}
                        </td>
                        <td className="py-3 px-3 text-white">
                          {spike.count}
                        </td>
                        <td className="py-3 px-3 text-amber-400">
                          {spike.meanRating.toFixed(1)} ★
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={
                              isSpike ? 'text-rose-400 font-bold' : 'text-slate-400'
                            }
                          >
                            +{spike.zScore}σ
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {spike.status === 'QUARANTINED' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                              QUARANTINED
                            </span>
                          ) : spike.status === 'SURGE_FLAGGED' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-500/40">
                              BOMB SURGE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                              NORMAL
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              toggleMutation.mutate({
                                gameId: report.gameId,
                                patchVersion: spike.patchVersion,
                              })
                            }
                            disabled={toggleMutation.isPending}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-all ${
                              spike.status === 'QUARANTINED'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-500'
                            }`}
                          >
                            {spike.status === 'QUARANTINED' ? 'Unquarantine' : 'Quarantine'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
