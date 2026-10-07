import { useState } from 'react';
import type { PetEntity } from '../types/pet';
import { SPECIES_CATALOG } from '../lib/speciesData';
import { sound } from '../lib/sound';
import { Volume2, VolumeX, Sparkles, Coins, Sun, Moon, Sunrise, Sunset, Edit2, Check } from 'lucide-react';

interface TopBarProps {
  pet: PetEntity;
  coins: number;
  dayNightPhase: 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';
  onRename: (newName: string) => void;
  onOpenEvolutionTree: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  pet,
  coins,
  dayNightPhase,
  onRename,
  onOpenEvolutionTree,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(pet.name);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const species = SPECIES_CATALOG[pet.speciesId] || SPECIES_CATALOG.blobkin;

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onRename(nameInput.trim());
      setIsEditing(false);
    }
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    sound.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  const getPhaseIcon = () => {
    switch (dayNightPhase) {
      case 'DAWN':
        return <Sunrise className="w-4 h-4 text-amber-400" />;
      case 'DAY':
        return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'DUSK':
        return <Sunset className="w-4 h-4 text-rose-400" />;
      case 'NIGHT':
        return <Moon className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 glass-hud px-4 py-2.5 flex items-center justify-between z-30 select-none">
      {/* Left: Pet Identity & Rename */}
      <div className="flex items-center gap-3">
        <div className="text-2xl p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
          {species.avatarEmoji}
        </div>

        <div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-sm font-semibold text-white focus:outline-none"
                  autoFocus
                  maxLength={18}
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                  title="Confirm Name"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group">
                <span className="font-bold text-base tracking-tight text-white">{pet.name}</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="opacity-60 group-hover:opacity-100 hover:text-indigo-400 transition"
                  title="Rename Companion"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Species Stage Badge */}
            <button
              onClick={onOpenEvolutionTree}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>{species.name}</span>
              <span className="text-[10px] opacity-75">({pet.stage})</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
            <span>Age: <strong className="text-slate-200">Day {Math.floor(pet.ageDays) + 1}</strong></span>
            <span>•</span>
            <span>EXP: <strong className="text-emerald-400">{pet.experience}</strong></span>
          </div>
        </div>
      </div>

      {/* Right: Currency, Phase, Audio */}
      <div className="flex items-center gap-3">
        {/* Day/Night Chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/50 text-xs font-medium text-slate-300">
          {getPhaseIcon()}
          <span className="capitalize">{dayNightPhase.toLowerCase()}</span>
        </div>

        {/* Currency Balance */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>{coins}</span>
        </div>

        {/* Mute Button */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 transition"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    </header>
  );
};
