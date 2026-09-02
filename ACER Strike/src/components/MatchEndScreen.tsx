import React from 'react';
import { Home, RotateCcw, Trophy } from 'lucide-react';
import { GameEngine } from '../game/gameEngine';
import { PlayerStats, Team } from '../types/game';

interface MatchEndScreenProps {
  engine: GameEngine;
  onRematch: () => void;
  onQuitToMenu: () => void;
}

export const MatchEndScreen: React.FC<MatchEndScreenProps> = ({
  engine,
  onRematch,
  onQuitToMenu,
}) => {
  const winner = engine.matchWinner;
  const isDraw = engine.isDraw;
  const playerWon = !isDraw && winner === engine.playerTeam;

  const roster: PlayerStats[] = [engine.playerStats, ...engine.bots.map((b) => b.stats)]
    .slice()
    .sort((a, b) => b.kills - a.kills || b.damageDealt - a.damageDealt);

  const headline = isDraw ? 'Draw' : playerWon ? 'Victory' : 'Defeat';
  const accent = isDraw
    ? { text: 'text-slate-300', ring: 'border-slate-600', glow: 'bg-slate-500/10' }
    : playerWon
    ? { text: 'text-emerald-400', ring: 'border-emerald-500/50', glow: 'bg-emerald-500/10' }
    : { text: 'text-rose-400', ring: 'border-rose-500/50', glow: 'bg-rose-500/10' };

  const teamLabel = (team: Team) => (team === 'CT' ? 'CT' : 'T');

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/95 p-4 font-mono backdrop-blur-md">
      <div className="w-full max-w-2xl">
        {/* Result */}
        <div className="mb-6 text-center">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border ${accent.ring} ${accent.glow} ${accent.text}`}
          >
            <Trophy className="h-8 w-8" />
          </div>
          <h1 className={`text-4xl font-black uppercase tracking-[0.18em] ${accent.text}`}>
            {headline}
          </h1>
          <p className="mt-2 text-[11px] uppercase tracking-widest text-slate-500">
            {isDraw ? 'Match drawn' : `${winner === 'CT' ? 'Counter-Terrorists' : 'Terrorists'} take the match`}
          </p>
        </div>

        {/* Final score */}
        <div className="mb-5 flex items-center justify-center gap-8 rounded-2xl border border-slate-800 bg-slate-900/70 py-5">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-sky-400">CT</div>
            <div className="text-4xl font-black tabular-nums text-slate-100">{engine.ctScore}</div>
          </div>
          <div className="text-2xl font-black text-slate-700">:</div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-amber-400">T</div>
            <div className="text-4xl font-black tabular-nums text-slate-100">{engine.tScore}</div>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="bg-slate-900/90 text-[10px] uppercase tracking-widest text-slate-500">
                <th className="px-4 py-2.5 font-bold">Operator</th>
                <th className="px-3 py-2.5 text-center font-bold">Side</th>
                <th className="px-3 py-2.5 text-center font-bold">K</th>
                <th className="px-3 py-2.5 text-center font-bold">D</th>
                <th className="px-3 py-2.5 text-center font-bold">Dmg</th>
                <th className="px-4 py-2.5 text-center font-bold">Score</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((p) => {
                const isPlayer = !p.isBot;
                return (
                  <tr
                    key={p.id}
                    className={`border-t border-slate-800/80 ${
                      isPlayer ? 'bg-amber-500/10' : 'bg-slate-900/40'
                    }`}
                  >
                    <td
                      className={`px-4 py-2.5 font-bold ${
                        isPlayer ? 'text-amber-300' : 'text-slate-300'
                      }`}
                    >
                      {p.name}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          p.team === 'CT'
                            ? 'bg-sky-950 text-sky-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {teamLabel(p.team)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold tabular-nums text-slate-200">
                      {p.kills}
                    </td>
                    <td className="px-3 py-2.5 text-center tabular-nums text-slate-400">
                      {p.deaths}
                    </td>
                    <td className="px-3 py-2.5 text-center tabular-nums text-slate-400">
                      {Math.round(p.damageDealt)}
                    </td>
                    <td className="px-4 py-2.5 text-center font-bold tabular-nums text-slate-200">
                      {p.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={onRematch}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-950 transition-colors hover:bg-amber-400"
          >
            <RotateCcw className="h-4 w-4" /> Rematch
          </button>
          <button
            onClick={onQuitToMenu}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-300 transition-colors hover:bg-slate-800"
          >
            <Home className="h-4 w-4" /> Main menu
          </button>
        </div>
      </div>
    </div>
  );
};
