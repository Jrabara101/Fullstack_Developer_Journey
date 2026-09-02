import React from 'react';
import { GameEngine } from '../game/gameEngine';

interface HitFeedbackProps {
  engine: GameEngine;
}

const HIT_MARKER_MS = 420;
const DAMAGE_INDICATOR_MS = 1300;
const DAMAGE_FLASH_MS = 400;

/**
 * Crosshair hit confirmation, floating damage numbers, directional damage arcs,
 * and the red screen edge on taking fire. Purely presentational — all state is
 * owned by the engine and expires there.
 */
export const HitFeedback: React.FC<HitFeedbackProps> = ({ engine }) => {
  const now = performance.now();
  const markers = engine.hitMarkers;
  const indicators = engine.damageIndicators;

  const newestMarker = markers.length ? markers[markers.length - 1] : null;
  const markerAge = newestMarker ? now - newestMarker.createdAt : Infinity;
  const markerVisible = markerAge < HIT_MARKER_MS;
  const markerOpacity = markerVisible ? 1 - markerAge / HIT_MARKER_MS : 0;

  const flashAge = now - engine.lastDamageFlash;
  const flashOpacity = flashAge < DAMAGE_FLASH_MS ? 0.5 * (1 - flashAge / DAMAGE_FLASH_MS) : 0;

  const markerColor = newestMarker?.isFatal
    ? '#f87171'
    : newestMarker?.isHeadshot
    ? '#fbbf24'
    : '#e2e8f0';

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* Damage vignette */}
      {flashOpacity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            opacity: flashOpacity,
            background:
              'radial-gradient(ellipse at center, transparent 45%, rgba(190,18,18,0.85) 100%)',
          }}
        />
      )}

      {/* Hit marker */}
      {markerVisible && newestMarker && (
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          width="34"
          height="34"
          viewBox="0 0 34 34"
          style={{ opacity: markerOpacity }}
          aria-hidden="true"
        >
          {[
            [9, 9, 14, 14],
            [25, 9, 20, 14],
            [9, 25, 14, 20],
            [25, 25, 20, 20],
          ].map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={markerColor}
              strokeWidth={newestMarker.isFatal ? 2.6 : 2}
              strokeLinecap="round"
            />
          ))}
        </svg>
      )}

      {/* Floating damage numbers */}
      {markers.map((m, i) => {
        const age = now - m.createdAt;
        if (age >= HIT_MARKER_MS) return null;
        const progress = age / HIT_MARKER_MS;
        // Fan successive hits apart so a spray doesn't stack into one blob.
        const drift = ((i % 3) - 1) * 26;
        return (
          <span
            key={m.id}
            className="absolute left-1/2 top-1/2 font-mono text-sm font-black tabular-nums"
            style={{
              color: m.isHeadshot ? '#fbbf24' : '#e2e8f0',
              opacity: 1 - progress,
              transform: `translate(calc(-50% + ${34 + drift}px), calc(-50% - ${18 + progress * 26}px))`,
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
            }}
          >
            {m.damage}
          </span>
        );
      })}

      {/* Directional damage indicators */}
      {indicators.map((d) => {
        const age = now - d.createdAt;
        if (age >= DAMAGE_INDICATOR_MS) return null;
        const opacity = 1 - age / DAMAGE_INDICATOR_MS;
        return (
          <div
            key={d.id}
            className="absolute left-1/2 top-1/2"
            style={{
              // Engine yaw is measured clockwise from -Z; negate for CSS rotation.
              transform: `rotate(${-d.angle}rad)`,
              opacity,
            }}
          >
            <svg
              width="240"
              height="240"
              viewBox="0 0 240 240"
              style={{ transform: 'translate(-50%, -50%)' }}
              aria-hidden="true"
            >
              <path
                d="M 96 34 A 90 90 0 0 1 144 34"
                fill="none"
                stroke="#ef4444"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
