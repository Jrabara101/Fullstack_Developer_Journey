import React from 'react';
import type { PortfolioArtifact } from '../types/portfolio';

interface XRayLayerOverlayProps {
  artifact: PortfolioArtifact;
  showFullLabels?: boolean;
}

export const XRayLayerOverlay: React.FC<XRayLayerOverlayProps> = ({
  artifact,
  showFullLabels = true,
}) => {
  const { gridSpec } = artifact;
  const isWireframe = gridSpec.xrayMode === 'swiss-wireframe';
  const [fx, fy] = gridSpec.focalPointXY;

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{
        backgroundColor: isWireframe ? '#081326' : '#191917',
      }}
    >
      {/* Underlying transformed before-state plate (Blueprint Wireframe or Flat Log RAW) */}
      <img
        src={artifact.imageUrl}
        alt=""
        aria-hidden="true"
        className="w-full h-full object-contain block"
        style={{
          filter: isWireframe
            ? 'grayscale(100%) contrast(1.12) brightness(0.48) opacity(0.55)'
            : 'grayscale(82%) contrast(0.72) brightness(1.1) saturate(0.32)',
        }}
      />

      {/* Blueprint Tint Wash for Design X-Ray */}
      {isWireframe && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(16, 40, 84, 0.55) 0%, rgba(10, 22, 48, 0.65) 100%)',
          }}
        />
      )}

      {/* Vector Blueprint / Lighting Diagram SVG Layer */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        {/* Outer Margin Safe Frame */}
        <rect
          x={gridSpec.swissMarginsPct}
          y={gridSpec.swissMarginsPct}
          width={100 - gridSpec.swissMarginsPct * 2}
          height={100 - gridSpec.swissMarginsPct * 2}
          fill="none"
          stroke={isWireframe ? 'rgba(96, 165, 250, 0.45)' : 'rgba(244, 244, 242, 0.28)'}
          strokeWidth="0.25"
          strokeDasharray="1.2 1.2"
        />

        {/* Modular Column Guides */}
        {Array.from({ length: gridSpec.gridColumns - 1 }).map((_, idx) => {
          const x =
            gridSpec.swissMarginsPct +
            ((100 - gridSpec.swissMarginsPct * 2) * (idx + 1)) / gridSpec.gridColumns;
          return (
            <line
              key={`col-${idx}`}
              x1={x}
              y1={gridSpec.swissMarginsPct}
              x2={x}
              y2={100 - gridSpec.swissMarginsPct}
              stroke={isWireframe ? 'rgba(96, 165, 250, 0.26)' : 'rgba(255, 255, 255, 0.14)'}
              strokeWidth="0.18"
              strokeDasharray="0.8 1.2"
            />
          );
        })}

        {/* Rule of Thirds for Photographic Composition */}
        {gridSpec.ruleOfThirds && (
          <>
            <line
              x1="33.33"
              y1="0"
              x2="33.33"
              y2="100"
              stroke={isWireframe ? 'rgba(147, 197, 253, 0.2)' : 'rgba(255, 220, 160, 0.28)'}
              strokeWidth="0.18"
            />
            <line
              x1="66.66"
              y1="0"
              x2="66.66"
              y2="100"
              stroke={isWireframe ? 'rgba(147, 197, 253, 0.2)' : 'rgba(255, 220, 160, 0.28)'}
              strokeWidth="0.18"
            />
            <line
              x1="0"
              y1="33.33"
              x2="100"
              y2="33.33"
              stroke={isWireframe ? 'rgba(147, 197, 253, 0.2)' : 'rgba(255, 220, 160, 0.28)'}
              strokeWidth="0.18"
            />
            <line
              x1="0"
              y1="66.66"
              x2="100"
              y2="66.66"
              stroke={isWireframe ? 'rgba(147, 197, 253, 0.2)' : 'rgba(255, 220, 160, 0.28)'}
              strokeWidth="0.18"
            />
          </>
        )}

        {/* Wireframe Bounding Geometry (Designs) */}
        {isWireframe &&
          gridSpec.wireframeBlocks?.map((block, i) => (
            <g key={`wf-${i}`}>
              <rect
                x={block.xPct}
                y={block.yPct}
                width={block.wPct}
                height={block.hPct}
                fill="rgba(59, 130, 246, 0.08)"
                stroke="rgba(147, 197, 253, 0.72)"
                strokeWidth="0.32"
              />
              <line
                x1={block.xPct}
                y1={block.yPct}
                x2={block.xPct + block.wPct}
                y2={block.yPct + block.hPct}
                stroke="rgba(147, 197, 253, 0.22)"
                strokeWidth="0.2"
              />
            </g>
          ))}

        {/* Lighting Vector Lines (Photographs) */}
        {!isWireframe &&
          gridSpec.lightingNodes?.map((node, i) => (
            <line
              key={`light-ray-${i}`}
              x1={node.xPct}
              y1={node.yPct}
              x2={fx}
              y2={fy}
              stroke="rgba(251, 191, 36, 0.42)"
              strokeWidth="0.22"
              strokeDasharray="1.1 1.1"
            />
          ))}

        {/* Primary Focal Point Reticle */}
        <circle
          cx={fx}
          cy={fy}
          r="2.4"
          fill="none"
          stroke={isWireframe ? '#60A5FA' : '#FBBF24'}
          strokeWidth="0.3"
        />
        <circle
          cx={fx}
          cy={fy}
          r="0.55"
          fill={isWireframe ? '#93C5FD' : '#FDE68A'}
        />
      </svg>

      {/* Crisp Proportional HTML Spec Badges */}
      {showFullLabels && (
        <div className="absolute inset-0">
          {/* Top-Left Process Stamp */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/75 border border-white/15 backdrop-blur-sm">
            <span className="font-mono-catalog text-[10px] tracking-[0.08em] uppercase text-white/90">
              {isWireframe
                ? `X-RAY // SWISS GRID ${gridSpec.gridColumns}-COL • ${gridSpec.baselinePx}PX BASELINE`
                : `X-RAY // UNGRADED LOG RAW • CONTACT FRAME ${artifact.contactFrameCode}`}
            </span>
          </div>

          {isWireframe &&
            gridSpec.wireframeBlocks?.map((block, i) => (
              <div
                key={`wflabel-${i}`}
                className="absolute px-1.5 py-0.5 bg-blue-950/85 border border-blue-400/50 text-blue-100 font-mono-catalog text-[9px] tracking-[0.06em] uppercase"
                style={{
                  left: `${block.xPct}%`,
                  top: `${Math.max(2, block.yPct - 4)}%`,
                }}
              >
                {block.tag}
              </div>
            ))}

          {!isWireframe &&
            gridSpec.lightingNodes?.map((node, i) => (
              <div
                key={`lnode-${i}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 border border-amber-300/45 text-amber-100 font-mono-catalog text-[9px] tracking-[0.05em] uppercase whitespace-nowrap"
                style={{
                  left: `${Math.min(82, Math.max(18, node.xPct))}%`,
                  top: `${Math.min(88, Math.max(12, node.yPct))}%`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                <span>{node.label}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

