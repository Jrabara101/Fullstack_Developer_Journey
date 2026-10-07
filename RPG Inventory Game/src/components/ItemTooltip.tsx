import React from 'react';
import { ItemEntity, CharacterSheet } from '../types/inventory';
import { compareItemStats } from '../engine/statCalculator';
import { Coins, Sparkles, Scale, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ItemTooltipProps {
  item: ItemEntity;
  playerSheet: CharacterSheet;
  position?: { x: number; y: number };
}

export const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, playerSheet, position }) => {
  // Find current equipped item for comparison if item is equippable
  const targetSlot = item.equipSlot;
  const currentEquipped = targetSlot ? playerSheet.equipped[targetSlot] || null : null;
  const isCurrentlyEquipped = targetSlot && playerSheet.equipped[targetSlot]?.uid === item.uid;

  const differentials = (!isCurrentlyEquipped && targetSlot) 
    ? compareItemStats(item, currentEquipped) 
    : [];

  const getRarityHeaderStyle = () => {
    switch (item.rarity) {
      case 'legendary':
        return 'from-amber-950/80 via-amber-900/40 to-transparent border-amber-500/50 text-amber-300';
      case 'epic':
        return 'from-purple-950/80 via-purple-900/40 to-transparent border-purple-500/50 text-purple-300';
      case 'rare':
        return 'from-blue-950/80 via-blue-900/40 to-transparent border-blue-500/50 text-blue-300';
      case 'uncommon':
        return 'from-emerald-950/80 via-emerald-900/40 to-transparent border-emerald-500/50 text-emerald-300';
      default:
        return 'from-slate-900/80 via-slate-800/40 to-transparent border-slate-600/50 text-slate-200';
    }
  };

  const rarityName = item.rarity.toUpperCase();

  // Floating coordinates positioning
  const style = position
    ? {
        left: `${Math.min(window.innerWidth - 340, Math.max(16, position.x + 18))}px`,
        top: `${Math.min(window.innerHeight - 440, Math.max(16, position.y + 18))}px`,
      }
    : undefined;

  return (
    <div 
      style={style}
      className={`${position ? 'fixed z-50 pointer-events-none' : 'w-full'} w-80 rounded-xl bg-[#0d111a]/95 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden text-xs text-slate-300 animate-in fade-in duration-150`}
    >
      {/* Top Rarity Banner */}
      <div className={`px-4 py-2.5 bg-gradient-to-r ${getRarityHeaderStyle()} border-b`}>
        <div className="flex items-center justify-between">
          <span className="font-['Cinzel'] tracking-wider text-[10px] font-bold uppercase opacity-80">
            {rarityName} {item.category}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {item.width}×{item.height} Grid
          </span>
        </div>
        <h3 className="font-['Cinzel'] text-sm font-bold tracking-wide mt-0.5 leading-tight">
          {item.name}
        </h3>
        {item.isTwoHanded && (
          <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
            Two-Handed Weapon
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="p-3.5 space-y-2.5">
        {/* Core Stats */}
        <div className="space-y-1 bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
          {item.stats.attackPower && (
            <div className="flex justify-between items-center text-rose-300 font-semibold text-sm">
              <span>Attack Power:</span>
              <span className="font-mono">+{item.stats.attackPower}</span>
            </div>
          )}
          {item.stats.armor && (
            <div className="flex justify-between items-center text-blue-300 font-semibold text-sm">
              <span>Armor Protection:</span>
              <span className="font-mono">+{item.stats.armor}</span>
            </div>
          )}
          {item.stats.strength && (
            <div className="flex justify-between items-center text-amber-200">
              <span>Strength:</span>
              <span className="font-mono">+{item.stats.strength}</span>
            </div>
          )}
          {item.stats.dexterity && (
            <div className="flex justify-between items-center text-emerald-300">
              <span>Dexterity:</span>
              <span className="font-mono">+{item.stats.dexterity}</span>
            </div>
          )}
          {item.stats.intelligence && (
            <div className="flex justify-between items-center text-cyan-300">
              <span>Intelligence:</span>
              <span className="font-mono">+{item.stats.intelligence}</span>
            </div>
          )}
          {item.stats.critChance && (
            <div className="flex justify-between items-center text-yellow-300">
              <span>Critical Strike:</span>
              <span className="font-mono">+{item.stats.critChance}%</span>
            </div>
          )}
          {item.stats.elementalHaste && (
            <div className="flex justify-between items-center text-indigo-300">
              <span>Elemental Haste:</span>
              <span className="font-mono">+{item.stats.elementalHaste}%</span>
            </div>
          )}
          {item.stats.stamina && (
            <div className="flex justify-between items-center text-orange-300">
              <span>Stamina:</span>
              <span className="font-mono">+{item.stats.stamina}</span>
            </div>
          )}
        </div>

        {/* Affixes & Enchantments */}
        {item.affixes && item.affixes.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Enchantments
            </span>
            <ul className="space-y-0.5">
              {item.affixes.map((affix, idx) => (
                <li key={idx} className="text-indigo-200/90 text-[11px] leading-snug">
                  • {affix}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dynamic Differential Comparison Pill vs Equipped Item */}
        {differentials.length > 0 && (
          <div className="pt-2 border-t border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              <span>Compared to equipped {currentEquipped ? currentEquipped.name : '(Empty Slot)'}:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {differentials.map((diff, idx) => {
                const isPositive = diff.diff > 0;
                const isGood = diff.isPositiveGood ? isPositive : !isPositive;
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                      isGood
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {isGood ? (
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    ) : (
                      <ArrowDownRight className="w-2.5 h-2.5" />
                    )}
                    {diff.formatted}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Lore / Description */}
        <p className="text-slate-400 italic text-[11px] leading-relaxed border-t border-white/5 pt-2">
          "{item.description}"
        </p>

        {/* Durability & Weight & Value */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-slate-500" />
            <span>{item.stats.weight} kg</span>
          </div>

          {item.durability !== undefined && item.maxDurability !== undefined && (
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
              <span>{item.durability}/{item.maxDurability} Dur</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
            <Coins className="w-3.5 h-3.5" />
            <span>{item.valueGold} g</span>
          </div>
        </div>

        {/* Controls Help */}
        <div className="text-[10px] text-slate-500 pt-1 text-center font-mono">
          [Left Click + Drag] Move • [R] Rotate • [Right Click] Equip
        </div>
      </div>
    </div>
  );
};
