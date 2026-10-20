import React, { useState, useEffect } from 'react';
import { 
  X, 
  Server, 
  Layers, 
  Clock, 
  CheckCircle, 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Hash
} from 'lucide-react';
import { queueSimulator } from '../../services/queueSimulator';
import { useNotifications } from '../../context/NotificationContext';

export const QueueDiagnosticsDrawer = ({ isOpen, onClose }) => {
  const { connectionStatus, setConnectionStatus, wsLatencyMs } = useNotifications();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setJobs(queueSimulator.getJobs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const refreshJobs = () => {
    setJobs(queueSimulator.getJobs());
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-[#131418] border-l border-slate-200 dark:border-[#242730] shadow-2xl flex flex-col animate-fade-in text-slate-900 dark:text-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#242730] bg-slate-50 dark:bg-[#101217]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">BullMQ &amp; Delivery Engine Telemetry</h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Live Redis queues &amp; connection diagnostics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshJobs}
            title="Refresh jobs"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connection Mode Control */}
      <div className="p-4 bg-slate-100/70 dark:bg-[#191B20] border-b border-slate-200 dark:border-[#242730] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500'
                : connectionStatus === 'polling_fallback'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
          />
          <span className="font-semibold">Channel Transport:</span>
          <span className="font-mono text-slate-500">{connectionStatus} ({wsLatencyMs}ms)</span>
        </div>

        {/* Transport Mode Switcher */}
        <select
          value={connectionStatus}
          onChange={(e) => setConnectionStatus(e.target.value)}
          className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none"
        >
          <option value="connected">WebSocket (Real-Time)</option>
          <option value="polling_fallback">HTTP Long-Polling Fallback</option>
          <option value="disconnected">Offline / Reconnecting</option>
        </select>
      </div>

      {/* Queue Pipeline Cards */}
      <div className="p-6 border-b border-slate-200 dark:border-[#242730] grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <div className="text-slate-400 font-mono text-[10px]">queue: instant-dispatch</div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            Active (p99 &lt; 20ms)
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">WebSocket + Priority Auth</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <div className="text-slate-400 font-mono text-[10px]">queue: batch-aggregator</div>
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
            10m Window Buffer
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Fatigue Shield Rollups</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <div className="text-slate-400 font-mono text-[10px]">queue: escalation-fallback</div>
          <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">
            30m Timer Active
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Unread in-app fallback</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <div className="text-slate-400 font-mono text-[10px]">queue: digest-cron</div>
          <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">
            Circadian 08:30 AM
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Morning stack release</div>
        </div>
      </div>

      {/* Recent Jobs Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Recent Processed Jobs ({jobs.length})
        </h4>

        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 space-y-1.5 text-xs shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                {job.name}
              </span>
              <span className="font-mono text-[10px] text-slate-400">{job.timestamp}</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono">
                {job.queue}
              </span>
              <span>•</span>
              <span className="text-emerald-500 font-semibold">{job.latencyMs}ms</span>
              <span>•</span>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                {job.id}
              </span>
            </div>

            {job.dedupHash && (
              <div className="pt-1 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Hash className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{job.dedupHash}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
