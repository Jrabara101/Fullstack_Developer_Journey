import React from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';

export default function KpiCards({ onFilterByKpi, activeKpi }) {
  const cards = [
    {
      id: 'revenue',
      title: 'Total Gross Revenue',
      value: '$1,284,920.40',
      change: '+12.4%',
      isPositive: true,
      subtext: 'vs target benchmark',
      target: '+$142.3k vs target',
      sparklineColor: '#006242',
      gradientId: 'gradRev',
      sparklinePath: 'M0,20 Q12,18 25,14 T50,15 T75,8 T100,2 L100,24 L0,24 Z',
      sparklineLine: 'M0,20 Q12,18 25,14 T50,15 T75,8 T100,2'
    },
    {
      id: 'users',
      title: 'Active Enterprise Users',
      value: '48,291',
      change: '+8.2%',
      isPositive: true,
      subtext: 'Real-time concurrency',
      target: '3,104 concurrent',
      sparklineColor: '#2563eb',
      gradientId: 'gradUsers',
      sparklinePath: 'M0,18 Q16,14 30,16 T60,11 T80,7 T100,4 L100,24 L0,24 Z',
      sparklineLine: 'M0,18 Q16,14 30,16 T60,11 T80,7 T100,4'
    },
    {
      id: 'latency',
      title: 'Average Latency (p99)',
      value: '184',
      unit: 'ms',
      change: '-14.6%',
      isPositive: true, // Lower latency is good
      subtext: 'SLA standard limit',
      target: 'Target: <250ms',
      sparklineColor: '#006242',
      gradientId: 'gradLat',
      sparklinePath: 'M0,6 Q20,10 40,16 T70,12 T85,20 T100,19 L100,24 L0,24 Z',
      sparklineLine: 'M0,6 Q20,10 40,16 T70,12 T85,20 T100,19'
    },
    {
      id: 'errors',
      title: 'System Error Rate',
      value: '0.042',
      unit: '%',
      change: '+0.01%',
      isPositive: false, // Error rate elevation is bad
      subtext: 'Open incident triage',
      target: '12 unresolved alerts',
      sparklineColor: '#ba1a1a',
      gradientId: 'gradErr',
      sparklinePath: 'M0,21 Q25,20 45,21 T70,18 T85,5 T100,16 L100,24 L0,24 Z',
      sparklineLine: 'M0,21 Q25,20 45,21 T70,18 T85,5 T100,16'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(card => {
        const isSelected = activeKpi === card.id;
        return (
          <div
            key={card.id}
            onClick={() => onFilterByKpi(card.id)}
            className={`bg-surface-container-lowest rounded-2xl p-5 border transition-all cursor-pointer shadow-subtle hover:shadow-md flex flex-col justify-between space-y-3 group ${
              isSelected
                ? 'border-primary ring-2 ring-primary/20 bg-primary-fixed/10'
                : 'border-surface-container hover:border-outline-variant'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-mono text-[11px] tracking-wider uppercase text-outline font-medium">
                  {card.title}
                </span>
                <div className="text-2xl font-bold text-on-surface font-mono tracking-tight flex items-baseline">
                  {card.value}
                  {card.unit && (
                    <span className="text-xs text-outline ml-0.5 font-sans font-normal">
                      {card.unit}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                  card.isPositive
                    ? 'bg-emerald-500/10 text-emerald-700'
                    : 'bg-rose-500/10 text-rose-700'
                }`}
              >
                {card.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {card.change}
              </span>
            </div>

            {/* Sparkline SVG */}
            <div className="h-9 w-full flex items-end">
              <svg className="w-full h-9 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 24">
                <defs>
                  <linearGradient id={card.gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={card.sparklineColor} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={card.sparklineColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={card.sparklinePath} fill={`url(#${card.gradientId})`} />
                <path
                  d={card.sparklineLine}
                  fill="none"
                  stroke={card.sparklineColor}
                  strokeLinecap="round"
                  strokeWidth="1.75"
                />
              </svg>
            </div>

            {/* Drilldown footer info */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-surface-container-low">
              <span className="text-outline">{card.subtext}</span>
              <span
                className={`font-mono font-medium text-[11px] ${
                  card.id === 'errors' ? 'text-rose-600 font-semibold' : 'text-on-surface-variant'
                }`}
              >
                {card.target}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
