import React from 'react';
import { useMarketingStore } from '../store/marketingStore.js';
import { Users, Zap, Percent, ShieldCheck } from 'lucide-react';

export const BillingAndUsageControls: React.FC = () => {
  const {
    billingInterval,
    setBillingInterval,
    seats,
    setSeats,
    eventsK,
    setEventsK,
    incrementSandboxAction
  } = useMarketingStore();

  const handleSeatChange = (val: number) => {
    setSeats(val);
    incrementSandboxAction();
  };

  const handleEventsChange = (val: number) => {
    setEventsK(val);
    incrementSandboxAction();
  };

  const formatEvents = (k: number) => {
    if (k >= 1000) {
      return `${(k / 1000).toFixed(1)}M runs/mo`;
    }
    return `${k.toLocaleString()}k runs/mo`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#0D111C]/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-8">
      {/* Top Cadence Toggle: Monthly vs Annual */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Interactive ROI & Usage Simulator
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Adjust volume sliders to illuminate the optimal tier and calculate real-time savings.
          </p>
        </div>

        {/* Cadence Switch */}
        <div className="flex items-center gap-3 self-center sm:self-auto bg-[#06080F] p-1.5 rounded-full border border-white/10">
          <button
            onClick={() => {
              setBillingInterval('monthly');
              incrementSandboxAction();
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              billingInterval === 'monthly'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Billing
          </button>

          <button
            onClick={() => {
              setBillingInterval('annual');
              incrementSandboxAction();
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              billingInterval === 'annual'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 animate-pulse">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Usage Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Slider 1: Active Team Seats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Users className="w-4 h-4 text-indigo-400" />
              Active Team Seats
            </span>
            <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/30 text-sm">
              {seats} {seats === 1 ? 'Seat' : 'Seats'}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={seats}
            onChange={(e) => handleSeatChange(Number(e.target.value))}
            className="w-full cursor-pointer accent-indigo-500"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>1 Seat (Bootstrap)</span>
            <span>25 Seats (Growth)</span>
            <span>100+ (Enterprise)</span>
          </div>
        </div>

        {/* Slider 2: Monthly Events & API Runs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Zap className="w-4 h-4 text-cyan-400" />
              Monthly Pipeline Events
            </span>
            <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/30 text-sm">
              {formatEvents(eventsK)}
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="3000"
            step="10"
            value={eventsK}
            onChange={(e) => handleEventsChange(Number(e.target.value))}
            className="w-full cursor-pointer accent-cyan-500"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>10k / mo</span>
            <span>500k / mo</span>
            <span>3M+ / mo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
