import React, { useState } from 'react';
import type { PetEntity } from '../types/pet';
import { SPECIES_CATALOG } from '../lib/speciesData';
import { X, Copy, Check, Award, Calendar, ShieldCheck, Heart } from 'lucide-react';

interface PetPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetEntity;
}

export const PetPassportModal: React.FC<PetPassportModalProps> = ({ isOpen, onClose, pet }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const species = SPECIES_CATALOG[pet.speciesId] || SPECIES_CATALOG.blobkin;
  const lineage = pet.lineagePath || ['egg'];

  // Generate copyable holographic markdown string
  const passportText = `
═══ 🌟 AETHELPET OFFICIAL PASSPORT & LEDGER 🌟 ═══
NAME: ${pet.name}
SPECIES: ${species.name} (${pet.stage})
AGE: Day ${Math.floor(pet.ageDays) + 1} (${pet.ageDays.toFixed(1)} days elapsed)
DIETARY AFFINITY: ${species.dietPreference}
LINEAGE TREE: ${lineage.map((id) => SPECIES_CATALOG[id]?.avatarEmoji || '🐾').join(' ➔ ')}
MILESTONES: 🏆 Hatchling Bond • 🫧 Suds Virtuoso • 🧬 Epigenetic Pioneer
STATUS: ${pet.mood} // Vitals: Hunger ${Math.round(pet.vitals.hunger)}% | Hygiene ${Math.round(pet.vitals.hygiene)}%
PASSPORT ID: #${pet.id.toUpperCase().slice(0, 10)}
═════════════════════════════════════════════════
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(passportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badges = [
    { name: 'First Hatch', icon: '🥚', desc: 'Bonded and hatched in nursery' },
    { name: 'Suds Virtuoso', icon: '🫧', desc: 'Maintained spotless hygiene' },
    { name: 'Ball Striker', icon: '⚽', desc: 'Achieved high velocity bounce' },
    { name: 'Pollen Swapper', icon: '🧬', desc: 'Synthesized hybrid seeds' },
    { name: 'Dream State', icon: '💤', desc: 'Clock-tamper resilient sleep' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="glass-modal w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-hidden border border-slate-700/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Holographic Pet Passport</h2>
              <p className="text-xs text-slate-400">Cryptographically verifiable lineage and care ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Holographic Card */}
        <div className="holographic-card rounded-2xl p-5 border border-white/20 shadow-2xl flex flex-col gap-4 text-white relative">
          <div className="flex items-start justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl p-2 rounded-2xl bg-slate-900/60 border border-white/20 backdrop-blur-sm">
                {species.avatarEmoji}
              </span>
              <div>
                <h3 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  {pet.name}
                  <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
                </h3>
                <span className="text-xs font-semibold text-cyan-300">
                  {species.name} • {pet.stage}
                </span>
              </div>
            </div>

            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 text-amber-300">
              #{pet.id.slice(0, 8)}
            </span>
          </div>

          {/* Lineage Progression Trail */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
              Epigenetic Lineage Trail
            </span>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-black/30 border border-white/10 text-lg">
              {lineage.map((sId, idx) => (
                <React.Fragment key={sId}>
                  <span title={SPECIES_CATALOG[sId]?.name || sId}>
                    {SPECIES_CATALOG[sId]?.avatarEmoji || '🐾'}
                  </span>
                  {idx < lineage.length - 1 && <span className="text-xs text-slate-400">➔</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Lifespan & Telemetry */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-black/30 border border-white/10 flex flex-col">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Lifespan Elapsed
              </span>
              <strong className="text-sm font-bold text-white">Day {Math.floor(pet.ageDays) + 1}</strong>
            </div>

            <div className="p-2 rounded-xl bg-black/30 border border-white/10 flex flex-col">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" /> Satiety & Joy
              </span>
              <strong className="text-sm font-bold text-white">
                {Math.round(pet.vitals.hunger)}% / {Math.round(pet.vitals.happiness)}%
              </strong>
            </div>
          </div>

          {/* Milestone Badges */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
              Sanctuary Milestone Badges
            </span>
            <div className="flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <div
                  key={b.name}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/15 text-xs"
                  title={b.desc}
                >
                  <span>{b.icon}</span>
                  <span className="text-[11px] font-semibold text-slate-200">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copy for Discord & Social Sharing */}
        <button
          onClick={handleCopy}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg transition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Holographic Passport (Discord / Social)'}</span>
        </button>
      </div>
    </div>
  );
};
