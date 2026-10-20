import React, { useMemo } from 'react';
import { PillarBreakdown } from '../types';

interface FivePillarRadarProps {
  primaryPillars: PillarBreakdown;
  primaryLabel?: string;
  secondaryPillars?: PillarBreakdown;
  secondaryLabel?: string;
  size?: number;
  showLegend?: boolean;
  interactive?: boolean;
  onPillarChange?: (pillar: keyof PillarBreakdown, value: number) => void;
}

const AXES: { key: keyof PillarBreakdown; label: string; angle: number }[] = [
  { key: 'gameplay', label: 'Gameplay', angle: -Math.PI / 2 }, // Top (12 o'clock)
  { key: 'narrative', label: 'Narrative', angle: -Math.PI / 2 + (2 * Math.PI) / 5 },
  { key: 'visuals', label: 'Visuals', angle: -Math.PI / 2 + (4 * Math.PI) / 5 },
  { key: 'audio', label: 'Audio', angle: -Math.PI / 2 + (6 * Math.PI) / 5 },
  { key: 'polish', label: 'Polish', angle: -Math.PI / 2 + (8 * Math.PI) / 5 },
];

export const FivePillarRadar: React.FC<FivePillarRadarProps> = ({
  primaryPillars,
  primaryLabel = 'Community Average',
  secondaryPillars,
  secondaryLabel = 'Your Taste Profile',
  size = 280,
  showLegend = true,
  interactive = false,
  onPillarChange,
}) => {
  const center = size / 2;
  const radius = (size / 2) * 0.72;

  // Compute (x, y) coordinates for a given pillar set
  const getCoordinates = (pillars: PillarBreakdown) => {
    return AXES.map((axis) => {
      const val = Math.max(1, Math.min(5, pillars[axis.key] || 1));
      // Normalize 1-5 to 0.2 - 1.0
      const r = (val / 5) * radius;
      const x = center + r * Math.cos(axis.angle);
      const y = center + r * Math.sin(axis.angle);
      return { x, y, val, key: axis.key, label: axis.label };
    });
  };

  const primaryCoords = useMemo(() => getCoordinates(primaryPillars), [primaryPillars, radius, center]);
  const secondaryCoords = useMemo(
    () => (secondaryPillars ? getCoordinates(secondaryPillars) : null),
    [secondaryPillars, radius, center]
  );

  const primaryPath = useMemo(() => {
    return primaryCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ') + ' Z';
  }, [primaryCoords]);

  const secondaryPath = useMemo(() => {
    if (!secondaryCoords) return null;
    return secondaryCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ') + ' Z';
  }, [secondaryCoords]);

  // Concentric polygon background grid rings (from 1 to 5)
  const gridRings = [1, 2, 3, 4, 5].map((level) => {
    const r = (level / 5) * radius;
    const ringPath =
      AXES.map((axis, i) => {
        const x = center + r * Math.cos(axis.angle);
        const y = center + r * Math.sin(axis.angle);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(' ') + ' Z';
    return { level, path: ringPath, r };
  });

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          <defs>
            {/* Primary Gradient (Cyan/Teal) */}
            <linearGradient id="radarPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
            </linearGradient>

            {/* Secondary Gradient (Amber/Gold or Rose) */}
            <linearGradient id="radarSecondaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.2" />
            </linearGradient>

            {/* Glowing drop shadow filter */}
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Rings */}
          {gridRings.map((ring) => (
            <path
              key={ring.level}
              d={ring.path}
              fill="none"
              stroke="#1E293B"
              strokeWidth={ring.level === 5 ? 1.5 : 1}
              strokeDasharray={ring.level < 5 ? '2 2' : undefined}
              className="transition-colors duration-200"
            />
          ))}

          {/* Radial Spokes from center to vertex */}
          {AXES.map((axis) => {
            const x = center + radius * Math.cos(axis.angle);
            const y = center + radius * Math.sin(axis.angle);
            return (
              <line
                key={axis.key}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#1E293B"
                strokeWidth={1}
              />
            );
          })}

          {/* Primary Polygon (Community or Main) */}
          <path
            d={primaryPath}
            fill="url(#radarPrimaryGrad)"
            stroke="#06B6D4"
            strokeWidth={2}
            className="transition-all duration-300 ease-out filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
          />

          {/* Secondary Polygon (Overlay / User Taste Sync) */}
          {secondaryPath && (
            <path
              d={secondaryPath}
              fill="url(#radarSecondaryGrad)"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="4 2"
              className="transition-all duration-300 ease-out filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
            />
          )}

          {/* Vertices & Dots */}
          {primaryCoords.map((pt) => (
            <g key={`primary-${pt.key}`}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill="#06B6D4"
                className="transition-all duration-300 hover:r-6 filter drop-shadow-[0_0_6px_#06B6D4]"
              />
            </g>
          ))}

          {secondaryCoords &&
            secondaryCoords.map((pt) => (
              <circle
                key={`secondary-${pt.key}`}
                cx={pt.x}
                cy={pt.y}
                r={3.5}
                fill="#F59E0B"
                className="transition-all duration-300 hover:r-5 filter drop-shadow-[0_0_6px_#F59E0B]"
              />
            ))}

          {/* Outer Axis Labels */}
          {AXES.map((axis) => {
            const labelRadius = radius + 22;
            const x = center + labelRadius * Math.cos(axis.angle);
            const y = center + labelRadius * Math.sin(axis.angle);
            const primaryVal = primaryPillars[axis.key] || 0;
            const secondaryVal = secondaryPillars ? secondaryPillars[axis.key] : null;

            return (
              <g key={axis.key} className="text-[10px] font-mono">
                <text
                  x={x}
                  y={y - 4}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#94A3B8"
                  className="font-bold tracking-wider uppercase text-[10px]"
                >
                  {axis.label}
                </text>
                <text
                  x={x}
                  y={y + 8}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#F8FAFC"
                  className="font-bold font-mono text-[11px]"
                >
                  <tspan fill="#06B6D4">{primaryVal.toFixed(1)}</tspan>
                  {secondaryVal !== null && (
                    <tspan fill="#F59E0B" dx="4">
                      / {secondaryVal.toFixed(1)}
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Telemetry */}
      {showLegend && (
        <div className="flex items-center gap-6 mt-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_#06B6D4]" />
            <span className="text-slate-300 font-medium">{primaryLabel}</span>
          </div>

          {secondaryPillars && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_#F59E0B]" />
              <span className="text-amber-300 font-medium">{secondaryLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
