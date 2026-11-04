import React from 'react';
import { 
  X, 
  Play, 
  Plus, 
  Check, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Film, 
  Award, 
  Layers, 
  Volume2,
  Tv
} from 'lucide-react';
import { MediaItem } from '../types';
import { calculateFinishTime } from '../services/finishByCalculator';

interface DetailModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (item: MediaItem) => void;
  onToggleShortlist: (item: MediaItem) => void;
  isInShortlist: boolean;
  referenceTime: Date;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onPlay,
  onToggleShortlist,
  isInShortlist,
  referenceTime
}) => {
  if (!isOpen || !item) return null;

  const finishInfo = calculateFinishTime(
    item.durationMinutes,
    item.progress?.progressSeconds ?? 0,
    referenceTime
  );

  const { dialogueVsAction, tensionCurve, intensityLevel, pacingNote } = item.pacingProfile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#121418] border border-white/15 overflow-hidden shadow-2xl flex flex-col my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Media Header */}
        <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full overflow-hidden bg-black flex-shrink-0">
          <img
            src={item.backdropUrl}
            alt={item.title}
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-transparent to-black/60" />

          {/* Title & Metadata Overlay */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-[#E50914] text-white text-[10px] font-extrabold uppercase tracking-wider">
                {item.type.toUpperCase()}
              </span>
              <span className="text-[#34D399] text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {item.matchScores.alex || 96}% Vibe Match
              </span>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              {item.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-white/80 mt-1">
              <span className="font-mono-numbers">{finishInfo.durationFormatted}</span>
              <span>•</span>
              <span className="px-1.5 py-0.2 rounded bg-white/15 text-[11px] font-mono-numbers">
                {item.maturityRating}
              </span>
              <span>•</span>
              <span>{item.releaseYear}</span>
              <span>•</span>
              <span className="text-[#FBBF24] font-mono-numbers">
                Finish by {finishInfo.finishTimeFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-white/10">
            <button
              onClick={() => {
                onPlay(item);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-white/90 text-black font-extrabold text-sm flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Now</span>
            </button>

            <button
              onClick={() => onToggleShortlist(item)}
              className={`px-5 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all ${
                isInShortlist
                  ? 'bg-[#34D399]/20 border-[#34D399] text-[#34D399]'
                  : 'glass-pill text-white hover:bg-white/20'
              }`}
            >
              {isInShortlist ? (
                <>
                  <Check className="w-4 h-4 text-[#34D399]" />
                  <span>In Tonight's Shortlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Shortlist</span>
                </>
              )}
            </button>

            <div className="ml-auto flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30">
                {item.criticScore}% Critics
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30">
                {item.audienceScore}% Audience
              </span>
            </div>
          </div>

          {/* "Why Watch Tonight" & Synopsis */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
              Curator’s Pitch
            </h3>
            <p className="text-base font-semibold text-white/95 leading-snug">
              "{item.editorialHook}"
            </p>
            <p className="text-sm text-white/75 leading-relaxed">
              {item.synopsis}
            </p>
          </div>

          {/* HUMAN-CENTRIC PACING & COGNITIVE LOAD BREAKDOWN */}
          <div className="p-5 rounded-2xl bg-[#181A20] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#34D399]" />
                <h4 className="font-display font-bold text-sm text-white">
                  Pacing & Cognitive Attention Profile
                </h4>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399]">
                Intensity: {intensityLevel}
              </span>
            </div>

            {/* Cognitive Load Badge & Note */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#34D399]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Recommended Attention Mode: {item.cognitiveLoad}
                </div>
                <div className="text-xs text-white/60 mt-0.5">
                  {item.cognitiveLoad === 'Background-Friendly'
                    ? 'Safe to multi-task, cook, or chat with friends without losing comprehension.'
                    : 'Dense subtext and intricate clues. Best experienced with room lights dimmed and no phone distractions.'}
                </div>
              </div>
            </div>

            {/* Dialogue vs Action Ratio Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Dialogue Weight ({dialogueVsAction}%)</span>
                <span>Action / Kinetic Weight ({100 - dialogueVsAction}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-[#38BDF8] to-[#818CF8]"
                  style={{ width: `${dialogueVsAction}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-[#F43F5E] to-[#E50914]"
                  style={{ width: `${100 - dialogueVsAction}%` }}
                />
              </div>
            </div>

            {/* Tension Curve Visualizer (SVG) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Narrative Tension Curve:</span>
                <span className="text-[11px] text-white/40">{pacingNote}</span>
              </div>

              <div className="h-20 w-full bg-black/40 rounded-xl p-2 border border-white/5 flex items-end">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                  <path
                    d={`M 0,${50 - tensionCurve[0] / 2} Q 25,${50 - tensionCurve[1] / 2} 50,${50 - tensionCurve[2] / 2} T 75,${50 - tensionCurve[3] / 2} T 100,${50 - tensionCurve[4] / 2}`}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {tensionCurve.map((val, idx) => (
                    <circle
                      key={idx}
                      cx={idx * 25}
                      cy={50 - val / 2}
                      r="3.5"
                      fill="#FFFFFF"
                    />
                  ))}
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>Act 1: Setup</span>
                <span>Act 2: Complication</span>
                <span>Midpoint Climax</span>
                <span>Crisis</span>
                <span>Resolution</span>
              </div>
            </div>
          </div>

          {/* Cast & Technical Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-white/70 border-t border-white/10">
            <div>
              <span className="font-bold text-white block mb-1">Director</span>
              <p>{item.director}</p>
            </div>
            <div>
              <span className="font-bold text-white block mb-1">Starring</span>
              <p>{item.cast.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

