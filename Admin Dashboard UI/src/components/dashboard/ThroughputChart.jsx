import React, { useState } from 'react';
import { TIME_SERIES_DATA } from '../../data/mockData';

export default function ThroughputChart() {
  const [timeframe, setTimeframe] = useState('30D');
  const [hoveredIndex, setHoveredIndex] = useState(18); // Default highlight around peak

  const currentData = TIME_SERIES_DATA[timeframe] || TIME_SERIES_DATA['30D'];

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container shadow-subtle flex flex-col justify-between">
      <div>
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-surface-container-low">
          <div>
            <h2 className="font-semibold text-base text-on-surface">Activity & Edge Throughput</h2>
            <p className="text-xs text-outline">Hourly aggregated request traces across edge nodes</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Series Legend */}
            <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                Direct API Traffic
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-300"></span>
                Webhooks Processing
              </span>
            </div>

            {/* Timeframe Filter Buttons */}
            <div className="inline-flex p-0.5 bg-surface-container-low rounded-lg font-mono text-xs">
              {['24H', '7D', '30D', '90D'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded transition-all font-medium ${
                    timeframe === tf
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="relative w-full h-64 mt-4">
          <svg
            className="w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 700 240"
          >
            <defs>
              <linearGradient id="areaDirect" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="areaWebhooks" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <g stroke="#eeedf7" strokeDasharray="3,3" strokeWidth="1">
              <line x1="45" x2="690" y1="20" y2="20" />
              <line x1="45" x2="690" y1="70" y2="70" />
              <line x1="45" x2="690" y1="120" y2="120" />
              <line x1="45" x2="690" y1="170" y2="170" />
              <line x1="45" x2="690" y1="220" y2="220" />
            </g>

            {/* Y Axis Labels */}
            <g className="font-mono text-[10px]" fill="#737686">
              <text x="5" y="24">100k</text>
              <text x="12" y="74">75k</text>
              <text x="12" y="124">50k</text>
              <text x="12" y="174">25k</text>
              <text x="25" y="224">0k</text>
            </g>

            {/* Secondary Series: Webhooks */}
            <path
              d="M45,185 C90,175 140,195 190,165 C240,135 290,140 340,120 C390,100 440,115 490,95 C540,75 590,90 640,65 L690,55 L690,220 L45,220 Z"
              fill="url(#areaWebhooks)"
            />
            <path
              d="M45,185 C90,175 140,195 190,165 C240,135 290,140 340,120 C390,100 440,115 490,95 C540,75 590,90 640,65 L690,55"
              fill="none"
              stroke="#93c5fd"
              strokeLinejoin="round"
              strokeWidth="2"
            />

            {/* Primary Series: Direct Traffic */}
            <path
              d="M45,160 C90,140 140,165 190,130 C240,95 290,110 340,85 C390,60 440,78 490,55 C540,32 590,48 640,30 L690,22 L690,220 L45,220 Z"
              fill="url(#areaDirect)"
            />
            <path
              d="M45,160 C90,140 140,165 190,130 C240,95 290,110 340,85 C390,60 440,78 490,55 C540,32 590,48 640,30 L690,22"
              fill="none"
              stroke="#2563eb"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />

            {/* Interactive Guideline */}
            <line
              x1="490"
              x2="490"
              y1="15"
              y2="220"
              stroke="#2563eb"
              strokeDasharray="2,2"
              strokeWidth="1.5"
            />
            <circle cx="490" cy="55" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="490" cy="95" r="3.5" fill="#93c5fd" stroke="#ffffff" strokeWidth="2" />
          </svg>

          {/* Interactive Tooltip Pill */}
          <div className="absolute top-2 left-[64%] -translate-x-1/2 pointer-events-none bg-inverse-surface text-inverse-on-surface px-3 py-1.5 rounded-lg shadow-lg font-mono text-xs space-y-0.5 z-10">
            <div className="text-[10px] text-outline-variant uppercase tracking-wider font-semibold">
              Peak Traffic Sample
            </div>
            <div className="text-xs font-medium text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim"></span>
              84.2k req/s <span className="text-outline-variant font-normal">(34.1k webhooks)</span>
            </div>
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between pl-10 pr-2 pt-1 font-mono text-[11px] text-outline">
            {currentData.labels.map((lbl, idx) => (
              <span
                key={idx}
                className={lbl.includes('Peak') ? 'text-primary font-bold' : ''}
              >
                {lbl}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-2 bg-surface-container-low/70 rounded-xl p-3 border border-surface-container-low">
        <div className="px-2">
          <div className="font-mono text-[11px] text-outline">Peak Throughput</div>
          <div className="font-mono text-sm font-semibold text-on-surface">
            {currentData.peak}
          </div>
        </div>
        <div className="px-2 border-x border-surface-container">
          <div className="font-mono text-[11px] text-outline">Average Response</div>
          <div className="font-mono text-sm font-semibold text-on-surface">
            {currentData.avgResponse}
          </div>
        </div>
        <div className="px-2">
          <div className="font-mono text-[11px] text-outline">SLA Delivery</div>
          <div className="font-mono text-sm font-semibold text-emerald-700">
            {currentData.successRate}
          </div>
        </div>
      </div>
    </div>
  );
}
