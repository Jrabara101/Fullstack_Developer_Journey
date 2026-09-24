import React from 'react';
import { Dialog, DialogClose } from './ui/dialog';
import { ReflexMode } from '../types/reaction';
import { Zap, Volume2, Crosshair, Check, Sparkles } from 'lucide-react';

interface ModesDialogProps {
  open: boolean;
  activeMode: ReflexMode;
  onSelectMode: (mode: ReflexMode) => void;
  onClose: () => void;
}

export const ModesDialog: React.FC<ModesDialogProps> = ({
  open,
  activeMode,
  onSelectMode,
  onClose,
}) => {
  const modes: {
    id: ReflexMode;
    title: string;
    icon: React.ReactNode;
    subtitle: string;
    description: string;
    bioNote: string;
  }[] = [
    {
      id: 'visual',
      title: 'Visual Flash',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      subtitle: 'OPTICAL SENSORY PATHWAY',
      description:
        'Full-viewport instant chromatic transition from Crimson Anticipation (#DC2626) to Electric Emerald (#16A34A).',
      bioNote: 'Average human response: 200–250ms due to phototransduction in the retina.',
    },
    {
      id: 'audio',
      title: 'Auditory Burst',
      icon: <Volume2 className="w-5 h-5 text-cyan-400" />,
      subtitle: 'ACOUSTIC SENSORY PATHWAY',
      description:
        'Sub-1ms instantaneous pure sine frequency tone burst generated natively via Web Audio API oscillators.',
      bioNote:
        'Cochlear nerve transduction to brainstem is ~30–50ms faster than optical processing (typically 140–180ms).',
    },
    {
      id: 'peripheral',
      title: 'Peripheral Flank',
      icon: <Crosshair className="w-5 h-5 text-amber-400" />,
      subtitle: 'SPATIAL RETINAL SACCADE',
      description:
        'Randomly positioned target pip spawns across peripheral coordinates, demanding rapid ocular saccade and aim.',
      bioNote:
        'Benchmarks peripheral rod photoreceptor sensitivity and rapid motor orientation under stress.',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogClose onClose={onClose} />
      <div className="flex flex-col p-2 sm:p-4 text-left">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            SENSORY REFLEX MODES
          </h2>
        </div>
        <p className="font-mono text-xs text-zinc-400 mb-6">
          SELECT NEUROMUSCULAR COMBINE PROTOCOL
        </p>

        <div className="flex flex-col gap-3">
          {modes.map((m) => {
            const isSelected = activeMode === m.id;
            return (
              <div
                key={m.id}
                onClick={() => {
                  onSelectMode(m.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-zinc-900 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      {m.icon}
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
                        {m.subtitle}
                      </div>
                      <h3 className="text-base font-bold text-white font-sans">{m.title}</h3>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono text-[10px] font-bold">
                      <Check className="w-3 h-3 text-cyan-400" />
                      <span>ARMED</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-300 font-sans mt-3 leading-relaxed">
                  {m.description}
                </p>

                <div className="mt-2.5 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-[11px] font-mono text-zinc-400">
                  🧬 <strong>Biometric Context</strong>: {m.bioNote}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
};
