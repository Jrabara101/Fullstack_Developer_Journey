import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { WEAPON_REGISTRY } from '../game/weapons';
import { Shield, ShieldAlert, Wrench, X, ShoppingBag, Check } from 'lucide-react';

interface BuyMenuProps {
  engine: GameEngine;
  onClose: () => void;
}

export const BuyMenu: React.FC<BuyMenuProps> = ({ engine, onClose }) => {
  const money = engine.playerStats.money;
  const isCT = engine.playerTeam === 'CT';

  const weaponsList = [
    WEAPON_REGISTRY.ak47,
    WEAPON_REGISTRY.m4a1,
    WEAPON_REGISTRY.deagle,
    WEAPON_REGISTRY.usp,
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md font-mono select-none">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100 tracking-wider">TACTICAL ARMORY</h2>
              <p className="text-xs text-slate-400">Purchase weapons & protective gear for the round</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AVAILABLE FUNDS</div>
              <div className="text-2xl font-black text-emerald-400">${money}</div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. WEAPONS */}
          <div>
            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-amber-400">Firearms</h3>
            <div className="flex flex-col gap-2.5">
              {weaponsList.map((wpn) => {
                const canAfford = money >= wpn.price;
                const isEquipped =
                  (wpn.category === 'RIFLE' && engine.playerInventory.primary?.weaponId === wpn.id) ||
                  (wpn.category === 'PISTOL' && engine.playerInventory.secondary.weaponId === wpn.id);

                return (
                  <div
                    key={wpn.id}
                    className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                      isEquipped
                        ? 'border-emerald-600/80 bg-emerald-950/30'
                        : canAfford
                        ? 'border-slate-700/80 bg-slate-800/40 hover:border-amber-500/60 hover:bg-slate-800/80 cursor-pointer'
                        : 'border-slate-800/60 bg-slate-900/40 opacity-50'
                    }`}
                    onClick={() => {
                      if (canAfford && !isEquipped) {
                        engine.buyWeapon(wpn.id);
                      }
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{wpn.name}</span>
                        <span className="rounded bg-slate-700/70 px-1.5 py-0.5 text-[10px] text-slate-300 font-semibold">
                          {wpn.category}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{wpn.description}</p>
                      {/* Specs */}
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                        <span>Dmg: <b className="text-slate-200">{wpn.damage}</b></span>
                        <span>Armor Pen: <b className="text-slate-200">{Math.round(wpn.armorPenetration * 100)}%</b></span>
                        <span>Mag: <b className="text-slate-200">{wpn.clipSize}</b></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-amber-400">${wpn.price}</div>
                      {isEquipped ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <Check className="h-3.5 w-3.5" /> Equipped
                        </span>
                      ) : (
                        <button
                          disabled={!canAfford}
                          className="mt-1 rounded bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all disabled:opacity-40"
                        >
                          Buy
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. EQUIPMENT & GEAR */}
          <div>
            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-sky-400">Tactical Gear</h3>
            <div className="flex flex-col gap-2.5">
              {/* Kevlar Vest */}
              <div
                className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                  engine.playerInventory.hasKevlar
                    ? 'border-emerald-600/80 bg-emerald-950/30'
                    : money >= 650
                    ? 'border-slate-700/80 bg-slate-800/40 hover:border-sky-500/60 hover:bg-slate-800/80 cursor-pointer'
                    : 'border-slate-800/60 bg-slate-900/40 opacity-50'
                }`}
                onClick={() => {
                  if (money >= 650 && !engine.playerInventory.hasKevlar) {
                    engine.buyEquipment('kevlar');
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">Kevlar Vest</div>
                    <p className="text-[11px] text-slate-400">Absorbs 50% damage to torso and extremities</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-sky-400">$650</div>
                  {engine.playerInventory.hasKevlar && (
                    <span className="text-[11px] font-bold text-emerald-400">Owned</span>
                  )}
                </div>
              </div>

              {/* Kevlar + Helmet */}
              <div
                className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                  engine.playerInventory.hasHelmet
                    ? 'border-emerald-600/80 bg-emerald-950/30'
                    : money >= 1000
                    ? 'border-slate-700/80 bg-slate-800/40 hover:border-sky-500/60 hover:bg-slate-800/80 cursor-pointer'
                    : 'border-slate-800/60 bg-slate-900/40 opacity-50'
                }`}
                onClick={() => {
                  if (money >= 1000 && !engine.playerInventory.hasHelmet) {
                    engine.buyEquipment('helmet');
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">Kevlar + Ballistic Helmet</div>
                    <p className="text-[11px] text-slate-400">Prevents fatal 1-tap headshots from pistols & SMGs</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-sky-400">$1000</div>
                  {engine.playerInventory.hasHelmet && (
                    <span className="text-[11px] font-bold text-emerald-400">Owned</span>
                  )}
                </div>
              </div>

              {/* Defusal Kit (CT Only) */}
              {isCT && (
                <div
                  className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                    engine.playerInventory.hasDefuseKit
                      ? 'border-emerald-600/80 bg-emerald-950/30'
                      : money >= 400
                      ? 'border-slate-700/80 bg-slate-800/40 hover:border-sky-500/60 hover:bg-slate-800/80 cursor-pointer'
                      : 'border-slate-800/60 bg-slate-900/40 opacity-50'
                  }`}
                  onClick={() => {
                    if (money >= 400 && !engine.playerInventory.hasDefuseKit) {
                      engine.buyEquipment('kit');
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">Defusal Kit</div>
                      <p className="text-[11px] text-slate-400">Cuts bomb defusal time in half (4.5s instead of 8s)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-sky-400">$400</div>
                    {engine.playerInventory.hasDefuseKit && (
                      <span className="text-[11px] font-bold text-emerald-400">Owned</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
          <span>Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-200 border border-slate-700">ESC</kbd> or <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-200 border border-slate-700">B</kbd> to return to match</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition-colors"
          >
            Close Buy Menu
          </button>
        </div>
      </div>
    </div>
  );
};
