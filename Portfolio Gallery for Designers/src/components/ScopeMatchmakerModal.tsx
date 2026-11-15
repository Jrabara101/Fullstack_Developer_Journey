import React, { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

interface ScopeMatchmakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefcaseCount: number;
  onAttachAndOpenBriefcase: () => void;
}

type FocusOption = 'brand' | 'product' | 'photo' | 'hybrid';
type PaceOption = 'sprint' | 'full' | 'shoot' | 'retainer';

const FOCUS_CARDS: { id: FocusOption; title: string; detail: string }[] = [
  { id: 'brand', title: 'Brand & Typographic Monograph', detail: 'Identity architecture, custom grids & print collateral' },
  { id: 'product', title: 'Digital Product / UI System', detail: 'Keyboard-first workspace UX, tokens & prototypes' },
  { id: 'photo', title: 'Editorial Photography Series', detail: '35mm / medium-format location shoot & archival plates' },
  { id: 'hybrid', title: 'Multi-Discipline Art Direction', detail: 'Unified brand identity + campaign imagery + digital launch' },
];

const PACE_CARDS: { id: PaceOption; title: string; timeline: string; range: string }[] = [
  { id: 'sprint', title: '2-Week Intensive Sprint', timeline: 'Nov 18 – Dec 2', range: '$8,500 – $12,000' },
  { id: 'full', title: '6–8 Week End-to-End System', timeline: 'Late Nov – Jan', range: '$22,000 – $36,000' },
  { id: 'shoot', title: '2–3 Day Editorial Commission', timeline: 'Dec Open Dates', range: '$6,500 – $11,500' },
  { id: 'retainer', title: 'Quarterly Design Partner', timeline: 'Q4 / Q1 Cohort', range: '$10,000 / mo' },
];

export const ScopeMatchmakerModal: React.FC<ScopeMatchmakerModalProps> = ({
  isOpen,
  onClose,
  briefcaseCount,
  onAttachAndOpenBriefcase,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [focus, setFocus] = useState<FocusOption>('product');
  const [pace, setPace] = useState<PaceOption>('sprint');
  const [booked, setBooked] = useState(false);

  if (!isOpen) return null;

  const selectedFocus = FOCUS_CARDS.find((f) => f.id === focus)!;
  const selectedPace = PACE_CARDS.find((p) => p.id === pace)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[660px] rounded-[14px] glass-whisper border border-[var(--border-hairline-strong)] p-6 sm:p-8 shadow-2xl exhibition-flip-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-[var(--border-hairline)]">
          <div>
            <div className="inline-flex items-center gap-2 font-mono-catalog text-[11px] uppercase tracking-[0.07em] text-[var(--text-secondary)]">
              <span className="w-[6px] h-[6px] rounded-full bg-[var(--accent-emerald)] pulse-availability" />
              <span>Booking Nov / Dec 2026 Commissions &amp; Sprints</span>
            </div>
            <h2 className="font-serif-display text-[32px] leading-tight text-[var(--text-primary)] mt-1.5">
              3-Click Studio Scope Matchmaker
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[var(--border-hairline)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Close Scope Matchmaker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mt-5 mb-6 font-mono-catalog text-[10px] uppercase tracking-[0.08em]">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStep(n as 1 | 2 | 3)}
              className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                step === n
                  ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)]'
                  : 'bg-[var(--canvas-elevated)] text-[var(--text-muted)]'
              }`}
            >
              0{n} / {n === 1 ? 'Discipline' : n === 2 ? 'Cadence' : 'Match'}
            </button>
          ))}
        </div>

        {/* Step 1: Need */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-[14px] text-[var(--text-secondary)] mb-3">
              What are we shaping together?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FOCUS_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setFocus(card.id);
                    setStep(2);
                  }}
                  className={`p-4 rounded-[12px] text-left border transition-all cursor-pointer ${
                    focus === card.id
                      ? 'border-[var(--text-primary)] bg-[var(--canvas-elevated)]'
                      : 'border-[var(--border-hairline)] hover:border-[var(--border-hairline-strong)]'
                  }`}
                >
                  <div className="font-serif-display text-[21px] text-[var(--text-primary)]">
                    {card.title}
                  </div>
                  <div className="text-[12.5px] text-[var(--text-secondary)] mt-1">
                    {card.detail}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Cadence */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-[14px] text-[var(--text-secondary)] mb-3">
              Select preferred studio cadence &amp; availability window:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PACE_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setPace(card.id);
                    setStep(3);
                  }}
                  className={`p-4 rounded-[12px] text-left border transition-all cursor-pointer ${
                    pace === card.id
                      ? 'border-[var(--text-primary)] bg-[var(--canvas-elevated)]'
                      : 'border-[var(--border-hairline)] hover:border-[var(--border-hairline-strong)]'
                  }`}
                >
                  <div className="font-mono-catalog text-[10px] uppercase tracking-[0.07em] text-[var(--text-muted)]">
                    {card.timeline}
                  </div>
                  <div className="font-serif-display text-[21px] text-[var(--text-primary)] mt-0.5">
                    {card.title}
                  </div>
                  <div className="font-mono-catalog text-[12px] text-[var(--text-secondary)] mt-1.5">
                    Est. {card.range}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Instant Match Summary */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="p-5 rounded-[12px] bg-[var(--canvas-elevated)] border border-[var(--border-hairline-strong)]">
              <div className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Recommended Studio Engagement
              </div>
              <div className="font-serif-display text-[28px] text-[var(--text-primary)] mt-1">
                {selectedFocus.title}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 pt-3 border-t border-[var(--border-hairline)] font-mono-catalog">
                <div>
                  <div className="text-[10px] uppercase text-[var(--text-muted)]">Cadence</div>
                  <div className="text-[12px] text-[var(--text-primary)] mt-0.5">{selectedPace.title}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[var(--text-muted)]">Window</div>
                  <div className="text-[12px] text-[var(--text-primary)] mt-0.5">{selectedPace.timeline}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[var(--text-muted)]">Guide Range</div>
                  <div className="text-[12px] text-[var(--text-primary)] mt-0.5">{selectedPace.range}</div>
                </div>
              </div>
            </div>

            {booked ? (
              <div className="p-4 rounded-[10px] border border-emerald-500/40 bg-emerald-500/10 text-[13px] flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Window reserved provisionally ({selectedPace.timeline}). Open your Client Briefcase to attach visual plates or send directly.
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onAttachAndOpenBriefcase}
                  className="px-4 py-2.5 rounded-full border border-[var(--border-hairline-strong)] text-[12px] font-medium text-[var(--text-primary)] hover:bg-[var(--canvas-elevated)] cursor-pointer"
                >
                  Attach {briefcaseCount} Briefcase Plates &amp; Compose →
                </button>

                <button
                  type="button"
                  onClick={() => setBooked(true)}
                  className="px-5 py-2.5 rounded-full bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)] text-[12px] font-medium inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                >
                  <span>Reserve {selectedPace.timeline} Intro</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

