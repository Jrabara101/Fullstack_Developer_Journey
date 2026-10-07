import React from 'react';
import { ItemEntity, Quest } from '../types/inventory';
import { ItemIcon } from './ItemIcon';
import { Compass, CheckCircle, Circle, Skull, Gift, Sparkles, Sword } from 'lucide-react';

interface QuestTrackerPodiumProps {
  quest?: Quest;
  onAdvanceQuestStep: (questId: string) => void;
  onHoverItemForTooltip: (item: ItemEntity | null, e?: React.MouseEvent) => void;
}

export const QuestTrackerPodium: React.FC<QuestTrackerPodiumProps> = ({
  quest,
  onAdvanceQuestStep,
  onHoverItemForTooltip,
}) => {
  if (!quest) return null;

  const isComplete = quest.status === 'completed';

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 w-full max-w-sm border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <h2 className="font-['Cinzel'] font-bold text-base text-slate-100 tracking-wide">
            Party Quest Log
          </h2>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
            isComplete
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}
        >
          {isComplete ? 'COMPLETED' : 'IN PROGRESS'}
        </span>
      </div>

      {/* Quest Banner & Description */}
      <div className="space-y-1">
        <h3 className="font-['Cinzel'] font-bold text-sm text-slate-200">
          {quest.title}
        </h3>
        <p className="text-xs text-slate-400 italic leading-relaxed">
          "{quest.description}"
        </p>
      </div>

      {/* Objectives Checkpoints */}
      <div className="space-y-2 bg-black/30 p-3 rounded-xl border border-white/5">
        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
          Checkpoints:
        </span>
        <div className="space-y-1.5">
          {quest.objectives.map(obj => (
            <div key={obj.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {obj.completed ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span className={obj.completed ? 'text-slate-400 line-through' : 'text-slate-200 font-medium'}>
                  {obj.title}
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {obj.current}/{obj.required}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Guaranteed Loot Preview */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px]">
            <Gift className="w-3.5 h-3.5 text-amber-400" /> Milestone Spoils:
          </span>
          <span className="font-mono text-amber-300">+{quest.rewardGold} Gold • +{quest.rewardExp} EXP</span>
        </div>

        {quest.rewardItems.length > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5">
            {quest.rewardItems.map(item => (
              <div
                key={item.uid}
                onMouseEnter={e => onHoverItemForTooltip(item, e)}
                onMouseLeave={() => onHoverItemForTooltip(null)}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-amber-500/30 cursor-pointer hover:border-amber-400 transition-all hover:scale-105"
              >
                <ItemIcon iconType={item.iconType} rarity={item.rarity} className="w-6 h-6" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-slate-200 block truncate max-w-[130px]">
                    {item.name}
                  </span>
                  <span className="text-[9px] font-mono text-amber-400 uppercase">
                    {item.rarity} Roll
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advance / Slay Boss Action Button */}
      {!isComplete && (
        <button
          onClick={() => onAdvanceQuestStep(quest.id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-95 border border-indigo-400/30"
        >
          <Sword className="w-4 h-4 text-amber-300" /> Advance Milestone / Slay Boss
        </button>
      )}
    </div>
  );
};
