import React from 'react';
import { CharacterSheet, ItemEntity } from '../types/inventory';
import { computeCharacterStats } from '../engine/statCalculator';
import { CharacterSheetPaperDoll } from './CharacterSheetPaperDoll';
import { X, ShieldAlert, Sparkles } from 'lucide-react';

interface InspectModalProps {
  member: CharacterSheet;
  onClose: () => void;
  onHoverItemForTooltip: (item: ItemEntity | null, e?: React.MouseEvent) => void;
}

export const InspectModal: React.FC<InspectModalProps> = ({
  member,
  onClose,
  onHoverItemForTooltip,
}) => {
  const memberStats = computeCharacterStats(member);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative max-w-xl w-full max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-white/15 p-6 shadow-2xl flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-['Cinzel'] font-bold text-lg text-slate-100">
                Armory Inspection: {member.username}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Authoritative Server Mirror • Read-Only Inspection Deck
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Read-Only Paper Doll Rig */}
        <div className="flex justify-center">
          <CharacterSheetPaperDoll
            playerSheet={member}
            stats={memberStats}
            draggedItem={null}
            hoveredEquipSlot={null}
            onStartDrag={() => {}}
            onHoverSlot={() => {}}
            onEquipItem={() => {}}
            onUnequipItem={() => {}}
            onHoverItemForTooltip={onHoverItemForTooltip}
            readOnly={true}
          />
        </div>

        {/* Inspected Bag Overview */}
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 font-['Cinzel']">
              Carried Bag Inventory ({member.inventoryGrid.items.length} Items)
            </span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-black/40 border border-white/5">
            {member.inventoryGrid.items.map(placed => (
              <div
                key={placed.item.uid}
                onMouseEnter={e => onHoverItemForTooltip(placed.item, e)}
                onMouseLeave={() => onHoverItemForTooltip(null)}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2 cursor-pointer hover:bg-white/10"
              >
                <span className="font-medium">{placed.item.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {placed.item.width}×{placed.item.height}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
