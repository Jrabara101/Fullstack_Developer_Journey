import React from 'react';
import { CharacterSheet, ComputedCharacterStats, EquipSlot, ItemEntity } from '../types/inventory';
import { ItemIcon } from './ItemIcon';
import { RadarChart } from './RadarChart';
import { Shield, Sparkles, AlertTriangle, Gauge, Heart, Droplet, User, Link as LinkIcon } from 'lucide-react';

interface CharacterSheetPaperDollProps {
  playerSheet: CharacterSheet;
  stats: ComputedCharacterStats;
  draggedItem: { item: ItemEntity; origin: string } | null;
  hoveredEquipSlot: EquipSlot | null;
  onStartDrag: (item: ItemEntity, origin: 'equipment', originX?: number, originY?: number, originSlot?: EquipSlot) => void;
  onHoverSlot: (slot: EquipSlot | null) => void;
  onEquipItem: (item: ItemEntity, slot?: EquipSlot) => void;
  onUnequipItem: (slot: EquipSlot) => void;
  onHoverItemForTooltip: (item: ItemEntity | null, e?: React.MouseEvent) => void;
  readOnly?: boolean;
}

export const CharacterSheetPaperDoll: React.FC<CharacterSheetPaperDollProps> = ({
  playerSheet,
  stats,
  draggedItem,
  hoveredEquipSlot,
  onStartDrag,
  onHoverSlot,
  onEquipItem,
  onUnequipItem,
  onHoverItemForTooltip,
  readOnly = false,
}) => {
  const isTwoHandedWielded = Boolean(playerSheet.equipped['main_hand']?.isTwoHanded);

  // Check if player has legendary gear for the gold astral aura
  const hasLegendary = Object.values(playerSheet.equipped).some(i => i?.rarity === 'legendary');
  const hasEpic = Object.values(playerSheet.equipped).some(i => i?.rarity === 'epic');

  const getSlotBorderClass = (slot: EquipSlot) => {
    const item = playerSheet.equipped[slot];
    const isHovered = hoveredEquipSlot === slot;

    if (isHovered && draggedItem) {
      return 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-105';
    }

    if (!item) {
      return 'border-white/10 bg-slate-900/40 hover:border-indigo-500/40';
    }

    switch (item.rarity) {
      case 'legendary':
        return 'border-amber-500 bg-amber-950/30 shadow-[0_0_14px_rgba(245,158,11,0.45)]';
      case 'epic':
        return 'border-purple-500 bg-purple-950/30 shadow-[0_0_12px_rgba(168,85,247,0.4)]';
      case 'rare':
        return 'border-blue-500 bg-blue-950/30 shadow-[0_0_10px_rgba(59,130,246,0.35)]';
      case 'uncommon':
        return 'border-emerald-500 bg-emerald-950/30 shadow-[0_0_8px_rgba(34,197,94,0.3)]';
      default:
        return 'border-slate-500 bg-slate-900/50 shadow-[0_0_6px_rgba(100,116,139,0.2)]';
    }
  };

  const renderSlot = (slot: EquipSlot, label: string, size = 'w-14 h-14', isDisabled = false) => {
    const item = playerSheet.equipped[slot];

    return (
      <div className="flex flex-col items-center">
        <div
          onMouseEnter={(e) => {
            if (!readOnly) onHoverSlot(slot);
            if (item) onHoverItemForTooltip(item, e);
          }}
          onMouseLeave={() => {
            if (!readOnly) onHoverSlot(null);
            onHoverItemForTooltip(null);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            if (!readOnly && item) onUnequipItem(slot);
          }}
          onMouseUp={() => {
            if (!readOnly && draggedItem) {
              onEquipItem(draggedItem.item, slot);
            }
          }}
          onMouseDown={(e) => {
            if (!readOnly && item && e.button === 0) {
              onStartDrag(item, 'equipment', undefined, undefined, slot);
            }
          }}
          className={`relative ${size} rounded-xl border-2 flex items-center justify-center transition-all duration-200 cursor-pointer select-none group ${getSlotBorderClass(
            slot
          )} ${isDisabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}
        >
          {item ? (
            <div className="relative w-full h-full flex items-center justify-center p-1.5">
              <ItemIcon iconType={item.iconType} rarity={item.rarity} className="w-8 h-8 group-hover:scale-110 transition-transform" />
              {/* Stack / Durability mini indicators */}
              <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold text-slate-400">
                {item.stats.attackPower ? `+${item.stats.attackPower}` : item.stats.armor ? `+${item.stats.armor}` : ''}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-mono font-medium text-slate-600 uppercase tracking-wider text-center px-1">
              {isDisabled ? 'LOCKED' : label}
            </span>
          )}

          {/* Slot corner accents */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/30" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/30" />
        </div>
        <span className="text-[9px] text-slate-400 mt-1 font-mono uppercase tracking-wider">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-5 w-full max-w-md border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Background status aura */}
      {hasLegendary && (
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      )}
      {hasEpic && (
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={playerSheet.avatarUrl}
              alt={playerSheet.username}
              className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-500/60 shadow-lg"
            />
            <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white font-mono font-bold text-[10px] px-1.5 py-0.2 rounded-full border border-indigo-400">
              Lv.{playerSheet.level}
            </span>
          </div>
          <div>
            <h2 className="font-['Cinzel'] font-bold text-base text-slate-100 flex items-center gap-1.5">
              {playerSheet.username}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                {playerSheet.characterClass}
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-xs text-amber-400 font-mono font-medium">
                {playerSheet.gold.toLocaleString()} Gold
              </span>
            </div>
          </div>
        </div>

        {/* Status Aura Badge */}
        <div className="flex flex-col items-end">
          {hasLegendary ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
              <Sparkles className="w-3 h-3" /> Sunforged Aura
            </span>
          ) : hasEpic ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Arcane Aura
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
              Battle Ready
            </span>
          )}
        </div>
      </div>

      {/* Health & Mana Vitality Gauges */}
      <div className="grid grid-cols-2 gap-3">
        {/* HP */}
        <div className="bg-rose-950/20 border border-rose-900/30 p-2 rounded-xl">
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <Heart className="w-3 h-3 fill-rose-500/50" /> Health
            </span>
            <span className="text-slate-300 font-mono text-[10px]">
              {playerSheet.currentHp}/{playerSheet.maxHp}
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(playerSheet.currentHp / playerSheet.maxHp) * 100}%` }}
            />
          </div>
        </div>

        {/* MP */}
        <div className="bg-cyan-950/20 border border-cyan-900/30 p-2 rounded-xl">
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <Droplet className="w-3 h-3 fill-cyan-500/50" /> Mana
            </span>
            <span className="text-slate-300 font-mono text-[10px]">
              {playerSheet.currentMp}/{playerSheet.maxMp}
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(playerSheet.currentMp / playerSheet.maxMp) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Paper Doll Equipment Grid Layout */}
      <div className="relative py-2 flex flex-col items-center justify-center">
        {/* Silhouette background silhouette */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <User className="w-56 h-56 text-slate-300 stroke-[1]" />
        </div>

        {/* Paper Doll Rig Structure */}
        <div className="flex flex-col items-center gap-3 relative z-10 w-full">
          {/* Head & Amulet */}
          <div className="flex items-center justify-center gap-8">
            {renderSlot('amulet', 'Amulet', 'w-12 h-12')}
            {renderSlot('head', 'Helm', 'w-14 h-14')}
            {renderSlot('ring', 'Ring', 'w-12 h-12')}
          </div>

          {/* Main Hand, Chest, Off Hand */}
          <div className="flex items-center justify-center gap-5 relative">
            {renderSlot('main_hand', 'Main Hand', 'w-16 h-16')}
            {renderSlot('chest', 'Chest', 'w-16 h-16')}
            {renderSlot('off_hand', isTwoHandedWielded ? '2-Hand' : 'Off Hand', 'w-16 h-16', isTwoHandedWielded)}

            {/* Two Handed Weapon Connection Line */}
            {isTwoHandedWielded && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full text-[9px] font-mono">
                <LinkIcon className="w-2.5 h-2.5" /> 2-Handed Rigged
              </div>
            )}
          </div>

          {/* Hands & Legs */}
          <div className="flex items-center justify-center gap-6">
            {renderSlot('hands', 'Hands', 'w-13 h-13')}
            {renderSlot('legs', 'Legs', 'w-14 h-14')}
            {renderSlot('feet', 'Feet', 'w-13 h-13')}
          </div>
        </div>
      </div>

      {/* Hexagonal Radar Chart */}
      <div className="border-t border-white/10 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-['Cinzel'] font-bold text-slate-300 uppercase tracking-wider">
            Attribute Telemetry
          </span>
          <span className="text-[10px] font-mono text-indigo-400">
            STR {stats.strength} • DEX {stats.dexterity} • INT {stats.intelligence}
          </span>
        </div>
        <RadarChart stats={stats} size={210} />
      </div>

      {/* Encumbrance & Carry Capacity */}
      <div className="border-t border-white/10 pt-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5">
            <Gauge className={`w-3.5 h-3.5 ${stats.isOverburdened ? 'text-rose-400' : 'text-slate-400'}`} />
            <span className="font-semibold text-slate-300">Bag Encumbrance</span>
          </div>
          <span className="font-mono text-xs text-slate-300">
            {stats.totalWeight} / {stats.maxWeight} kg ({stats.encumbrancePercent}%)
          </span>
        </div>

        {/* Multi-tier Encumbrance Progress Bar */}
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/5 relative">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              stats.encumbrancePercent > 100
                ? 'bg-rose-500 animate-pulse'
                : stats.encumbrancePercent > 80
                ? 'bg-amber-500'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${Math.min(100, stats.encumbrancePercent)}%` }}
          />
        </div>

        {/* Encumbrance Penalties Status */}
        {stats.isOverburdened ? (
          <div className="mt-2 p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-[11px]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>OVERBURDENED:</strong> -{stats.movementPenaltyPercent}% Move Speed, -{stats.staminaRecoveryPenaltyPercent}% Stamina Regen!
            </span>
          </div>
        ) : stats.encumbrancePercent > 80 ? (
          <div className="mt-2 p-1.5 rounded-lg bg-amber-950/30 border border-amber-500/20 flex items-center gap-2 text-amber-300 text-[10px]">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Heavy Load:</strong> Minor movement & stamina penalties active.
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
