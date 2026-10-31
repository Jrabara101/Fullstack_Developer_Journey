import React, { useState } from 'react';
import { DevLogEntry } from '../types';
import { SweptAabbCanvas } from '../demos/SweptAabbCanvas';
import { 
  FileText, 
  Calendar, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  MessageSquarePlus,
  Send
} from 'lucide-react';

interface DevLogChronicleProps {
  devlogs: DevLogEntry[];
  onOpenFeedback?: (devlog: DevLogEntry) => void;
}

export const DevLogChronicle: React.FC<DevLogChronicleProps> = ({
  devlogs,
  onOpenFeedback,
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(devlogs[0]?.slug || '');
  const [feedbackAuthor, setFeedbackAuthor] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const activeLog = devlogs.find((d) => d.slug === selectedSlug) || devlogs[0];

  const handlePostFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !activeLog) return;

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeLog.projectId,
          targetType: 'devlog',
          devlogSectionId: activeLog.slug,
          authorName: feedbackAuthor || 'Game Developer Peer',
          feedbackText: feedbackText.trim(),
          rating: 5,
        }),
      });
      setFeedbackSubmitted(true);
      setFeedbackText('');
      setTimeout(() => setFeedbackSubmitted(false), 4000);
    } catch {
      // Fallback
      setFeedbackSubmitted(true);
    }
  };

  if (!activeLog) return null;

  return (
    <section id="devlogs" className="w-full py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-purple-400" />
            Living Architecture Chronicle
          </div>
          <h2 className="text-3xl font-bold font-display tracking-wide text-white">
            DEV-LOG & BENCHMARK ARCHIVE
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Time-travel through key architectural breakthroughs, profiling snapshots, and algorithm rewrites with side-by-side performance benchmarks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (lg:col-span-4): Milestone Timeline Picker */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <h3 className="text-xs font-mono uppercase text-slate-400 font-bold mb-4 tracking-wider">
              Milestone Version Timeline
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-800 space-y-4">
              {devlogs.map((log) => {
                const isSelected = log.slug === activeLog.slug;
                return (
                  <div key={log.id} className="relative">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        isSelected
                          ? 'bg-purple-500 border-white shadow-[0_0_10px_#a855f7]'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                    />

                    <button
                      onClick={() => setSelectedSlug(log.slug)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-purple-950/30 border-purple-500/50 text-white shadow-md'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="text-purple-400 font-bold">{log.versionTag}</span>
                        <span className="text-slate-500">{log.readingTimeMinutes} min read</span>
                      </div>
                      <div className="text-xs font-semibold line-clamp-2 text-slate-200">
                        {log.title}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-8): Active Article Dossier */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0d1017] border border-slate-800 p-6 lg:p-8 flex flex-col gap-6 shadow-2xl">
          {/* Article Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-[11px] font-mono text-purple-300 font-bold">
                {activeLog.versionTag}
              </span>
              {activeLog.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-2xl lg:text-3xl font-display font-bold text-white mb-3">
              {activeLog.title}
            </h1>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pb-4 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                {new Date(activeLog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {activeLog.readingTimeMinutes} min read
              </span>
            </div>
          </div>

          {/* Embedded Interactive Canvas Widget (e.g., Continuous Swept AABB) */}
          {activeLog.interactiveWidgetType === 'collision-tunneling' && (
            <SweptAabbCanvas />
          )}

          {/* Side-by-Side Performance Benchmarks Grid */}
          {activeLog.benchmarks && activeLog.benchmarks.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Hardware Performance Benchmarks
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeLog.benchmarks.map((bm, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-400 font-mono mb-2 line-clamp-2">
                      {bm.metric}
                    </span>
                    <div className="flex items-baseline justify-between">
                      <div className="text-[10px] font-mono text-slate-500 line-through">
                        {bm.before}
                      </div>
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {bm.after}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-300 mt-1">
                      ▲ {bm.improvementPercent}% Improvement
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Article Markdown Content Body */}
          <div className="prose prose-invert prose-sm max-w-none font-sans text-slate-300 leading-relaxed space-y-4">
            <p className="text-base text-slate-200 font-medium leading-relaxed">
              {activeLog.summary}
            </p>

            <div className="whitespace-pre-wrap font-mono text-xs p-4 rounded-xl bg-black/60 border border-slate-800/80 text-slate-300 overflow-x-auto">
              {activeLog.contentMarkdown}
            </div>
          </div>

          {/* Playtester Feedback Pinning Form */}
          <div className="mt-4 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
              <MessageSquarePlus className="w-4 h-4" />
              Leave Technical Feedback / Playtester Pin
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Reviewing this architecture pass? Leave an authoritative engineering note or question directly in the ledger.
            </p>

            <form onSubmit={handlePostFeedback} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Name / Studio Handle"
                  value={feedbackAuthor}
                  onChange={(e) => setFeedbackAuthor(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <textarea
                rows={3}
                placeholder="Share your thoughts on the Swept AABB solver, frame pacing, or GC optimizations..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              />
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono flex items-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                  Submit Pin To Ledger
                </button>
                {feedbackSubmitted && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Feedback pinned successfully!
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
