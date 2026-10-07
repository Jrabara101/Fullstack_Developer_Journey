import React from 'react';
import { ComputedCharacterStats } from '../types/inventory';

interface RadarChartProps {
  stats: ComputedCharacterStats;
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ stats, size = 200 }) => {
  const center = size / 2;
  const radius = size * 0.38;

  // Max normalization baselines
  const statMetrics = [
    { label: 'STR', value: stats.strength, max: 70, color: '#f59e0b' },
    { label: 'ATK', value: stats.attackPower, max: 180, color: '#ef4444' },
    { label: 'CRIT', value: stats.critChance, max: 25, color: '#eab308' },
    { label: 'DEX', value: stats.dexterity, max: 70, color: '#10b981' },
    { label: 'INT', value: stats.intelligence, max: 70, color: '#06b6d4' },
    { label: 'ARMOR', value: stats.armor, max: 120, color: '#3b82f6' },
  ];

  const totalAxes = statMetrics.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Coordinates calculation
  const getCoordinates = (valueNormalized: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * Math.min(1.0, Math.max(0.15, valueNormalized));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Polygon vertices for player stats
  const points = statMetrics.map((m, i) => {
    const norm = m.value / m.max;
    return getCoordinates(norm, i);
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  // Grid levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <radialGradient id="radarFillGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Circular / Hexagonal grid lines */}
        {levels.map((lvl, lIdx) => {
          const gridPoints = statMetrics.map((_, i) => getCoordinates(lvl, i));
          const gridPath = gridPoints.map(p => `${p.x},${p.y}`).join(' ');
          return (
            <polygon
              key={lIdx}
              points={gridPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeDasharray={lvl === 1.0 ? 'none' : '3 3'}
              strokeWidth={1}
            />
          );
        })}

        {/* Spokes / Axis lines */}
        {statMetrics.map((_, i) => {
          const outer = getCoordinates(1.0, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={1}
            />
          );
        })}

        {/* Value Polygon */}
        <polygon
          points={polygonPath}
          fill="url(#radarFillGrad)"
          stroke="#818cf8"
          strokeWidth={2}
          filter="url(#glow)"
          className="transition-all duration-300 ease-out"
        />

        {/* Vertex markers and labels */}
        {points.map((pt, i) => {
          const metric = statMetrics[i];
          const labelCoord = getCoordinates(1.18, i);
          return (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={3.5}
                fill={metric.color}
                stroke="#ffffff"
                strokeWidth={1.5}
                className="transition-all duration-300"
              />
              <text
                x={labelCoord.x}
                y={labelCoord.y + 4}
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-slate-300 drop-shadow"
              >
                {metric.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Numerical Quick Summary */}
      <div className="grid grid-cols-3 gap-2 w-full mt-1">
        {statMetrics.map((m, i) => (
          <div key={i} className="flex flex-col items-center bg-white/[0.03] p-1 rounded border border-white/5">
            <span className="text-[9px] text-slate-400 font-mono">{m.label}</span>
            <span className="text-xs font-bold font-mono" style={{ color: m.color }}>
              {m.value}{m.label === 'CRIT' ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
