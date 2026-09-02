import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { CrosshairStyle } from '../game/settings';
import { Shield, ShieldAlert, Crosshair, Zap, Bomb, RotateCcw, AlertTriangle } from 'lucide-react';

interface HUDProps {
  engine: GameEngine;
  crosshairStyle?: CrosshairStyle;
  crosshairColor?: string;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  crosshairStyle = 'CROSS',
  crosshairColor = '#7ddf64',
}) => {
  const stats = engine.playerStats;
  const inv = engine.playerInventory;
  const activeWeapon = engine.activeWeapon;
  const activeItem =
    inv.activeSlot === 1
      ? inv.primary
      : inv.activeSlot === 2
      ? inv.secondary
      : inv.knife;

  // Format Round Time
  const minutes = Math.floor(Math.max(0, engine.roundTimeRemaining) / 60);
  const seconds = Math.floor(Math.max(0, engine.roundTimeRemaining) % 60);
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Crosshair dynamic gap calculation based on real-time spread & recoil
  // Base gap 6px + spread angle * 600px
  const spreadPixels = Math.min(48, Math.max(6, engine.currentDynamicSpread * 650));
  const showTicks = crosshairStyle === 'CROSS' || crosshairStyle === 'CROSS_DOT';
  const showDot = crosshairStyle === 'DOT' || crosshairStyle === 'CROSS_DOT';
  const tickStyle = { backgroundColor: crosshairColor, boxShadow: `0 0 3px ${crosshairColor}` };
  const hasObstruction = engine.lastParallaxDebug?.hasObstruction ?? false;

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden font-mono text-white">
      {/* 1. TOP HEADER: Round Timer, Scores & Status */}
      <div className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-6 rounded-lg border border-slate-700/80 bg-slate-950/80 px-6 py-2.5 shadow-2xl backdrop-blur-md">
        {/* CT Score */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-sky-400 tracking-wider">COUNTER-TERRORISTS</div>
            <div className="text-2xl font-black text-sky-300">{engine.ctScore}</div>
          </div>
          <div className="h-7 w-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
        </div>

        {/* Center Clock / Bomb Flash */}
        <div className="flex flex-col items-center px-4 border-x border-slate-700/60">
          {engine.roundState === 'FREEZE_TIME' ? (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Freeze Time</span>
              <span className="text-2xl font-black text-amber-300">{Math.ceil(engine.roundTimeRemaining)}s</span>
            </div>
          ) : engine.roundState === 'BOMB_PLANTED' ? (
            <div className="flex flex-col items-center animate-pulse">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500">
                <Bomb className="h-3.5 w-3.5 animate-bounce" />
                <span>BOMB ARMED</span>
              </div>
              <span className="text-2xl font-black text-rose-400">
                {engine.bombTimer > 0 ? engine.bombTimer.toFixed(1) : '0.0'}s
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Round {engine.roundNumber}</span>
              <span className="text-2xl font-black text-slate-100">{timeFormatted}</span>
            </div>
          )}
        </div>

        {/* T Score */}
        <div className="flex items-center gap-3">
          <div className="h-7 w-1.5 rounded-full bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.8)]" />
          <div className="text-left">
            <div className="text-xs font-bold text-amber-500 tracking-wider">TERRORISTS</div>
            <div className="text-2xl font-black text-amber-400">{engine.tScore}</div>
          </div>
        </div>
      </div>

      {/* 2. TOP RIGHT: KillFeed */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5">
        {engine.killFeed.map((kf) => (
          <div
            key={kf.id}
            className="flex items-center gap-2 rounded bg-slate-950/85 px-3 py-1 text-xs shadow-md border border-slate-800 backdrop-blur-sm animate-in fade-in slide-in-from-top duration-200"
          >
            <span className={kf.killerTeam === 'CT' ? 'font-bold text-sky-400' : 'font-bold text-amber-400'}>
              {kf.killerName}
            </span>
            {kf.isHeadshot && (
              <span className="rounded bg-rose-950/80 px-1 py-0.5 text-[10px] font-extrabold text-rose-400 border border-rose-800/80">
                HEADSHOT
              </span>
            )}
            <span className="text-slate-400 text-[11px] font-semibold">{kf.weaponName}</span>
            <span className="text-slate-500">&gt;</span>
            <span className={kf.victimTeam === 'CT' ? 'font-bold text-sky-400' : 'font-bold text-amber-400'}>
              {kf.victimName}
            </span>
          </div>
        ))}
      </div>

      {/* 3. TOP LEFT: Tactical Radar / Minimap */}
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <div className="relative h-44 w-44 rounded-xl border-2 border-slate-700/80 bg-slate-950/90 shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Radar background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <div className="absolute inset-0 border border-slate-800 rounded-full m-2" />
          <div className="absolute inset-0 border border-slate-800 rounded-full m-10" />

          {/* Bombsite A Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full border border-amber-500/80 bg-amber-950/40 text-xs font-black text-amber-400">
            A
          </div>

          {/* Planted Bomb Blinking Radar Icon */}
          {engine.bombPlanted && (
            <div
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500 animate-ping shadow-[0_0_10px_#f43f5e]"
              style={{
                left: `${50 + (engine.bombPosition.x / 70) * 80}%`,
                top: `${50 + (engine.bombPosition.z / 70) * 80}%`,
              }}
            />
          )}

          {/* Bot Dots */}
          {engine.bots.map((bot) => {
            if (!bot.stats.isAlive) return null;
            const bX = 50 + (bot.rig.root.position.x / 70) * 80;
            const bZ = 50 + (bot.rig.root.position.z / 70) * 80;
            const isEnemy = bot.team !== engine.playerTeam;

            return (
              <div
                key={bot.id}
                className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-950 shadow ${
                  isEnemy ? 'bg-rose-500' : 'bg-sky-400'
                }`}
                style={{ left: `${bX}%`, top: `${bZ}%` }}
                title={`${bot.name} (${bot.team})`}
              />
            );
          })}

          {/* Player Dot & View Cone */}
          <div
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 border border-emerald-200 shadow-[0_0_8px_#34d399]"
            style={{
              left: `${50 + (engine.playerPos.x / 70) * 80}%`,
              top: `${50 + (engine.playerPos.z / 70) * 80}%`,
            }}
          >
            {/* Direction pointer */}
            <div
              className="absolute top-1/2 left-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-full origin-bottom bg-emerald-300"
              style={{
                transform: `translate(-50%, -100%) rotate(${(-engine.playerYaw * 180) / Math.PI}deg)`,
              }}
            />
          </div>

          <div className="absolute bottom-1 right-2 text-[9px] font-bold text-slate-400">BOMBSITE A</div>
        </div>

        {/* Shoulder Swap & Buy Hint */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-300">
          <span className="rounded bg-slate-800/90 px-1.5 py-0.5 border border-slate-700">[V] Shoulder: {engine.targetShoulderSide === 1 ? 'Right' : 'Left'}</span>
          <span className="rounded bg-slate-800/90 px-1.5 py-0.5 border border-slate-700">[B] Buy Menu</span>
        </div>
      </div>

      {/* 4. CENTER RETICLE: CS 1.6 Dynamic Crosshair with Recoil Expansion */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Center dot */}
        {showDot && (
          <div
            className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: crosshairColor, boxShadow: `0 0 4px ${crosshairColor}` }}
          />
        )}

        {showTicks && (
          <>
            <div
              className="absolute left-1/2 w-0.5 -translate-x-1/2 transition-all duration-75"
              style={{ ...tickStyle, bottom: `${spreadPixels}px`, height: '10px' }}
            />
            <div
              className="absolute left-1/2 w-0.5 -translate-x-1/2 transition-all duration-75"
              style={{ ...tickStyle, top: `${spreadPixels}px`, height: '10px' }}
            />
            <div
              className="absolute top-1/2 h-0.5 -translate-y-1/2 transition-all duration-75"
              style={{ ...tickStyle, right: `${spreadPixels}px`, width: '10px' }}
            />
            <div
              className="absolute top-1/2 h-0.5 -translate-y-1/2 transition-all duration-75"
              style={{ ...tickStyle, left: `${spreadPixels}px`, width: '10px' }}
            />
          </>
        )}

        {/* Parallax Low Cover Obstruction Warning */}
        {hasObstruction && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded bg-rose-950/90 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-700 whitespace-nowrap shadow-lg">
            <AlertTriangle className="h-3 w-3 text-rose-400" />
            <span>BARREL OBSTRUCTED</span>
          </div>
        )}
      </div>

      {/* 5. INTERACTION HOLD PROGRESS (Planting / Defusing C4) */}
      {(engine.isPlantingBomb || engine.isDefusingBomb) && (
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/90 px-6 py-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-bold tracking-wider">
            {engine.isPlantingBomb ? (
              <>
                <Bomb className="h-4 w-4 text-amber-500 animate-spin" />
                <span className="text-amber-400">ARMING C4 EXPLOSIVE...</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 text-sky-400 animate-spin" />
                <span className="text-sky-300">DEFUSING BOMB WIRE...</span>
              </>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-2.5 w-56 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-75 ${
                engine.isPlantingBomb ? 'bg-amber-500' : 'bg-sky-400'
              }`}
              style={{
                width: `${
                  engine.isPlantingBomb
                    ? (engine.bombPlantProgress / 4.5) * 100
                    : (engine.bombDefuseProgress / (engine.playerInventory.hasDefuseKit ? 4.5 : 8.0)) * 100
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* 6. BOTTOM HUD BAR: Health, Armor, Weapon, Ammo, Money */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-8 rounded-2xl border border-slate-700/80 bg-slate-950/90 px-8 py-3.5 shadow-2xl backdrop-blur-md">
        {/* Health */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-800/80 bg-rose-950/60 shadow-inner">
            <Crosshair className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">HEALTH</div>
            <div className={`text-3xl font-black ${stats.health <= 25 ? 'text-rose-500 animate-pulse' : 'text-slate-100'}`}>
              {Math.max(0, Math.ceil(stats.health))}
            </div>
          </div>
        </div>

        {/* Armor + Helmet */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-800/80 bg-sky-950/60 shadow-inner">
            {inv.hasHelmet ? <ShieldAlert className="h-5 w-5 text-sky-400" /> : <Shield className="h-5 w-5 text-sky-400" />}
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              <span>ARMOR</span>
              {inv.hasHelmet && <span className="rounded bg-sky-900/80 px-1 text-[9px] text-sky-300 font-bold">HELMET</span>}
            </div>
            <div className="text-3xl font-black text-slate-100">{Math.ceil(stats.armor)}</div>
          </div>
        </div>

        {/* Money */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">FUNDS</div>
            <div className="text-3xl font-black text-emerald-400">${stats.money}</div>
          </div>
        </div>

        {/* Active Weapon & Ammo */}
        <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
              {activeWeapon.name}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-100">
                {activeWeapon.category === 'MELEE'
                  ? '∞'
                  : activeItem
                  ? activeItem.clip
                  : 0}
              </span>
              {activeWeapon.category !== 'MELEE' && activeItem && (
                <span className="text-lg font-bold text-slate-500">/{activeItem.reserve}</span>
              )}
            </div>
            {engine.isReloading && (
              <span className="text-[10px] font-bold text-amber-400 animate-pulse">RELOADING...</span>
            )}
          </div>
        </div>
      </div>

      {/* 7. ELIMINATED DEATH SCREEN OVERLAY */}
      {!stats.isAlive && (
        <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center bg-rose-950/40 backdrop-blur-sm">
          <div className="rounded-2xl border border-rose-700/80 bg-slate-950/90 p-8 text-center shadow-2xl">
            <h2 className="text-3xl font-black text-rose-500 tracking-wider">ELIMINATED</h2>
            <p className="mt-2 text-sm text-slate-300">Awaiting next round start or bomb outcome...</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => engine.startNewRound()}
                className="pointer-events-auto rounded-lg bg-rose-600 hover:bg-rose-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-all"
              >
                Restart Round Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
