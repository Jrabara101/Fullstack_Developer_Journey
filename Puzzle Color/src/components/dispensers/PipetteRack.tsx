import React, { useEffect } from 'react';
import { ReagentSource } from '../../types/color';
import { ReagentFlask } from './ReagentFlask';

interface PipetteRackProps {
  reagents: ReagentSource[];
  onDispense: (reagentId: string, volumeMl: number, tool: 'pipette' | 'pour') => void;
  patternsEnabled: boolean;
  disabled?: boolean;
}

export const PipetteRack: React.FC<PipetteRackProps> = ({
  reagents,
  onDispense,
  patternsEnabled,
  disabled = false,
}) => {
  // Global Keyboard hotkeys (1-6 to dispense)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= reagents.length) {
        const reagent = reagents[num - 1];
        if (reagent && reagent.remainingVolumeMl > 0 && !disabled) {
          onDispense(reagent.id, 0.5, 'pipette');
          window.dispatchEvent(
            new CustomEvent('reagent-dispensed', {
              detail: { colorHex: reagent.color.hex, reagentId: reagent.id },
            })
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reagents, onDispense, disabled]);

  return (
    <section className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold">
            Reagent Dispenser Rack
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          Keys: [1-{reagents.length}] | Resolution: 0.1 - 0.5 ml
        </span>
      </div>

      {/* Reagent Flasks Horizontal Dock */}
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-2 px-2 snap-x">
        {reagents.map((reagent, idx) => (
          <ReagentFlask
            key={reagent.id}
            reagent={reagent}
            index={idx}
            onDispense={onDispense}
            patternsEnabled={patternsEnabled}
            disabled={disabled}
          />
        ))}
      </div>
    </section>
  );
};
