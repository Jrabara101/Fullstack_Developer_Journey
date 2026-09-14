import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, X } from 'lucide-react';

export default function IncidentAlertBanner({ onTriage, onDismiss, isVisible = true }) {
  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-r-xl p-3.5 shadow-sm mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur-sm bg-surface-container-lowest/80">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-700 flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-white">
              P1 Incident
            </span>
            <span className="font-semibold text-sm text-on-surface">
              Cluster eu-central-1 Latency Elevation (+142ms)
            </span>
            <span className="text-xs text-outline font-mono">Incident #INC-8942 · Opened 3m ago</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Throughput degradation detected in edge ingress gateway. 12 enterprise tenants experiencing response queuing.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
        <button
          onClick={onTriage}
          className="h-8 px-3.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shadow-sm transition-all"
        >
          <span>Triage Incident</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDismiss}
          className="h-8 px-2.5 inline-flex items-center gap-1 rounded-lg border border-outline-variant hover:bg-surface-container text-xs font-medium text-on-surface-variant transition-colors"
        >
          <span>Acknowledge</span>
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
