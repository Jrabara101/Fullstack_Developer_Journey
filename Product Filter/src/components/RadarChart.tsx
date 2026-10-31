import React from 'react';

interface RadarChartProps {
  scores: {
    performance: number;
    portability: number;
    durability: number;
    efficiency: number;
    value: number;
  };
  medianScores?: {
    performance: number;
    portability: number;
    durability: number;
    efficiency: number;
    value: number;
  };
  size?: number;
  showLabels?: boolean;
  className?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  scores,
  medianScores = { performance: 85, portability: 70, durability: 80, efficiency: 82, value: 80 },
  size = 140,
  showLabels = false,
  className = '',
}) => {
  const center = size / 2;
  const radius = center * 0.72;

  const axes = [
    { key: 'performance', label: 'PERF', angle: -Math.PI / 2 },
    { key: 'portability', label: 'PORT', angle: -Math.PI / 2 + (2 * Math.PI) / 5 },
    { key: 'durability', label: 'DUR', angle: -Math.PI / 2 + (4 * Math.PI) / 5 },
    { key: 'efficiency', label: 'EFF', angle: -Math.PI / 2 + (6 * Math.PI) / 5 },
    { key: 'value', label: 'VAL', angle: -Math.PI / 2 + (8 * Math.PI) / 5 },
  ];

  // Helper to calculate coordinates
  const getPoint = (angle: number, valueNormalized: number) => {
    const r = (valueNormalized / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate web rings (25%, 50%, 75%, 100%)
  const webRings = [0.25, 0.5, 0.75, 1.0].map((ringLevel) => {
    const points = axes.map((a) => {
      const p = getPoint(a.angle, ringLevel * 100);
      return `${p.x},${p.y}`;
    }).join(' ');
    return points;
  });

  // Product polygon points
  const productPoints = axes.map((a) => {
    const val = scores[a.key as keyof typeof scores] || 50;
    const p = getPoint(a.angle, val);
    return `${p.x},${p.y}`;
  }).join(' ');

  // Category median points
  const medianPoints = axes.map((a) => {
    const val = medianScores[a.key as keyof typeof medianScores] || 75;
    const p = getPoint(a.angle, val);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <radialGradient id={`radarGrad-${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.08" />
          </radialGradient>
        </defs>

        {/* Web Grid Rings */}
        {webRings.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="#1E2638"
            strokeWidth={i === 3 ? 1.5 : 1}
            strokeDasharray={i < 3 ? '2 3' : 'none'}
          />
        ))}

        {/* Axis Spokes */}
        {axes.map((a, i) => {
          const edge = getPoint(a.angle, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={edge.x}
              y2={edge.y}
              stroke="#1E2638"
              strokeWidth="1"
            />
          );
        })}

        {/* Category Median Polygon (Dashed Slate) */}
        <polygon
          points={medianPoints}
          fill="rgba(148, 163, 184, 0.08)"
          stroke="#64748B"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />

        {/* Product Spec Polygon (Cyan Glow) */}
        <polygon
          points={productPoints}
          fill={`url(#radarGrad-${size})`}
          stroke="#06B6D4"
          strokeWidth="2"
        />

        {/* Vertices Dots */}
        {axes.map((a, i) => {
          const val = scores[a.key as keyof typeof scores] || 50;
          const pt = getPoint(a.angle, val);
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="2.5"
              fill="#06B6D4"
              stroke="#080A0F"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis Labels */}
        {showLabels &&
          axes.map((a, i) => {
            const labelPos = getPoint(a.angle, 122);
            return (
              <text
                key={i}
                x={labelPos.x}
                y={labelPos.y}
                fill="#94A3B8"
                fontSize="9"
                fontFamily="JetBrains Mono"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {a.label}
              </text>
            );
          })}
      </svg>
    </div>
  );
};
