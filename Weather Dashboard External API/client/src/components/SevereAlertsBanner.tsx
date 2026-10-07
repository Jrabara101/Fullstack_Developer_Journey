import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { WeatherAlert } from '../types/weather';

interface SevereAlertsBannerProps {
  alerts: WeatherAlert[];
}

export const SevereAlertsBanner: React.FC<SevereAlertsBannerProps> = ({ alerts }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-2">
      <div className="space-y-2">
        {alerts.map((alert) => {
          const isExpanded = expandedId === alert.id;
          const isWarning = alert.severity === 'warning' || alert.severity === 'emergency';

          return (
            <div
              key={alert.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-xl ${
                isWarning
                  ? 'bg-weather-crimson/15 border-weather-crimson/40 shadow-lg shadow-weather-crimson/10'
                  : 'bg-weather-amber/15 border-weather-amber/40 shadow-lg shadow-weather-amber/10'
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                className="cursor-pointer px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl flex items-center justify-center ${
                      isWarning ? 'bg-weather-crimson/25 text-weather-crimson' : 'bg-weather-amber/25 text-weather-amber'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                          isWarning ? 'bg-weather-crimson text-white' : 'bg-weather-amber text-black'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <h4 className="font-semibold text-sm sm:text-base text-white tracking-tight">
                        {alert.title}
                      </h4>
                    </div>
                    <p className="text-xs text-white/70 mt-0.5 font-sans line-clamp-1">{alert.headline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/60">
                  <span className="text-xs font-mono hidden md:inline">
                    Agency: {alert.agency}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 sm:px-6 pb-5 pt-2 border-t border-white/10 space-y-4">
                  <p className="text-sm text-white/85 leading-relaxed">{alert.description}</p>

                  {alert.safetyChecklist && alert.safetyChecklist.length > 0 && (
                    <div className="bg-black/30 rounded-xl p-3.5 border border-white/10">
                      <h5 className="text-xs font-mono font-semibold uppercase tracking-wider text-weather-cyan mb-2.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Official Preparedness Checklist
                      </h5>
                      <ul className="space-y-1.5">
                        {alert.safetyChecklist.map((item, idx) => (
                          <li key={idx} className="text-xs text-white/80 flex items-start gap-2">
                            <span className="text-weather-cyan font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-white/50 pt-1">
                    <span>Effective: {new Date(alert.effective).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Expires: {new Date(alert.expires).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
