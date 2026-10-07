import type { PetEntity, VirtualPetGameState } from '../types/pet';
import {
  Utensils,
  Sparkles,
  Hand,
  Moon,
  Sun,
  Dna,
  Users,
  Award,
  CircleDot,
  Pill,
} from 'lucide-react';

interface BottomCareTrayProps {
  pet: PetEntity;
  activeTool: VirtualPetGameState['activeTool'];
  onSelectTool: (tool: VirtualPetGameState['activeTool']) => void;
  onOpenFeedingDrawer: () => void;
  onPlayBall: () => void;
  onToggleSleep: () => void;
  onUseMedicine: () => void;
  onOpenEvolutionTree: () => void;
  onOpenPlaydateLobby: () => void;
  onOpenPassport: () => void;
}

export const BottomCareTray: React.FC<BottomCareTrayProps> = ({
  pet,
  activeTool,
  onSelectTool,
  onOpenFeedingDrawer,
  onPlayBall,
  onToggleSleep,
  onUseMedicine,
  onOpenEvolutionTree,
  onOpenPlaydateLobby,
  onOpenPassport,
}) => {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-2xl select-none">
      <div className="glass-hud rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-1.5 overflow-x-auto">
        {/* 1. Feed / Food Dropper */}
        <button
          onClick={() => {
            onSelectTool('FOOD_DROPPER');
            onOpenFeedingDrawer();
          }}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition min-w-[58px] ${
            activeTool === 'FOOD_DROPPER'
              ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 shadow-lg shadow-rose-950/40'
              : 'hover:bg-slate-800/60 text-slate-300'
          }`}
          title="Feed Companion (Hotkey: 3)"
        >
          <Utensils className="w-5 h-5 text-rose-400" />
          <span className="text-[10px] font-bold">Feed</span>
        </button>

        {/* 2. Sponge / Clean */}
        <button
          onClick={() => onSelectTool('SPONGE')}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition min-w-[58px] ${
            activeTool === 'SPONGE'
              ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50 shadow-lg shadow-sky-950/40'
              : 'hover:bg-slate-800/60 text-slate-300'
          }`}
          title="Scrub Sponge (Hotkey: 2)"
        >
          <Sparkles className="w-5 h-5 text-sky-400" />
          <span className="text-[10px] font-bold">Scrub</span>
        </button>

        {/* 3. Tactile Petting Hand */}
        <button
          onClick={() => onSelectTool('HAND')}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition min-w-[58px] ${
            activeTool === 'HAND'
              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-lg shadow-amber-950/40'
              : 'hover:bg-slate-800/60 text-slate-300'
          }`}
          title="Pet / Purr Touch (Hotkey: 1)"
        >
          <Hand className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-bold">Pet</span>
        </button>

        {/* 4. Toy Ball Play */}
        <button
          onClick={() => {
            onSelectTool('BALL');
            onPlayBall();
          }}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition min-w-[58px] ${
            activeTool === 'BALL'
              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-950/40'
              : 'hover:bg-slate-800/60 text-slate-300'
          }`}
          title="Bounce Toy Ball (Hotkey: 4)"
        >
          <CircleDot className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-bold">Play</span>
        </button>

        {/* 5. Circadian Sleep / Lamp */}
        <button
          onClick={onToggleSleep}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition min-w-[58px] ${
            pet.isSleeping
              ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/60 shadow-lg'
              : 'hover:bg-slate-800/60 text-slate-300'
          }`}
          title="Toggle Sleep Mode (Hotkey: 5)"
        >
          {pet.isSleeping ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          <span className="text-[10px] font-bold">{pet.isSleeping ? 'Wake' : 'Sleep'}</span>
        </button>

        {/* 6. Medicine (Appears/Highlights if SICK) */}
        {pet.mood === 'SICK' && (
          <button
            onClick={onUseMedicine}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition min-w-[58px] bg-rose-600/40 border border-rose-500 text-rose-200 animate-pulse"
            title="Administer Medicine"
          >
            <Pill className="w-5 h-5 text-rose-300" />
            <span className="text-[10px] font-bold">Cure</span>
          </button>
        )}

        <div className="w-[1px] h-8 bg-slate-700/60 my-auto mx-1" />

        {/* 7. Evolution Tree Dialog */}
        <button
          onClick={onOpenEvolutionTree}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl hover:bg-slate-800/60 text-slate-300 transition min-w-[58px]"
          title="Epigenetic Evolution Matrix"
        >
          <Dna className="w-5 h-5 text-fuchsia-400" />
          <span className="text-[10px] font-bold">Lineage</span>
        </button>

        {/* 8. Playdate Park Peer Lobby */}
        <button
          onClick={onOpenPlaydateLobby}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl hover:bg-slate-800/60 text-slate-300 transition min-w-[58px]"
          title="Playdate Park Multiplayer"
        >
          <Users className="w-5 h-5 text-cyan-400" />
          <span className="text-[10px] font-bold">Playdate</span>
        </button>

        {/* 9. Pet Passport & Ledger */}
        <button
          onClick={onOpenPassport}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl hover:bg-slate-800/60 text-slate-300 transition min-w-[58px]"
          title="Holographic Pet Passport"
        >
          <Award className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-bold">Passport</span>
        </button>
      </div>
    </div>
  );
};
