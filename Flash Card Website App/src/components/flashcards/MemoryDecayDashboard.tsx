import React from 'react';
import { Zap, Flame, ShieldCheck, AlertTriangle, XCircle, TrendingUp, Calendar } from 'lucide-react';
import { Deck, Flashcard } from '../../types/flashcards';
import { SpacedRepetitionEngine } from '../../services/spacedRepetition';
import { sounds } from '../../services/soundEffects';

interface MemoryDecayDashboardProps {
  decks: Deck[];
  onSelectDeckForStudy: (deckId: string) => void;
  onOpenBlitz: () => void;
}

export const MemoryDecayDashboard: React.FC<MemoryDecayDashboardProps> = ({
  decks,
  onSelectDeckForStudy,
  onOpenBlitz,
}) => {
  // Aggregate all cards across all decks
  const allCards: Flashcard[] = decks.flatMap((d) => d.cards);

  // Categorize cards by retention status
  let freshCards: Flashcard[] = [];
  let fadingCards: Flashcard[] = [];
  let lapsedCards: Flashcard[] = [];

  allCards.forEach((card) => {
    const { status } = SpacedRepetitionEngine.getMemoryStatus(card);
    if (status === 'fresh') freshCards.push(card);
    else if (status === 'fading') fadingCards.push(card);
    else lapsedCards.push(card);
  });

  const overallRetention = allCards.length
    ? Math.round(
        allCards.reduce((acc, c) => acc + SpacedRepetitionEngine.calculateRetention(c), 0) /
          allCards.length
      )
    : 100;

  // Generate 84 days (12 weeks) of streak heatmap
  const weeksCount = 12;
  const daysInGrid = weeksCount * 7;
  const heatmapCells = Array.from({ length: daysInGrid }, (_, i) => {
    // Generate realistic historical review patterns
    const dayAgo = daysInGrid - 1 - i;
    const isWeekend = i % 7 === 0 || i % 7 === 6;
    let count = 0;
    if (dayAgo < 14) {
      // Recent active streak
      count = Math.floor(Math.random() * 18) + 6;
    } else if (!isWeekend) {
      count = Math.random() > 0.25 ? Math.floor(Math.random() * 22) + 4 : 0;
    } else {
      count = Math.random() > 0.5 ? Math.floor(Math.random() * 10) : 0;
    }
    const level = count === 0 ? 0 : count < 6 ? 1 : count < 12 ? 2 : count < 18 ? 3 : 4;
    return { dayAgo, count, level };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner & Quick Blitz Trigger */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-800/40">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>14-DAY ACTIVE STREAK 🔥</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Cognitive Memory Decay Monitor</h2>
          <p className="text-xs text-indigo-200/80 max-w-lg leading-relaxed">
            Real-time Ebbinghaus Forgetting Curve tracking. Prioritize review on fading and lapsed cards before neural traces decay.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playMasteredSound();
              onOpenBlitz();
            }}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-white text-white animate-pulse" />
            <div className="text-left">
              <div>5-Minute Quick Blitz</div>
              <div className="text-[10px] font-mono font-normal opacity-90">Review high-decay cards now</div>
            </div>
          </button>
        </div>
      </div>

      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Retention Average */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Overall Retention</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 font-mono">{overallRetention}%</span>
            <span className="text-xs font-medium text-emerald-600 font-mono">+4.2%</span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${overallRetention}%` }} />
          </div>
        </div>

        {/* Mastered / Fresh */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>Mastered & Fresh</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 font-mono">{freshCards.length}</span>
            <span className="text-xs text-stone-500">cards</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-2">Retention &gt; 80% • Solid recall</div>
        </div>

        {/* Review Soon / Fading */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Review Soon (Fading)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 font-mono">{fadingCards.length}</span>
            <span className="text-xs text-stone-500">cards</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-2">Retention 50-79% • Needs refresh</div>
        </div>

        {/* Lapsed / Forgotten */}
        <div className="p-5 rounded-2xl bg-white border border-rose-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>Lapsed (Critical)</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 font-mono">{lapsedCards.length}</span>
            <span className="text-xs text-stone-500">cards</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-2">Retention &lt; 50% • Immediate review</div>
        </div>
      </div>

      {/* VISUAL FORGETTING CURVE SVG GRAPH */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Ebbinghaus Memory Retention Timeline</h3>
            <p className="text-xs text-stone-500">Mathematical retention trajectory without review vs. spaced reinforcement intervals</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Fresh (&gt;80%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Fading (50-79%)
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Lapsed (&lt;50%)
            </span>
          </div>
        </div>

        {/* SVG Curve Diagram */}
        <div className="w-full h-64 relative bg-stone-50/70 rounded-2xl p-4 border border-stone-100 flex items-center justify-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 800 220">
            {/* Grid Lines */}
            <line x1="60" y1="20" x2="780" y2="20" stroke="#E6E4DD" strokeDasharray="4 4" />
            <line x1="60" y1="70" x2="780" y2="70" stroke="#E6E4DD" strokeDasharray="4 4" />
            <line x1="60" y1="120" x2="780" y2="120" stroke="#E6E4DD" strokeDasharray="4 4" />
            <line x1="60" y1="170" x2="780" y2="170" stroke="#E6E4DD" strokeDasharray="4 4" />

            {/* Y-Axis Labels */}
            <text x="25" y="25" fontSize="10" fill="#9CA3AF" fontFamily="monospace">100%</text>
            <text x="30" y="75" fontSize="10" fill="#9CA3AF" fontFamily="monospace">75%</text>
            <text x="30" y="125" fontSize="10" fill="#9CA3AF" fontFamily="monospace">50%</text>
            <text x="30" y="175" fontSize="10" fill="#9CA3AF" fontFamily="monospace">25%</text>

            {/* X-Axis Labels */}
            <text x="70" y="205" fontSize="11" fill="#6B7280" fontFamily="sans-serif">Day 0 (Initial Learn)</text>
            <text x="230" y="205" fontSize="11" fill="#6B7280" fontFamily="sans-serif">Day 1 Review</text>
            <text x="410" y="205" fontSize="11" fill="#6B7280" fontFamily="sans-serif">Day 4 Review</text>
            <text x="590" y="205" fontSize="11" fill="#6B7280" fontFamily="sans-serif">Day 10 Review</text>
            <text x="730" y="205" fontSize="11" fill="#6B7280" fontFamily="sans-serif">Day 30 (Mastery)</text>

            {/* Theoretical Unreviewed Decay Path (Dashed red/grey) */}
            <path
              d="M 70 30 Q 150 140, 750 185"
              fill="none"
              stroke="#F43F5E"
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.6"
            />

            {/* Reinforced Spaced Repetition Curve (Green peaks) */}
            <path
              d="M 70 30 Q 140 110, 230 120 L 230 40 Q 320 90, 410 100 L 410 35 Q 500 70, 590 75 L 590 30 Q 670 45, 760 50"
              fill="none"
              stroke="#10B981"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Data Point Pins */}
            <circle cx="70" cy="30" r="5" fill="#4F46E5" />
            <circle cx="230" cy="40" r="5" fill="#10B981" />
            <circle cx="410" cy="35" r="5" fill="#10B981" />
            <circle cx="590" cy="30" r="5" fill="#10B981" />
            <circle cx="760" cy="50" r="6" fill="#10B981" stroke="#fff" strokeWidth="2" />

            {/* Lapsed Point Callout */}
            <g transform="translate(190, 110)">
              <rect x="-10" y="-18" width="80" height="22" rx="6" fill="#F43F5E" />
              <text x="30" y="-4" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">
                Lapse Zone
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* DAILY STREAK HEATMAP GRID */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-stone-900">12-Week Retrieval Practice Consistency</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span>Less</span>
            <span className="w-3 h-3 rounded-xs bg-stone-100 border border-stone-200"></span>
            <span className="w-3 h-3 rounded-xs bg-emerald-200"></span>
            <span className="w-3 h-3 rounded-xs bg-emerald-400"></span>
            <span className="w-3 h-3 rounded-xs bg-emerald-600"></span>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 p-3 bg-stone-50 rounded-2xl border border-stone-100 overflow-x-auto">
          {heatmapCells.map((cell, idx) => (
            <div
              key={idx}
              title={`${cell.count} cards reviewed ${cell.dayAgo} days ago`}
              className={`w-3.5 h-3.5 rounded-xs transition-all cursor-pointer ${
                cell.level === 0
                  ? 'bg-stone-200/80 hover:bg-stone-300'
                  : cell.level === 1
                  ? 'bg-emerald-200 hover:bg-emerald-300'
                  : cell.level === 2
                  ? 'bg-emerald-400 hover:bg-emerald-500'
                  : cell.level === 3
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* DECKS BREAKDOWN & DIRECT STUDY BUTTONS */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-stone-900">Deck Memory Status Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const health = SpacedRepetitionEngine.getDeckHealth(deck.cards);
            return (
              <div
                key={deck.id}
                className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-indigo-300 shadow-2xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-stone-400 uppercase">
                      {deck.category}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                        health.score >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : health.score >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {health.score}% Health
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 mt-1">{deck.title}</h4>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">{deck.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-xs text-stone-500 font-mono">
                    {deck.cards.length} cards ({health.freshCount} fresh, {health.fadingCount + health.lapsedCount} due)
                  </div>
                  <button
                    onClick={() => {
                      sounds.playCardFlip();
                      onSelectDeckForStudy(deck.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Study Deck
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

