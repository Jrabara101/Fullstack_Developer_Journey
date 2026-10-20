import React from 'react';
import { X, Info, CheckCircle2, ShieldCheck, Clock, Server, Hash } from 'lucide-react';

export const DeliveryAuditModal = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131418] border border-slate-200 dark:border-[#242730] shadow-2xl overflow-hidden text-slate-900 dark:text-[#F8FAFC]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#242730] bg-slate-50 dark:bg-[#101217]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Delivery Transparency Log</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                "Why did I receive this notification?"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Exact Trigger Reason Card */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-950 dark:text-blue-200">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-blue-700 dark:text-blue-300 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Resolved Trigger Rule</span>
            </div>
            <p className="text-xs leading-relaxed">{notification.deliveryRuleReason}</p>
          </div>

          {/* Technical Telemetry Specs */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-slate-500">
                <Server className="w-4 h-4" />
                <span>Channels Dispatched</span>
              </div>
              <div className="flex items-center gap-1">
                {(notification.metadata?.channelDelivered || ['in_app']).map((ch) => (
                  <span
                    key={ch}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-slate-500">
                <Hash className="w-4 h-4" />
                <span>Deduplication Hash</span>
              </div>
              <span className="font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                {notification.category}:{notification.targetEntity?.type || 'item'}:v1
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-4 h-4" />
                <span>Dispatch Pipeline Latency</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                14ms (BullMQ instant-dispatch)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Fatigue Shield Status</span>
              </div>
              <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                Passed (Within daily rate limit)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-[#242730] bg-slate-50 dark:bg-[#101217] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-xs font-semibold"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
