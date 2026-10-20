import React from 'react';
import { Calendar, Sparkles, Sun, CloudRain, Cloud, CheckCircle } from 'lucide-react';
import { DailyForecast } from '../types/weather';
import { TemperatureUnit, formatTemp } from '../utils/weatherFormatters';

interface WeekendOutlookProps {
  weekendData?: {
    friday: DailyForecast;
    saturday: DailyForecast;
    sunday: DailyForecast;
    weekendVerdict: string;
    bestOutdoorDay: string;
  };
  daily: DailyForecast[];
  unit: TemperatureUnit;
}

export const WeekendOutlook: React.FC<WeekendOutlookProps> = ({
  weekendData,
  daily,
  unit,
}) => {
  if (!weekendData) return null;

  const { friday, saturday, sunday, weekendVerdict, bestOutdoorDay } = weekendData;
  const weekendDays = [friday, saturday, sunday].filter(Boolean);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mb-8">
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-weather-cyan/5 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-weather-gold/15 text-weather-gold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Dynamic Weekend Outlook (Fri – Sun)
              </h3>
              <p className="text-xs text-white/50">
                Automated weekend planner isolating key recreational windows and outdoor picking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-weather-emerald/15 border border-weather-emerald/30 text-weather-emerald px-3 py-1 rounded-full text-xs font-mono font-medium self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5" /> Best Day: {bestOutdoorDay}
          </div>
        </div>

        {/* Narrative Verdict */}
        <p className="text-sm text-white/85 mb-5 font-sans leading-relaxed">
          {weekendVerdict}
        </p>

        {/* 3 Days Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weekendDays.map((day) => {
            const isBest = day.dayOfWeek.includes(bestOutdoorDay);

            return (
              <div
                key={day.date}
                className={`rounded-2xl p-4 border transition-all ${
                  isBest
                    ? 'bg-weather-cyan/[0.08] border-weather-cyan/40 shadow-lg shadow-weather-cyan/10'
                    : 'bg-white/[0.04] border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-white font-display">
                    {day.dayOfWeek}
                  </span>
                  <span className="text-[11px] font-mono text-white/50">{day.date}</span>
                </div>

                <div className="flex items-center justify-between my-2">
                  <span className="text-sm text-white/80">{day.conditionText}</span>
                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-white">
                      {formatTemp(day.tempMaxC, unit)}
                    </span>
                    <span className="text-xs text-white/40 ml-1.5">
                      {formatTemp(day.tempMinC, unit)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/60">
                  <span>Rain chance: {day.precipitationProb}%</span>
                  <span>UV: {day.uvMax}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 7-Day Extended Outlook Accordion / Mini List */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <h4 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3">
            7-Day Synoptic Progression
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {daily.map((d, i) => (
              <div
                key={d.date}
                className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5 text-center flex flex-col justify-between"
              >
                <span className="text-xs font-medium text-white/80 block">{d.dayOfWeek}</span>
                <span className="text-[11px] text-white/50 block my-1 truncate">{d.conditionText}</span>
                <div className="text-xs font-mono text-white font-semibold">
                  {formatTemp(d.tempMaxC, unit)} <span className="text-white/40 font-normal">{formatTemp(d.tempMinC, unit)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
