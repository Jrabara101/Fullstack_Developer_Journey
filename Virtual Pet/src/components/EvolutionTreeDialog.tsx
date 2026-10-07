import { useState } from 'react';
import type { PetEntity, SpeciesInfo, LifeStage } from '../types/pet';
import { SPECIES_CATALOG } from '../lib/speciesData';
import { X, Sparkles, Lock, Dna } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EvolutionTreeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetEntity;
  evolutionCandidate: {
    canEvolve: boolean;
    nextSpeciesId: string | null;
    nextStage: LifeStage | null;
    explanation: string;
  } | null;
  onTriggerEvolve: () => void;
}

export const EvolutionTreeDialog: React.FC<EvolutionTreeDialogProps> = ({
  isOpen,
  onClose,
  pet,
  evolutionCandidate,
  onTriggerEvolve,
}) => {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(pet.speciesId);

  if (!isOpen) return null;

  const currentSpecies = SPECIES_CATALOG[pet.speciesId] || SPECIES_CATALOG.blobkin;
  const inspectedSpecies: SpeciesInfo = SPECIES_CATALOG[selectedSpeciesId] || currentSpecies;
  const lineage = pet.lineagePath || ['egg'];

  const stages: { stage: LifeStage; label: string; species: string[] }[] = [
    { stage: 'EGG', label: 'Stage 0: Embryo', species: ['egg'] },
    { stage: 'BABY', label: 'Stage I: Baby', species: ['blobkin'] },
    { stage: 'CHILD', label: 'Stage II: Child', species: ['chibi_sprout', 'nibble_pug', 'sparkle_mite'] },
    { stage: 'TEEN', label: 'Stage III: Teen', species: ['verdant_cub', 'pyro_fang', 'glimmer_sprite', 'iron_shell'] },
    {
      stage: 'ADULT',
      label: 'Stage IV: Adult',
      species: ['cyber_drake', 'mossy_boulderkind', 'astral_wisp', 'solar_gryphon', 'voidling', 'mecha_titan'],
    },
    { stage: 'ANCIENT', label: 'Stage V: Ancient', species: ['celestial_guardian'] },
  ];

  const handleEvolveClick = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
    onTriggerEvolve();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="glass-modal w-full max-w-4xl rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-hidden border border-slate-700/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Dna className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Epigenetic Branching Evolution Matrix
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                  Authoritative
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Biological mutations branch organically from diet telemetry, cleanliness latency, and exercise
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evolution Ready Banner */}
        {evolutionCandidate?.canEvolve && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/25 via-indigo-500/25 to-emerald-500/25 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3 text-left">
              <Sparkles className="w-7 h-7 text-amber-300 animate-spin-slow shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-white">Mutation Threshold Reached!</h4>
                <p className="text-xs text-slate-300">{evolutionCandidate.explanation}</p>
              </div>
            </div>
            <button
              onClick={handleEvolveClick}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-lg transition shrink-0"
            >
              Trigger Stage Mutation
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Left: Interactive Tree Nodes Viewport */}
          <div className="lg:col-span-2 overflow-y-auto max-h-[55vh] pr-2 flex flex-col gap-6">
            {stages.map((stageObj) => (
              <div key={stageObj.stage} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {stageObj.label}
                  </span>
                  <div className="h-[1px] flex-1 bg-slate-800" />
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {stageObj.species.map((sId) => {
                    const sp = SPECIES_CATALOG[sId];
                    if (!sp) return null;

                    const isCurrent = pet.speciesId === sId;
                    const isUnlocked = lineage.includes(sId) || isCurrent;
                    const isInspected = selectedSpeciesId === sId;

                    return (
                      <button
                        key={sId}
                        onClick={() => setSelectedSpeciesId(sId)}
                        className={`p-3 rounded-2xl border transition flex items-center gap-3 relative min-w-[150px] ${
                          isInspected
                            ? 'bg-indigo-950/80 border-indigo-400 shadow-lg shadow-indigo-950/60'
                            : isUnlocked
                            ? 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                            : 'bg-slate-950/60 border-slate-800/60 opacity-60 hover:opacity-80'
                        }`}
                      >
                        {/* Avatar Emoji or Silhouette */}
                        <div
                          className={`text-2xl p-2 rounded-xl border ${
                            isUnlocked
                              ? 'bg-slate-800 border-slate-700'
                              : 'bg-slate-950 border-slate-800 grayscale'
                          }`}
                        >
                          {isUnlocked ? sp.avatarEmoji : '❓'}
                        </div>

                        <div className="text-left">
                          <h5 className="font-bold text-xs text-white flex items-center gap-1">
                            {isUnlocked ? sp.name : 'Unknown Branch'}
                            {isCurrent && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            )}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {isCurrent ? (
                              <span className="text-emerald-400 font-bold">Active Form</span>
                            ) : isUnlocked ? (
                              <span className="text-indigo-400">Lineage Ancestor</span>
                            ) : (
                              <span className="text-slate-500 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Locked
                              </span>
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Species Profile Inspector */}
          <div className="glass-hud rounded-2xl p-4 flex flex-col justify-between border border-slate-700/60 max-h-[55vh] overflow-y-auto">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <span className="text-4xl p-2 rounded-2xl bg-slate-900 border border-slate-700">
                  {inspectedSpecies.avatarEmoji}
                </span>
                <div>
                  <h4 className="font-bold text-base text-white">{inspectedSpecies.name}</h4>
                  <span className="text-xs font-semibold text-indigo-400">
                    {inspectedSpecies.stage} Class Companion
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{inspectedSpecies.description}</p>

              {/* Epigenetic Criteria */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5 text-xs">
                <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                  Evolution Prerequisite
                </span>
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  {inspectedSpecies.epigeneticRequirement}
                </span>
              </div>

              {/* Diet Preference */}
              <div className="text-xs text-slate-300">
                <span className="font-bold text-slate-400">Dietary Affinity:</span>{' '}
                <span className="text-white">{inspectedSpecies.dietPreference}</span>
              </div>

              {/* Key Features */}
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                  Adaptive Traits
                </span>
                <div className="flex flex-wrap gap-1">
                  {inspectedSpecies.features.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[11px] border border-slate-700"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Pet Care Telemetry Comparison */}
            <div className="pt-3 border-t border-slate-800/80 mt-3 flex flex-col gap-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Sugar / Sweet Intake:</span>
                <span className="font-bold text-fuchsia-400">{Math.round(pet.epigenetics.sugarIntake)}</span>
              </div>
              <div className="flex justify-between">
                <span>Protein / Savory Intake:</span>
                <span className="font-bold text-orange-400">{Math.round(pet.epigenetics.proteinIntake)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleanliness Latency Score:</span>
                <span className="font-bold text-sky-400">
                  {Math.round(pet.epigenetics.hygieneCareAverage * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Exercise & Discipline Ratio:</span>
                <span className="font-bold text-emerald-400">
                  {Math.round(pet.epigenetics.playDisciplineRatio * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
