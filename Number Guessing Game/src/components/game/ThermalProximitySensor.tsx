import { Radar, Flame, Snowflake, Sparkles } from 'lucide-react';

interface ThermalProximitySensorProps {
  lastDistance: number | null;
  target?: number;
  currentGuess?: number;
}

export function ThermalProximitySensor({
  lastDistance,
}: ThermalProximitySensorProps) {
  // If no guess made yet, show standby
  const dist = lastDistance ?? 50;

  // Tier calculation
  let label = 'STANDBY // SCANNER IDLE';
  let badgeColor = 'text-primary bg-primary/10 border-primary/20';
  let dotColor = 'bg-primary';
  let pulseSpeed = 'animate-pulse';
  let icon = <Radar className="w-4 h-4 text-primary animate-pulse" />;
  let description = 'Deploy code to calibrate harmonic resonance sensors';

  if (lastDistance !== null) {
    if (dist === 0) {
      label = 'PROXIMITY: ZERO DELTA // UNLOCKED';
      badgeColor = 'text-tertiary bg-tertiary/10 border-tertiary/30';
      dotColor = 'bg-tertiary';
      icon = <Sparkles className="w-4 h-4 text-tertiary animate-spin" />;
      description = 'Cipher match confirmed. Core encryption defeated.';
    } else if (dist <= 5) {
      label = 'PROXIMITY PING: SCORCHING HOT';
      badgeColor = 'text-error bg-error/15 border-error/40';
      dotColor = 'bg-error';
      icon = <Flame className="w-4 h-4 text-error animate-bounce" />;
      description = 'Resonance active within ±5 units of target vector!';
    } else if (dist <= 15) {
      label = 'PROXIMITY PING: WARM';
      badgeColor = 'text-secondary bg-secondary/15 border-secondary/35';
      dotColor = 'bg-secondary';
      icon = <Radar className="w-4 h-4 text-secondary animate-pulse" />;
      description = 'Harmonic signal detected within ±15% of domain';
    } else if (dist <= 30) {
      label = 'PROXIMITY PING: LUKEWARM';
      badgeColor = 'text-secondary-dim bg-secondary-dim/10 border-secondary-dim/20';
      dotColor = 'bg-secondary-dim';
      icon = <Radar className="w-4 h-4 text-secondary-dim" />;
      description = 'Faint sensor pulse. Approximate sector bracket established.';
    } else {
      label = 'PROXIMITY PING: SUB-ZERO';
      badgeColor = 'text-primary bg-primary/10 border-primary/20';
      dotColor = 'bg-primary';
      icon = <Snowflake className="w-4 h-4 text-primary" />;
      description = 'Divergent frequency. Vector outside active harmonic envelope.';
    }
  }

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-lowest border border-outline-variant/50 shadow-inner">
        {icon}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}
          >
            {label}
          </span>
          <div className="flex gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pulseSpeed}`} />
            <span
              className={`w-1.5 h-1.5 rounded-full ${dotColor} ${
                dist <= 15 ? pulseSpeed : 'opacity-40'
              }`}
            />
            <span
              className={`w-1.5 h-1.5 rounded-full ${dotColor} ${
                dist <= 5 ? pulseSpeed : 'opacity-20'
              }`}
            />
          </div>
        </div>
        <span className="font-sans text-xs text-on-surface-variant mt-0.5">{description}</span>
      </div>
    </div>
  );
}
