import React from 'react';
import type { AbilityDefinition } from '../types';
import { Sword, Shield, Zap, Snowflake, Flame, Sparkles } from 'lucide-react';

interface AbilityTrayProps {
  abilities: AbilityDefinition[];
  playerStamina: number;
  playerMana: number;
  onTriggerAbility: (id: string) => void;
}

export const AbilityTray: React.FC<AbilityTrayProps> = ({
  abilities,
  playerStamina,
  playerMana,
  onTriggerAbility,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sword': return <Sword className="w-5 h-5 text-amber-300" />;
      case 'Shield': return <Shield className="w-5 h-5 text-cyan-300" />;
      case 'Zap': return <Zap className="w-5 h-5 text-emerald-300" />;
      case 'Snowflake': return <Snowflake className="w-5 h-5 text-sky-300" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-300" />;
      default: return <Sword className="w-5 h-5 text-white" />;
    }
  };

  const now = performance.now();

  return (
    <div className="glass-panel p-2.5 rounded-2xl border border-amber-500/20 shadow-2xl flex items-center gap-2 pointer-events-auto">
      {abilities.map((ability) => {
        const timeSinceUsed = now - ability.lastUsedTimestamp;
        const isOnCooldown = timeSinceUsed < ability.cooldownMs;
        const cooldownRemaining = Math.max(0, (ability.cooldownMs - timeSinceUsed) / 1000);
        const cooldownPct = Math.min(100, (timeSinceUsed / ability.cooldownMs) * 100);

        const hasResource =
          playerStamina >= ability.staminaCost && playerMana >= ability.manaCost;

        const isReady = !isOnCooldown && hasResource;

        return (
          <button
            key={ability.id}
            onClick={() => onTriggerAbility(ability.id)}
            disabled={isOnCooldown || !hasResource}
            title={`${ability.name} - ${ability.description}`}
            className={`relative group w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center border transition-all duration-150 overflow-hidden ${
              isReady
                ? 'bg-slate-900/90 border-amber-500/30 hover:border-amber-400 hover:scale-105 active:scale-95 shadow-lg'
                : 'bg-slate-950/90 border-slate-800 opacity-60 cursor-not-allowed'
            }`}
          >
            {/* Darkened Cooldown Sweep Overlay */}
            {isOnCooldown && (
              <div
                className="absolute inset-0 bg-black/80 flex items-center justify-center z-10"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${cooldownPct >= 25 ? '100% 0%,' : ''} ${
                    cooldownPct >= 50 ? '100% 100%,' : ''
                  } ${cooldownPct >= 75 ? '0% 100%,' : ''} 0% 0%)`
                }}
              />
            )}

            {/* Cooldown Timer Digits */}
            {isOnCooldown && (
              <div className="absolute inset-0 z-20 flex items-center justify-center font-mono font-bold text-xs md:text-sm text-amber-300 drop-shadow">
                {cooldownRemaining.toFixed(1)}s
              </div>
            )}

            {/* Hotkey Tag Badge */}
            <div className="absolute top-1 left-1.5 z-20 font-mono text-[9px] md:text-[10px] font-bold text-slate-300 bg-slate-950/80 px-1 py-0.2 rounded border border-slate-700/80">
              {ability.hotkey}
            </div>

            {/* Energy Cost Badge */}
            {ability.manaCost > 0 && (
              <div className="absolute top-1 right-1.5 z-20 font-mono text-[9px] font-semibold text-cyan-300 bg-cyan-950/80 px-1 rounded border border-cyan-800/60">
                {ability.manaCost}M
              </div>
            )}
            {ability.staminaCost > 0 && (
              <div className="absolute top-1 right-1.5 z-20 font-mono text-[9px] font-semibold text-emerald-300 bg-emerald-950/80 px-1 rounded border border-emerald-800/60">
                {ability.staminaCost}S
              </div>
            )}

            {/* Ability Icon */}
            <div className={`transition-transform duration-100 ${isReady ? 'group-hover:scale-110' : ''}`}>
              {getIcon(ability.iconName)}
            </div>

            {/* Ability Label */}
            <div className="text-[9px] font-outfit text-slate-400 font-medium truncate max-w-[50px] mt-0.5">
              {ability.name.split(' ')[0]}
            </div>
          </button>
        );
      })}
    </div>
  );
};
