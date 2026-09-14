import React, { useState } from 'react';
import { ChevronDown, Layers } from 'lucide-react';

export default function PlanDistributionChart() {
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [activePlan, setActivePlan] = useState(null);

  const plans = [
    { name: 'Enterprise', seats: '26,077', percent: '54%', color: 'bg-primary-container', strokeColor: '#2563eb', dash: '149.3 276.5', offset: '0' },
    { name: 'Growth', seats: '13,521', percent: '28%', color: 'bg-sky-400', strokeColor: '#38bdf8', dash: '77.4 276.5', offset: '-149.3' },
    { name: 'Starter', seats: '6,760', percent: '14%', color: 'bg-indigo-300', strokeColor: '#a5b4fc', dash: '38.7 276.5', offset: '-226.7' },
    { name: 'Free Dev', seats: '1,933', percent: '4%', color: 'bg-zinc-300', strokeColor: '#d4d4d8', dash: '11.1 276.5', offset: '-265.4' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container shadow-subtle flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
          <div>
            <h2 className="font-semibold text-base text-on-surface">Plan Distribution</h2>
            <p className="text-xs text-outline">Active billing seat allocations</p>
          </div>
          <button className="px-2.5 py-1 inline-flex items-center gap-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-mono text-xs transition-colors">
            <span>{selectedRegion}</span>
            <ChevronDown className="w-3.5 h-3.5 text-outline" />
          </button>
        </div>

        {/* SVG Donut Chart */}
        <div className="relative flex items-center justify-center my-4">
          <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 120 120">
            {/* Background circle track */}
            <circle
              cx="60"
              cy="60"
              r="44"
              fill="none"
              stroke="#eeedf7"
              strokeWidth="12"
            />
            {/* Slices */}
            {plans.map(p => (
              <circle
                key={p.name}
                cx="60"
                cy="60"
                r="44"
                fill="none"
                stroke={p.strokeColor}
                strokeWidth={activePlan === p.name ? '15' : '12'}
                strokeDasharray={p.dash}
                strokeDashoffset={p.offset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setActivePlan(p.name)}
                onMouseLeave={() => setActivePlan(null)}
              />
            ))}
          </svg>

          {/* Centered Total Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-bold text-on-surface font-mono leading-tight">
              {activePlan ? plans.find(p => p.name === activePlan)?.seats : '48.3k'}
            </span>
            <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
              {activePlan ? `${activePlan} Seats` : 'Total Active Seats'}
            </span>
          </div>
        </div>
      </div>

      {/* Plan Legend Breakdown */}
      <div className="space-y-1.5 pt-2 border-t border-surface-container-low text-xs">
        {plans.map(p => (
          <div
            key={p.name}
            onMouseEnter={() => setActivePlan(p.name)}
            onMouseLeave={() => setActivePlan(null)}
            className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
              activePlan === p.name ? 'bg-surface-container' : 'hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
              <span className="font-medium text-on-surface">{p.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-on-surface font-medium">{p.seats}</span>
              <span className="font-mono text-emerald-700 font-semibold">{p.percent}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
