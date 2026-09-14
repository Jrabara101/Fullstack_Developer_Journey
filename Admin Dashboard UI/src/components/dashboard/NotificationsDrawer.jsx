import React from 'react';
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  ShieldCheck,
  BellOff
} from 'lucide-react';

export default function NotificationsDrawer({ notifications, onAction, onClose }) {
  const interruptiveAlerts = notifications.filter(n => n.type === 'interruptive');
  const passiveAlerts = notifications.filter(n => n.type === 'passive');

  return (
    <div className="absolute right-0 mt-2 w-96 bg-surface-container-lowest border border-surface-container rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-container flex items-center justify-between bg-surface-container-low/50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-on-surface">Notification Ecosystem</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-error text-white font-bold">
            {interruptiveAlerts.length} Actionable
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-outline hover:text-on-surface text-xs transition-colors"
        >
          Close
        </button>
      </div>

      <div className="max-h-[460px] overflow-y-auto divide-y divide-surface-container">
        {/* Section 1: Interruptive Alerts (Requires Action) */}
        {interruptiveAlerts.length > 0 && (
          <div className="p-3 bg-error-container/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-error font-bold mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Interruptive / High Priority
            </div>
            <div className="space-y-2.5">
              {interruptiveAlerts.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-surface-container-lowest border border-error/20 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-on-surface">{item.title}</div>
                    <span className="text-[10px] font-mono text-outline flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {item.message}
                  </p>

                  {/* Inline Action Buttons */}
                  {item.actions && (
                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-surface-container-low">
                      {item.actions.map(action => {
                        let btnClass = 'bg-surface-container-low text-on-surface hover:bg-surface-container';
                        if (action.variant === 'primary') {
                          btnClass = 'bg-primary-container text-white hover:bg-primary';
                        } else if (action.variant === 'success') {
                          btnClass = 'bg-emerald-600 text-white hover:bg-emerald-700';
                        } else if (action.variant === 'danger') {
                          btnClass = 'bg-rose-600 text-white hover:bg-rose-700';
                        }
                        return (
                          <button
                            key={action.id}
                            onClick={() => onAction(item.id, action.id)}
                            className={`h-7 px-3 rounded-md text-[11px] font-medium transition-all shadow-xs ${btnClass}`}
                          >
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Passive Alerts */}
        <div className="p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-outline font-semibold mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Passive Updates & Telemetry
          </div>
          <div className="space-y-2">
            {passiveAlerts.map(item => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-xs text-on-surface">{item.title}</div>
                  <span className="text-[10px] font-mono text-outline">{item.timestamp}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-surface-container-low/60 border-t border-surface-container text-center">
        <span className="text-[11px] text-outline">
          Alert fatigue protection active: 3 automated low-severity digests suppressed.
        </span>
      </div>
    </div>
  );
}
