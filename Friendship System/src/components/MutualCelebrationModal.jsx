import React from 'react';
import { Sparkles, Check, X, ShieldCheck, MessageCircle, LockOpen } from 'lucide-react';
import { useSocialGraph } from '../context/SocialGraphContext';

export function MutualCelebrationModal() {
  const { celebrationData, closeCelebration } = useSocialGraph();

  if (!celebrationData) return null;

  const { initiator, target, establishedAt } = celebrationData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-3xl glass-panel-elevated border border-amber-500/30 p-8 text-center shadow-[0_0_60px_rgba(234,179,8,0.25)] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeCelebration}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Interconnected Rings Micro-Interaction */}
        <div className="relative flex items-center justify-center my-4 h-28">
          {/* Ring 1 (Initiator) */}
          <div className="absolute w-20 h-20 -translate-x-6 rounded-full border-4 border-amber-400/80 shadow-[0_0_25px_rgba(234,179,8,0.6)] animate-ring-pulse flex items-center justify-center bg-slate-900/60 overflow-hidden">
            <img 
              src={initiator?.avatar} 
              alt={initiator?.displayName} 
              className="w-full h-full object-cover opacity-90"
            />
          </div>

          {/* Central Interlocking Sparkle Node */}
          <div className="z-10 w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-pulse">
            <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>

          {/* Ring 2 (Target) */}
          <div className="absolute w-20 h-20 translate-x-6 rounded-full border-4 border-emerald-400/80 shadow-[0_0_25px_rgba(52,211,153,0.6)] animate-ring-pulse flex items-center justify-center bg-slate-900/60 overflow-hidden">
            <img 
              src={target?.avatar} 
              alt={target?.displayName} 
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        </div>

        {/* Milestone Headline */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Reciprocal Loop Completed</span>
        </div>

        <h3 className="text-2xl font-bold text-white tracking-tight">
          Mutual Friendship Unlocked!
        </h3>

        <p className="text-slate-300 text-sm mt-2 max-w-sm mx-auto">
          <span className="font-semibold text-amber-300">@{initiator?.username}</span> and{' '}
          <span className="font-semibold text-emerald-300">@{target?.username}</span> are now mutual friends.
        </p>

        {/* Mutual Privileges Unlocked Checklist */}
        <div className="mt-6 text-left rounded-2xl bg-slate-900/70 border border-slate-800/80 p-4 space-y-2.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Enhanced Intimacy Privileges Unlocked
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
              <LockOpen className="w-3.5 h-3.5" />
            </div>
            <span>Audience-gated <strong>Mutuals-Only</strong> posts & stories now visible</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
              <MessageCircle className="w-3.5 h-3.5" />
            </div>
            <span>Direct messaging & private communication channel open</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>Exclusive <strong>Mutual Friends</strong> status pill & verified badge</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span>Direct contact info (phone/email) revealed via Postgres RLS</span>
          </div>
        </div>

        {/* Milestone memory chip */}
        <div className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-2">
          <span>✨ Established on {establishedAt}</span>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={closeCelebration}
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-amber-500/25 transition-all duration-200 active:scale-[0.99]"
          >
            Explore Mutual Features
          </button>
        </div>
      </div>
    </div>
  );
}
