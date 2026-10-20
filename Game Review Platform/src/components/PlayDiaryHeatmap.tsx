import React, { useState } from 'react';
import { Calendar, Flame, Clock, Award } from 'lucide-react';

interface PlayDiaryHeatmapProps {
  activityData: { date: string; hoursPlayed: number; reviewCount: number }[];
  totalGamesLogged: number;
  totalReviewsWritten: number;
  hoursLoggedThisYear: number;
  meanRating: number;
}

export const PlayDiaryHeatmap: React.FC<PlayDiaryHeatmapProps> = ({
  activityData,
  totalGamesLogged,
  totalReviewsWritten,
  hoursLoggedThisYear,
  meanRating,
}) => {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    hoursPlayed: number;
    reviewCount: number;
  } | null>(null);

  // Take the last 364 days (52 weeks of 7 days)
  const days = activityData.slice(-364);

  // Group into 52 weeks
  const weeks: { date: string; hoursPlayed: number; reviewCount: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getCellColor = (hours: number, reviews: number) => {
    if (reviews > 0) return 'bg-amber-400 border-amber-300 shadow-[0_0_8px_#F59E0B]';
    if (hours === 0) return 'bg-[#151B2B]/60 border-slate-800/40 hover:border-slate-600';
    if (hours < 2) return 'bg-cyan-950/70 border-cyan-800/30';
    if (hours < 4) return 'bg-cyan-800/60 border-cyan-700/40';
    if (hours < 6) return 'bg-cyan-600/80 border-cyan-500/50';
    return 'bg-cyan-400 border-cyan-300 shadow-[0_0_6px_#06B6D4]';
  };

  return (
    <div className="bg-[#10141F] border border-[#1E293B] rounded-2xl p-6 shadow-xl my-6">
      {/* Header & KPI Summary Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-white text-base tracking-wide">
              365-Day Play-Diary & Review Log
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Telemetry heatmap of session hours and published critical essays
          </p>
        </div>

        {/* KPI Badges */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div className="text-left font-mono">
              <div className="text-xs font-bold text-white">{hoursLoggedThisYear}h</div>
              <div className="text-[10px] text-slate-400">Logged This Year</div>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <div className="text-left font-mono">
              <div className="text-xs font-bold text-white">{totalReviewsWritten}</div>
              <div className="text-[10px] text-slate-400">Reviews Authored</div>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <div className="text-left font-mono">
              <div className="text-xs font-bold text-white">{meanRating.toFixed(1)} ★</div>
              <div className="text-[10px] text-slate-400">Mean Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* 52-Week Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[720px]">
          {/* Weekday indicator & Grid */}
          <div className="flex gap-1.5">
            <div className="flex flex-col justify-between py-0.5 text-[9px] font-mono text-slate-400 w-6 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            <div className="flex gap-1 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="flex flex-col gap-1 flex-1">
                  {week.map((day) => {
                    return (
                      <div
                        key={day.date}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`aspect-square rounded-sm border cursor-pointer transition-all duration-150 hover:scale-125 hover:z-10 ${getCellColor(
                          day.hoursPlayed,
                          day.reviewCount
                        )}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Tooltip Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-800/60 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#151B2B]/60 border border-slate-800" />
            <div className="w-3 h-3 rounded-sm bg-cyan-950/70 border border-cyan-800/30" />
            <div className="w-3 h-3 rounded-sm bg-cyan-800/60 border border-cyan-700/40" />
            <div className="w-3 h-3 rounded-sm bg-cyan-600/80 border border-cyan-500/50" />
            <div className="w-3 h-3 rounded-sm bg-cyan-400 border border-cyan-300" />
            <div className="w-3 h-3 rounded-sm bg-amber-400 border border-amber-300" />
          </div>
          <span>More / Review Published</span>
        </div>

        {/* Hovered Day Telemetry Callout */}
        <div className="h-5 flex items-center">
          {hoveredDay ? (
            <span className="text-cyan-300 font-bold animate-fadeIn">
              {hoveredDay.date}:{' '}
              <span className="text-white">
                {hoveredDay.hoursPlayed} hrs played
              </span>
              {hoveredDay.reviewCount > 0 && (
                <span className="text-amber-400 ml-2">
                  • 1 Review Published ★
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400">Hover over any day to inspect play-log telemetry</span>
          )}
        </div>
      </div>
    </div>
  );
};
