import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { Trophy, Shield, Skull, Award } from 'lucide-react';

interface ScoreboardProps {
  engine: GameEngine;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ engine }) => {
  const allPlayers = [
    engine.playerStats,
    ...engine.bots.map((b) => b.stats),
  ];

  const ctPlayers = allPlayers.filter((p) => p.team === 'CT');
  const tPlayers = allPlayers.filter((p) => p.team === 'T');

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm font-mono select-none">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl">
        {/* Header Match Status */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-black text-slate-100 tracking-wider">TACTICAL MATCH STATS</h2>
              <span className="text-xs text-slate-400">First to 8 Rounds | Greybox Site A Arena</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-sky-400">CT</span>
              <span className="text-2xl font-black text-sky-300">{engine.ctScore}</span>
            </div>
            <span className="text-slate-600 font-bold">:</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-400">{engine.tScore}</span>
              <span className="text-sm font-bold text-amber-500">T</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          {/* CT Roster */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-sky-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-sky-400">
                Counter-Terrorists ({ctPlayers.filter((p) => p.isAlive).length} Alive)
              </h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Player</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Kills</th>
                    <th className="p-3 text-center">Deaths</th>
                    <th className="p-3 text-center">Damage</th>
                    <th className="p-3 text-right">Money</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ctPlayers.map((p) => (
                    <tr
                      key={p.id}
                      className={p.id === engine.playerStats.id ? 'bg-sky-950/30 font-bold text-sky-200' : 'text-slate-300'}
                    >
                      <td className="p-3 flex items-center gap-2">
                        {p.id === engine.playerStats.id && (
                          <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] text-sky-300">YOU</span>
                        )}
                        <span>{p.name}</span>
                      </td>
                      <td className="p-3 text-center">
                        {p.isAlive ? (
                          <span className="text-emerald-400 font-bold">ALIVE</span>
                        ) : (
                          <span className="text-slate-500">DEAD</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold">{p.kills}</td>
                      <td className="p-3 text-center">{p.deaths}</td>
                      <td className="p-3 text-center">{p.damageDealt}</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">${p.money}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* T Roster */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-500">
                Terrorists ({tPlayers.filter((p) => p.isAlive).length} Alive)
              </h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Player</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Kills</th>
                    <th className="p-3 text-center">Deaths</th>
                    <th className="p-3 text-center">Damage</th>
                    <th className="p-3 text-right">Money</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tPlayers.map((p) => (
                    <tr
                      key={p.id}
                      className={p.id === engine.playerStats.id ? 'bg-amber-950/30 font-bold text-amber-200' : 'text-slate-300'}
                    >
                      <td className="p-3 flex items-center gap-2">
                        {p.id === engine.playerStats.id && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] text-amber-300">YOU</span>
                        )}
                        <span>{p.name}</span>
                      </td>
                      <td className="p-3 text-center">
                        {p.isAlive ? (
                          <span className="text-emerald-400 font-bold">ALIVE</span>
                        ) : (
                          <span className="text-slate-500">DEAD</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold">{p.kills}</td>
                      <td className="p-3 text-center">{p.deaths}</td>
                      <td className="p-3 text-center">{p.damageDealt}</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">${p.money}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] text-slate-500">
          Release <kbd className="rounded bg-slate-800 px-1 text-slate-400">TAB</kbd> to return to game view
        </div>
      </div>
    </div>
  );
};
