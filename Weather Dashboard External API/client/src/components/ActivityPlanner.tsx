import React from 'react';
import { Footprints, Bike, Heart, Utensils, Sprout, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { ActivityWindow } from '../types/weather';

interface ActivityPlannerProps {
  activities: ActivityWindow[];
}

export const ActivityPlanner: React.FC<ActivityPlannerProps> = ({ activities }) => {
  const getIcon = (activityType: string) => {
    switch (activityType) {
      case 'running':
        return <Footprints className="w-5 h-5 text-weather-cyan" />;
      case 'cycling':
        return <Bike className="w-5 h-5 text-weather-azure" />;
      case 'dog_walking':
        return <Heart className="w-5 h-5 text-pink-400" />;
      case 'outdoor_dining':
        return <Utensils className="w-5 h-5 text-amber-300" />;
      case 'gardening':
        return <Sprout className="w-5 h-5 text-weather-emerald" />;
      default:
        return <CheckCircle className="w-5 h-5 text-white/70" />;
    }
  };

  const getVerdictBadge = (verdict: ActivityWindow['verdict']) => {
    switch (verdict) {
      case 'Optimal':
        return 'bg-weather-emerald/20 text-weather-emerald border-weather-emerald/30';
      case 'Favorable':
        return 'bg-weather-cyan/20 text-weather-cyan border-weather-cyan/30';
      case 'Challenging':
        return 'bg-weather-amber/20 text-weather-amber border-weather-amber/30';
      case 'Hazardous':
        return 'bg-weather-crimson/20 text-weather-crimson border-weather-crimson/30';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mb-8">
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Footprints className="w-4 h-4 text-weather-cyan" /> Actionable Outdoor Window Finder
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Automated biological comfort scoring factoring rain nowcasts, UV peaks, thermal feel, and air quality.
            </p>
          </div>
          <span className="text-xs font-mono text-weather-cyan/80 bg-weather-cyan/10 px-3 py-1 rounded-full border border-weather-cyan/20 self-start sm:self-auto">
            Algorithm v2.4 Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((act) => (
            <div
              key={act.activity}
              className="bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200 rounded-2xl p-4 border border-white/[0.08] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white/[0.07]">{getIcon(act.activity)}</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white tracking-tight">{act.title}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/50">
                        <Clock className="w-3 h-3 text-weather-gold" />
                        <span>{act.bestTimeWindow}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${getVerdictBadge(
                      act.verdict
                    )}`}
                  >
                    {act.verdict} ({act.score}%)
                  </span>
                </div>

                {/* Score bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      act.score > 80 ? 'bg-weather-emerald' : act.score > 60 ? 'bg-weather-cyan' : 'bg-weather-amber'
                    }`}
                    style={{ width: `${act.score}%` }}
                  />
                </div>

                <p className="text-xs text-white/70 leading-relaxed">{act.statusSummary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
