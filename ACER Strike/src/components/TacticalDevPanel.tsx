import React, { useState } from 'react';
import { GameEngine } from '../game/gameEngine';
import { WEAPON_REGISTRY } from '../game/weapons';
import {
  Code,
  Eye,
  Sliders,
  Terminal,
  Activity,
  Zap,
  Target,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

interface TacticalDevPanelProps {
  engine: GameEngine;
  onClose: () => void;
}

export const TacticalDevPanel: React.FC<TacticalDevPanelProps> = ({ engine, onClose }) => {
  const [activeTab, setActiveTab] = useState<'BALLISTICS' | 'RECOIL' | 'BOTS' | 'SANDBOX'>('BALLISTICS');
  const [debugRays, setDebugRays] = useState(engine.debugDrawRays);
  const [debugHitboxes, setDebugHitboxes] = useState(engine.debugDrawHitboxes);
  const [godMode, setGodMode] = useState(engine.godMode);
  const [unlimitedAmmo, setUnlimitedAmmo] = useState(engine.unlimitedAmmo);
  const [noRecoil, setNoRecoil] = useState(engine.noRecoil);

  const parallax = engine.lastParallaxDebug;
  const activeWpn = engine.activeWeapon;

  return (
    <div className="absolute top-4 right-4 z-50 w-96 rounded-2xl border border-amber-500/40 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl font-mono text-xs text-slate-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-amber-400">
          <Terminal className="h-4 w-4" />
          <span className="font-black text-sm tracking-wider">TECH DESIGN SUITE</span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex rounded-lg bg-slate-900 p-1 border border-slate-800">
        <button
          onClick={() => setActiveTab('BALLISTICS')}
          className={`flex-1 rounded-md py-1.5 text-[10px] font-bold uppercase transition-colors ${
            activeTab === 'BALLISTICS' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ballistics
        </button>
        <button
          onClick={() => setActiveTab('RECOIL')}
          className={`flex-1 rounded-md py-1.5 text-[10px] font-bold uppercase transition-colors ${
            activeTab === 'RECOIL' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Recoil
        </button>
        <button
          onClick={() => setActiveTab('BOTS')}
          className={`flex-1 rounded-md py-1.5 text-[10px] font-bold uppercase transition-colors ${
            activeTab === 'BOTS' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Bots
        </button>
        <button
          onClick={() => setActiveTab('SANDBOX')}
          className={`flex-1 rounded-md py-1.5 text-[10px] font-bold uppercase transition-colors ${
            activeTab === 'SANDBOX' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Cheats
        </button>
      </div>

      {/* TAB 1: BALLISTICS & PARALLAX CORRECTION */}
      {activeTab === 'BALLISTICS' && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
            <span className="text-slate-300 font-semibold">Parallax 3D Ray Traces</span>
            <button
              onClick={() => {
                const next = !debugRays;
                setDebugRays(next);
                engine.debugDrawRays = next;
              }}
              className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all ${
                debugRays ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {debugRays ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
            <span className="text-slate-300 font-semibold">Hitbox Wireframe Volumes</span>
            <button
              onClick={() => {
                const next = !debugHitboxes;
                setDebugHitboxes(next);
                engine.setHitboxDebug(next);
              }}
              className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all ${
                debugHitboxes ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {debugHitboxes ? 'VISIBLE' : 'HIDDEN'}
            </button>
          </div>

          {/* Parallax Live Stats */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
            <div className="text-[10px] font-black uppercase text-amber-400 mb-2">Parallax Raycast Metrics</div>
            {parallax ? (
              <div className="flex flex-col gap-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Camera Ray:</span>
                  <span className="text-amber-300 font-bold">Yellow Vector</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Muzzle Trajectory:</span>
                  <span className="text-cyan-400 font-bold">Cyan Vector</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Barrel Obstruction:</span>
                  <span className={parallax.hasObstruction ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {parallax.hasObstruction ? 'BLOCKED BY LOW COVER' : 'CLEAR LINE OF SIGHT'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Inaccuracy:</span>
                  <span className="font-bold text-slate-200">{(engine.currentDynamicSpread * 100).toFixed(2)} deg</span>
                </div>
              </div>
            ) : (
              <span className="text-slate-500 text-[11px]">Fire a shot to generate trace metrics.</span>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RECOIL PATTERN VISUALIZER */}
      {activeTab === 'RECOIL' && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-amber-400">{activeWpn.name} Spray Curve</span>
              <span className="text-[10px] text-slate-400">Spray Step: {Math.floor(engine.sprayIndex)}</span>
            </div>

            {/* Recoil Spray Plotter Canvas */}
            <div className="relative h-40 w-full rounded-lg border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* Pattern points */}
              <svg className="h-full w-full p-2" viewBox="-0.04 -0.01 0.08 0.08">
                {/* Axes */}
                <line x1="-0.04" y1="0" x2="0.04" y2="0" stroke="#334155" strokeWidth="0.001" />
                <line x1="0" y1="-0.01" x2="0" y2="0.08" stroke="#334155" strokeWidth="0.001" />

                {/* Recoil curve line */}
                {activeWpn.recoilPattern.map((p, idx) => {
                  if (idx === 0) return null;
                  const prev = activeWpn.recoilPattern[idx - 1];
                  return (
                    <line
                      key={idx}
                      x1={prev.x}
                      y1={prev.y}
                      x2={p.x}
                      y2={p.y}
                      stroke="#f59e0b"
                      strokeWidth="0.0015"
                    />
                  );
                })}

                {/* Dots */}
                {activeWpn.recoilPattern.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="0.0015"
                    fill={idx === Math.floor(engine.sprayIndex) ? '#f43f5e' : '#38bdf8'}
                  />
                ))}
              </svg>
            </div>
            <p className="mt-2 text-[10px] text-slate-400">
              Spray climbs vertically, pulls right, swings left, then stabilizes right.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: TACTICAL BOTS STATE MACHINE */}
      {activeTab === 'BOTS' && (
        <div className="mt-4 flex flex-col gap-2 max-h-60 overflow-y-auto">
          {engine.bots.map((b) => {
            const dbg = b.getDebugState();
            return (
              <div key={b.id} className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5">
                <div className="flex items-center justify-between">
                  <span className={b.team === 'CT' ? 'font-bold text-sky-400' : 'font-bold text-amber-400'}>
                    {b.name}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    b.stats.isAlive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {b.stats.isAlive ? dbg.state : 'ELIMINATED'}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-col gap-0.5 text-[10px] text-slate-400">
                  <div>Objective: <span className="text-slate-200">{dbg.currentObjective}</span></div>
                  <div>Health: <span className="text-slate-200">{b.stats.health.toFixed(0)} HP</span> | Armor: <span className="text-slate-200">{b.stats.armor.toFixed(0)}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: SANDBOX CHEATS & SHORTCUTS */}
      {activeTab === 'SANDBOX' && (
        <div className="mt-4 flex flex-col gap-2.5">
          <button
            onClick={() => {
              const next = !godMode;
              setGodMode(next);
              engine.godMode = next;
              if (next) engine.playerStats.health = 9999;
              else engine.playerStats.health = 100;
            }}
            className={`flex items-center justify-between rounded-lg border p-2.5 font-bold transition-all ${
              godMode ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-slate-800 bg-slate-900 text-slate-300'
            }`}
          >
            <span>God Mode</span>
            <span>{godMode ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              const next = !unlimitedAmmo;
              setUnlimitedAmmo(next);
              engine.unlimitedAmmo = next;
            }}
            className={`flex items-center justify-between rounded-lg border p-2.5 font-bold transition-all ${
              unlimitedAmmo ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-slate-800 bg-slate-900 text-slate-300'
            }`}
          >
            <span>Infinite Ammo</span>
            <span>{unlimitedAmmo ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              const next = !noRecoil;
              setNoRecoil(next);
              engine.noRecoil = next;
            }}
            className={`flex items-center justify-between rounded-lg border p-2.5 font-bold transition-all ${
              noRecoil ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-slate-800 bg-slate-900 text-slate-300'
            }`}
          >
            <span>Zero Recoil & Spread</span>
            <span>{noRecoil ? 'ON' : 'OFF'}</span>
          </button>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => engine.startNewRound()}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 p-2 font-bold text-[11px] text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restart Round
            </button>
            <button
              onClick={() => {
                engine.setPlayerTeam(engine.playerTeam === 'CT' ? 'T' : 'CT');
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 p-2 font-bold text-[11px] text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Swap Team
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
