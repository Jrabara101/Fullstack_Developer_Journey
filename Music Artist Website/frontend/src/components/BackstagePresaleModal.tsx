import React, { useState } from 'react';
import { Bell, X, Check, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BackstageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackstagePresaleModal: React.FC<BackstageModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-[#0D0F14] border border-white/20 shadow-2xl p-6 sm:p-8 relative hardware-transition animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--era-accent)]/15 text-[var(--era-accent)] border border-[var(--era-accent)]/30 flex items-center justify-center mb-4">
              <Bell className="w-6 h-6" />
            </div>

            <div className="text-[10px] font-mono text-[var(--era-accent)] uppercase tracking-wider font-bold">
              Direct Fan Channel // Backstage Dispatch
            </div>

            <h3 className="text-2xl font-display font-extrabold uppercase text-white mt-1">
              Join the Backstage Ledger
            </h3>

            <p className="mt-2 text-xs text-zinc-300 font-sans leading-relaxed">
              Receive anti-scalper presale access codes 48 hours before public on-sale, secret vinyl pressing drop notifications, and unreleased studio demo stems.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Fan Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-zinc-400 focus:outline-none focus:border-[var(--era-accent)]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Mobile SMS (Optional for Day-of-Show Alerts)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-zinc-400 focus:outline-none focus:border-[var(--era-accent)]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-zinc-400 font-sans leading-tight">
                🔒 Zero spam guarantee. We communicate only during tour announcements, vinyl releases, and venue line-skip updates.
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[var(--era-accent)] hover:opacity-90 text-white font-bold uppercase tracking-wider text-xs shadow-lg transition-transform active:scale-95"
              >
                Join Backstage Fan Club
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4 font-mono">
            <div className="w-12 h-12 rounded-full bg-signal-emerald/20 text-signal-emerald mx-auto flex items-center justify-center border border-signal-emerald/40">
              <Check className="w-6 h-6" />
            </div>

            <div className="text-xl font-display font-bold uppercase text-white">
              Backstage Access Granted
            </div>

            <p className="text-xs text-zinc-300 font-sans">
              Your fan profile is verified. Your personal anti-scalper tour passcode is:
            </p>

            <div className="p-3.5 rounded-xl bg-black/80 border border-signal-cyan/50 text-signal-cyan font-bold text-base tracking-widest">
              CHROME2026
            </div>

            <div className="text-[11px] text-zinc-400 font-sans">
              Use this code in the Tour section to unlock anti-scalper tickets for upcoming dates.
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

