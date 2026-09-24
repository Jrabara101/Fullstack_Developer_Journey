import { AlertTriangle, Terminal } from 'lucide-react';

interface VaultChassisProps {
  children: React.ReactNode;
  onSimulateWin: () => void;
  lastDistance: number | null;
}

export function VaultChassis({
  children,
  onSimulateWin,
  lastDistance,
}: VaultChassisProps) {
  // Thermal Proximity Chassis Glow
  let glowStyle = 'shadow-[0_0_30px_rgba(56,189,248,0.15)] border-outline-variant/50';

  if (lastDistance !== null) {
    if (lastDistance <= 5) {
      glowStyle = 'shadow-[0_0_45px_rgba(239,68,68,0.4)] border-error/50';
    } else if (lastDistance <= 15) {
      glowStyle = 'shadow-[0_0_35px_rgba(245,158,11,0.3)] border-secondary/50';
    }
  }

  return (
    <div
      className={`relative w-full max-w-3xl bg-surface-container-lowest p-4 sm:p-6 rounded-2xl border transition-all duration-500 overflow-hidden ${glowStyle}`}
    >
      {/* 4 Micro Bevel & Rivet Corner Accents */}
      <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-outline-variant/60 shadow-inner" />
      <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-outline-variant/60 shadow-inner" />
      <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-outline-variant/60 shadow-inner" />
      <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-outline-variant/60 shadow-inner" />

      {/* Top System Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="font-mono text-xs text-primary font-bold uppercase tracking-widest">
            CIPHER DECK :: MK-VII
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[10px]">
            CORE FREQ: 98.4 MHz
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-secondary uppercase tracking-widest font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            SEC-LVL 3 CRITICAL
          </span>

          {/* Quick Simulation Button for Demo */}
          <button
            type="button"
            onClick={onSimulateWin}
            title="Simulate breach resolution"
            className="ml-2 px-2 py-0.5 bg-surface-container-highest hover:bg-tertiary hover:text-on-tertiary rounded text-on-surface-variant font-mono text-[10px] transition-colors flex items-center gap-1 active:scale-95"
          >
            <Terminal className="w-3 h-3" />
            <span>SIM WIN</span>
          </button>
        </div>
      </div>

      {/* Main Recessed Bay */}
      <div className="relative bg-surface-container-low p-3 sm:p-5 rounded-xl border border-outline-variant/40 shadow-inner flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}
