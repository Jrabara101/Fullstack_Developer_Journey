import React, { useState } from 'react';
import { 
  Activity, 
  Terminal, 
  Sparkles, 
  RotateCcw, 
  AlertTriangle, 
  Sliders, 
  Radio,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useSocialGraph } from '../context/SocialGraphContext';

export function EventLogTicker() {
  const { 
    eventLogs, 
    simulateNetworkFailure, 
    setSimulateNetworkFailure, 
    networkLatencyMs, 
    setNetworkLatencyMs,
    resetGraphData 
  } = useSocialGraph();

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl glass-panel border border-slate-800 shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>REALTIME EVENT BROKER</span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Postgres pg_notify & WebSocket Stream
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
          >
            <span>{isExpanded ? 'Collapse' : 'Logs (' + eventLogs.length + ')'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Network Diagnostics & Testing Controls */}
      <div className="p-3 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between flex-wrap gap-3 text-xs">
        {/* Optimistic Failure Simulation Switch */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={simulateNetworkFailure}
            onChange={(e) => setSimulateNetworkFailure(e.target.checked)}
            className="w-4 h-4 rounded text-rose-500 bg-slate-800 border-slate-700 focus:ring-rose-500"
          />
          <span className={`text-[11px] font-semibold ${simulateNetworkFailure ? 'text-rose-400' : 'text-slate-400'}`}>
            Simulate Network Failure (Tests Optimistic Rollback)
          </span>
        </label>

        {/* Latency Slider */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Sliders className="w-3 h-3 text-indigo-400" />
          <span>Latency:</span>
          <input
            type="range"
            min="50"
            max="1200"
            step="50"
            value={networkLatencyMs}
            onChange={(e) => setNetworkLatencyMs(Number(e.target.value))}
            className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="font-mono text-indigo-300">{networkLatencyMs}ms</span>
        </div>

        {/* Reset Graph */}
        <button
          onClick={resetGraphData}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
          title="Reset graph to default initial connections"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>Reset Graph</span>
        </button>
      </div>

      {/* Event Logs View */}
      {isExpanded ? (
        <div className="p-3 space-y-2 max-h-48 overflow-y-auto font-mono text-[11px] divide-y divide-slate-800/40">
          {eventLogs.map((log) => (
            <div key={log.id} className="pt-2 pb-1 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold ${
                    log.color === 'gold' ? 'text-amber-400' :
                    log.color === 'rose' ? 'text-rose-400' :
                    log.color === 'purple' ? 'text-purple-400' :
                    log.color === 'amber' ? 'text-amber-400' : 'text-indigo-400'
                  }`}>
                    {log.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">[{log.type}]</span>
                </div>
                <p className="text-slate-300 text-[11px] truncate mt-0.5">
                  {log.details}
                </p>
              </div>

              <span className="text-[10px] text-slate-500 shrink-0">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* Single Line Ticker when collapsed */
        <div className="px-3 py-2 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 truncate text-slate-300">
            <span className="text-amber-400">● LATEST:</span>
            <span className="truncate">{eventLogs[0]?.title} — {eventLogs[0]?.details}</span>
          </div>
          <span className="text-slate-500 text-[10px] ml-2 shrink-0">{eventLogs[0]?.timestamp}</span>
        </div>
      )}
    </div>
  );
}
