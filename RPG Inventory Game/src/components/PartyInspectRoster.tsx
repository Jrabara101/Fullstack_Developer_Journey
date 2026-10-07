import React from 'react';
import { CharacterSheet } from '../types/inventory';
import { ItemIcon } from './ItemIcon';
import { Users, Eye, ArrowLeftRight, Heart, Droplet, Crown, ShieldAlert, Sparkles } from 'lucide-react';

interface PartyInspectRosterProps {
  partyMembers: CharacterSheet[];
  localPlayerId: string;
  onInspect: (member: CharacterSheet) => void;
  onInitiateTrade: (targetPlayerId: string) => void;
  onSpawnBot: () => void;
}

export const PartyInspectRoster: React.FC<PartyInspectRosterProps> = ({
  partyMembers,
  localPlayerId,
  onInspect,
  onInitiateTrade,
  onSpawnBot,
}) => {
  const otherMembers = partyMembers.filter(p => p.playerId !== localPlayerId);

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 w-full max-w-sm border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h2 className="font-['Cinzel'] font-bold text-base text-slate-100 tracking-wide">
            Party Vanguard
          </h2>
        </div>
        <span className="text-xs text-indigo-300 font-mono bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">
          {partyMembers.length}/4 Members
        </span>
      </div>

      {/* Member Cards */}
      <div className="flex flex-col gap-3">
        {otherMembers.length === 0 ? (
          <div className="text-center py-6 px-3 bg-white/[0.02] rounded-xl border border-dashed border-white/10 flex flex-col items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-slate-500" />
            <p className="text-xs text-slate-400">
              No companions currently in camp. Invite friends via room code or recruit an AI companion!
            </p>
            <button
              onClick={onSpawnBot}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition-transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" /> Summon Companion Bot
            </button>
          </div>
        ) : (
          otherMembers.map(member => {
            const equippedWeapon = member.equipped['main_hand'];
            return (
              <div
                key={member.playerId}
                className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-indigo-500/30 rounded-xl p-3 flex flex-col gap-2.5 transition-all group"
              >
                {/* Top Row: Avatar, Name, Level & Weapon Thumbnail */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={member.avatarUrl}
                        alt={member.username}
                        className="w-10 h-10 rounded-xl object-cover border border-white/10 group-hover:border-indigo-500/50"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-slate-900 border border-white/15 text-[9px] font-mono px-1 rounded-full text-indigo-300">
                        {member.level}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-200 leading-tight">
                        {member.username}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {member.characterClass}
                      </span>
                    </div>
                  </div>

                  {/* Main Hand Weapon Icon Preview */}
                  {equippedWeapon && (
                    <div
                      className="w-9 h-9 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center p-1"
                      title={`Equipped: ${equippedWeapon.name}`}
                    >
                      <ItemIcon iconType={equippedWeapon.iconType} rarity={equippedWeapon.rarity} className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Vitals Bars: HP & MP */}
                <div className="space-y-1">
                  {/* HP */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${(member.currentHp / member.maxHp) * 100}%` }}
                    />
                  </div>
                  {/* MP */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${(member.currentMp / member.maxMp) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Action Triggers */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <button
                    onClick={() => onInspect(member)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" /> Inspect Sheet
                  </button>

                  <button
                    onClick={() => onInitiateTrade(member.playerId)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-medium transition-colors"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" /> Trade Chamber
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Companion Summon Footer */}
      {partyMembers.length < 4 && otherMembers.length > 0 && (
        <button
          onClick={onSpawnBot}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Recruit Guild Bot (+1)
        </button>
      )}
    </div>
  );
};
