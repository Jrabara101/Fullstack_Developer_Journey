import React, { useState } from 'react';
import { GameProject } from '../types';
import { X, Send, CheckCircle2, MessageSquare, Star } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: GameProject | null;
  timestampSec: number;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  project,
  timestampSec,
}) => {
  const [authorName, setAuthorName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          targetType: 'trailer',
          timestampSec,
          authorName: authorName.trim() || 'Guest Playtester',
          feedbackText: feedbackText.trim(),
          rating,
        }),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } catch {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0d111a] border border-cyan-500/40 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-base text-white">
              Pin Technical Feedback
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
          <div className="text-slate-400">Target Project: <span className="text-white font-bold">{project.title}</span></div>
          <div className="text-cyan-400 mt-0.5">Timeline Anchor: {Math.floor(timestampSec / 60)}:{(timestampSec % 60 < 10 ? '0' : '')}{timestampSec % 60} ({timestampSec}s)</div>
        </div>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            <div className="text-sm font-mono text-emerald-300 font-bold">
              Feedback Anchored in Ledger!
            </div>
            <p className="text-xs text-slate-400">
              Thank you for contributing to the studio's playtest telemetry.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Your Name / Studio Tag</label>
              <input
                type="text"
                placeholder="e.g. Lucas @ Valve / Independent Dev"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Impact & Feel Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Timestamped Engineering Note</label>
              <textarea
                rows={3}
                required
                placeholder="Notice anything about the hit-stop freeze, camera trauma decay, or shader pass at this exact frame?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Post Pin'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
