import React from 'react';
import { X, Sparkles, Move, RotateCw, ArrowLeftRight, Dices, Shield, Gauge } from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto glass-panel rounded-3xl border border-white/15 p-6 shadow-2xl flex flex-col gap-5 text-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-['Cinzel'] font-bold text-lg text-slate-100">
              ArcaneArmory • Tactical Guide & Controls
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guides Sections */}
        <div className="space-y-4 text-xs leading-relaxed">
          {/* Spatial Grid */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Move className="w-4 h-4" /> 1. Spatial Grid & Tetris-Style Bag Mechanics
            </div>
            <p className="text-slate-400">
              Items occupy physical 2D tiles (1x1 rings, 1x3 broadswords, 2x2 shields, 2x3 legendary greatswords).
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
              <li><strong>Left-Click & Drag:</strong> Pick up and move items across grid cells or into equipment slots.</li>
              <li><strong>[R] Key:</strong> Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-amber-300">R</kbd> while dragging to rotate items 90°.</li>
              <li><strong>Right-Click:</strong> Opens context menu to instantly Equip, Rotate, or Drop items.</li>
              <li><strong>2D Auto-Pack:</strong> Runs a bin-packing heuristic to compress your bag inventory tightly.</li>
            </ul>
          </div>

          {/* Paper Doll & Two-Handed Weapons */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Shield className="w-4 h-4" /> 2. Paper Doll Rig & Synergistic Stats
            </div>
            <p className="text-slate-400">
              Equipping weapons, armor, and relics recalculates Attack Power, Armor, Critical Precision, and Carry Weight.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
              <li><strong>Two-Handed Constraint:</strong> Equipping a 2H weapon (like the Obsidian Greatsword) disables the Off-Hand slot and un-equips any shields.</li>
              <li><strong>Dynamic Tooltip Differentials:</strong> Hovering any gear displays colored <span className="text-emerald-400">+diff</span> / <span className="text-rose-400">-diff</span> pills comparing against your equipped item.</li>
              <li><strong>Encumbrance:</strong> Exceeding your carry weight applies penalties to movement and stamina.</li>
            </ul>
          </div>

          {/* Live Trade Chamber */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ArrowLeftRight className="w-4 h-4" /> 3. Live Synchronized Trade Chamber
            </div>
            <p className="text-slate-400">
              Initiate trades with party members or AI companion bots. Features an immutable double-lock anti-scam protocol:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
              <li>Both players stage items and gold in their trade matrix.</li>
              <li>Any item or gold modification resets all locks immediately.</li>
              <li>Both players must Lock In, then confirm Accept Trade for an atomic ledger transaction.</li>
            </ul>
          </div>

          {/* Need / Greed Rolls */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Dices className="w-4 h-4" /> 4. Quest Progression & Need / Greed Loot Podium
            </div>
            <p className="text-slate-400">
              Advance party quest checkpoints or slay Malakor the Cinder Wyrm. Defeating milestones triggers the arcade-style loot podium:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
              <li>15-second radial countdown timer.</li>
              <li>Select <strong>Need</strong> (priority), <strong>Greed</strong> (off-spec/gold), or <strong>Pass</strong>.</li>
              <li>Authoritative server arbitrates dice rolls (1-100) and automatically deposits the prize into the winner's bag.</li>
            </ul>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg transition-all"
        >
          Got it, Return to Camp
        </button>
      </div>
    </div>
  );
};
