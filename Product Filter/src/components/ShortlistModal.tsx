import React, { useState, useEffect } from 'react';
import { useDiscoveryStore } from '../stores/discoveryStore';
import { FilterQueryState } from '../types';
import { X, Copy, Check, Share2, Download, Sparkles, ArrowRight } from 'lucide-react';

interface ShortlistModalProps {
  filterState: FilterQueryState;
  onHydrateShortlist: (state: FilterQueryState, comparisonIds: string[]) => void;
}

export const ShortlistModal: React.FC<ShortlistModalProps> = ({
  filterState,
  onHydrateShortlist,
}) => {
  const { isShortlistModalOpen, setShortlistModalOpen, comparisonItems } = useDiscoveryStore();
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [hydrateError, setHydrateError] = useState<string | null>(null);
  const [hydrateSuccess, setHydrateSuccess] = useState(false);

  // Mint new shortlist snapshot when opened
  useEffect(() => {
    if (isShortlistModalOpen && !generatedCode) {
      setIsMinting(true);
      fetch('/api/shortlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filterState,
          comparisonItemIds: comparisonItems.map((i) => i.id),
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          setGeneratedCode(data.code);
          setIsMinting(false);
        })
        .catch((err) => {
          console.error('Failed to create shortlist:', err);
          setIsMinting(false);
        });
    }
  }, [isShortlistModalOpen]);

  if (!isShortlistModalOpen) return null;

  const shareableUrl = generatedCode
    ? `${window.location.origin}/?shortlist=${generatedCode}`
    : '';

  const handleCopy = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHydrate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setHydrateError(null);
    try {
      const res = await fetch(`/api/shortlists/${inputCode.trim().toUpperCase()}`);
      if (!res.ok) {
        throw new Error('Shortlist code not found or expired.');
      }
      const snapshot = await res.json();
      onHydrateShortlist(snapshot.filterState, snapshot.comparisonItemIds || []);
      setHydrateSuccess(true);
      setTimeout(() => {
        setHydrateSuccess(false);
        setShortlistModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setHydrateError(err.message || 'Failed to load shortlist');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#0F131D] border border-[#1E2638] rounded-2xl p-6 shadow-2xl relative animate-slide-up">
        <button
          onClick={() => {
            setShortlistModalOpen(false);
            setGeneratedCode(null);
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">
              SHAREABLE SHORTLIST SNAPSHOT
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              6-Character Immutable Ledger Link
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          Your active filter parameters, Priority Alchemist weight blend, and comparison dock tray items are cryptographically captured into this shareable link.
        </p>

        {/* 6-Character Slug Display & Copy */}
        <div className="mt-5 bg-[#080A0F] border border-[#1E2638] rounded-xl p-3.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
            <span>SHORTLIST SNAPSHOT CODE</span>
            <span className="text-emerald-400 font-semibold">Active & Synced</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-2xl font-bold tracking-widest text-cyan-300">
              {isMinting ? 'MINTING...' : generatedCode || '------'}
            </span>
            <button
              onClick={handleCopy}
              disabled={!generatedCode}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium shadow-[0_0_10px_rgba(99,102,241,0.3)]"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>

          <div className="mt-2 text-[11px] font-mono text-slate-500 truncate select-all">
            {shareableUrl}
          </div>
        </div>

        {/* Hydrate / Enter an Existing Code */}
        <div className="mt-6 pt-5 border-t border-[#1E2638]">
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            LOAD EXISTING SHORTLIST CODE
          </span>
          <form onSubmit={handleHydrate} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g. PRO77X"
              className="flex-1 bg-[#171D2B] border border-[#1E2638] rounded-xl px-3 py-2 text-sm font-mono tracking-widest uppercase text-white outline-none focus:border-cyan-400 font-bold placeholder-slate-600"
            />
            <button
              type="submit"
              className="bg-[#171D2B] hover:bg-[#20283A] text-slate-200 border border-[#1E2638] px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load</span>
            </button>
          </form>

          {hydrateError && (
            <p className="text-xs font-mono text-rose-400 mt-2">{hydrateError}</p>
          )}
          {hydrateSuccess && (
            <p className="text-xs font-mono text-emerald-400 mt-2">
              ✓ Successfully hydrated shortlist snapshot!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
