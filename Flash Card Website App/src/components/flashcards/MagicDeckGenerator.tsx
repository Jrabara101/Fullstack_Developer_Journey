import React, { useState } from 'react';
import { Sparkles, FileText, Check, Plus, Trash2, BookOpen, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Deck, Flashcard } from '../../types/flashcards';
import { sounds } from '../../services/soundEffects';

interface MagicDeckGeneratorProps {
  onAddDeck: (newDeck: Deck) => void;
  onOpenDeck: (deckId: string) => void;
}

const SAMPLE_NOTES = {
  biochem: `Cellular Respiration and ATP Synthesis:
1. Glycolysis: Occurs in the cytoplasm. Breaks down one glucose molecule into two pyruvate molecules, yielding a net of 2 ATP and 2 NADH.
2. The Citric Acid Cycle (Krebs Cycle): Takes place in the mitochondrial matrix. Acetyl-CoA combines with oxaloacetate to form citrate. It produces 3 NADH, 1 FADH2, and 1 GTP per turn.
3. Oxidative Phosphorylation: Located on the inner mitochondrial membrane. The electron transport chain creates a proton gradient across the intermembrane space.
4. ATP Synthase: Uses proton-motive force (chemiosmosis) to phosphorylate ADP into ATP, generating approximately 28 to 32 ATP per glucose.`,

  distributed: `Distributed Consensus and Fault Tolerance:
1. Raft Algorithm: A consensus algorithm designed to be understandable. It decomposes consensus into Leader Election, Log Replication, and Safety.
2. Leader Election: If a follower node experiences an election timeout without receiving heartbeats, it transitions to candidate state and requests votes.
3. Quorum: A consensus operation requires an affirmative vote from a strict majority (N/2 + 1) of active nodes to commit entries.
4. Split-Brain: A failure scenario where network partitioning causes two leaders to believe they are the authoritative coordinator. Raft prevents split-brain by requiring majority quorum.`,

  quantum: `Quantum Computing Core Concepts:
1. Qubit: The fundamental unit of quantum information, capable of existing in a superposition of |0⟩ and |1⟩ states simultaneously.
2. Superposition: A linear combination of basis states described by α|0⟩ + β|1⟩, where |α|² + |β|² = 1.
3. Quantum Entanglement: A phenomenon where two or more particles become correlated such that the quantum state of one cannot be described independently of the other.
4. Decoherence: The loss of quantum coherence caused by unwanted environmental interactions and thermal noise.`,
};

export const MagicDeckGenerator: React.FC<MagicDeckGeneratorProps> = ({
  onAddDeck,
  onOpenDeck,
}) => {
  const [deckTitle, setDeckTitle] = useState<string>('Biochemistry: Cellular Respiration');
  const [deckCategory, setDeckCategory] = useState<string>('Molecular Biology');
  const [notesInput, setNotesInput] = useState<string>(SAMPLE_NOTES.biochem);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCards, setGeneratedCards] = useState<Array<{ front: string; back: string; tags: string[] }>>([]);

  // Smart heuristic extractor for Q&A, definitions, and cloze prompts
  const extractCardsFromNotes = (text: string) => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 10);

    const cards: Array<{ front: string; back: string; tags: string[] }> = [];

    lines.forEach((line) => {
      // Remove leading numbering like "1. " or "- "
      const cleanLine = line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '');

      // Check for colon separation: "Term: Definition..."
      if (cleanLine.includes(':')) {
        const [term, ...rest] = cleanLine.split(':');
        const def = rest.join(':').trim();
        if (term.length > 2 && def.length > 5) {
          // Standard Q&A
          cards.push({
            front: `Define or describe the role of: ${term.trim()}`,
            back: def,
            tags: ['High-Yield Q&A', 'Definition'],
          });

          // Cloze Deletion variant
          cards.push({
            front: `[Cloze Recall] What process/concept ${def.length > 30 ? def.slice(0, 45) + '...' : def}?`,
            back: term.trim(),
            tags: ['Cloze Deletion'],
          });
        }
      } else {
        // Sentence with "is" or "occurs"
        const sentences = cleanLine.split('. ');
        sentences.forEach((sent) => {
          if (sent.length > 20) {
            cards.push({
              front: `What key concept is described here: "${sent.slice(0, 60)}..."?`,
              back: sent,
              tags: ['Concept Recall'],
            });
          }
        });
      }
    });

    return cards;
  };

  const handleGenerate = () => {
    if (!notesInput.trim()) return;
    setIsGenerating(true);
    sounds.playCardFlip();

    setTimeout(() => {
      const extracted = extractCardsFromNotes(notesInput);
      setGeneratedCards(extracted);
      setIsGenerating(false);
      sounds.playMasteredSound();
    }, 600);
  };

  const handleLoadSample = (sampleKey: keyof typeof SAMPLE_NOTES, title: string, category: string) => {
    setDeckTitle(title);
    setDeckCategory(category);
    setNotesInput(SAMPLE_NOTES[sampleKey]);
    sounds.playCardSnap();
  };

  const handleCreateDeck = () => {
    if (generatedCards.length === 0) return;

    const newDeckId = `deck-magic-${Date.now()}`;
    const newCards: Flashcard[] = generatedCards.map((c, idx) => ({
      id: `card-gen-${Date.now()}-${idx}`,
      front: c.front,
      back: c.back,
      deckId: newDeckId,
      tags: c.tags,
      intervalDays: 1,
      easeFactor: 2.5,
      repetitionCount: 0,
      lapseCount: 0,
      lastReviewedAt: null,
      nextReviewAt: Date.now(),
    }));

    const newDeck: Deck = {
      id: newDeckId,
      title: deckTitle || 'Generated Magic Deck',
      description: `Auto-extracted from notes (${newCards.length} high-yield active recall cards).`,
      category: deckCategory || 'General Knowledge',
      cardCount: newCards.length,
      lastStudiedAt: null,
      cards: newCards,
      color: '#4F46E5',
      iconName: 'Sparkles',
    };

    onAddDeck(newDeck);
    sounds.playCompletionFanfare();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.7 },
    });
    onOpenDeck(newDeckId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Notes-to-Cards AI Engine</span>
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mt-2">Instant Magic Deck Generator</h2>
        <p className="text-xs text-stone-500 mt-1 max-w-xl">
          Paste raw lecture transcripts, textbook excerpts, or choose a pre-loaded syllabus. The engine automatically extracts high-yield Q&A pairs, cloze deletions, and core definitions.
        </p>
      </div>

      {/* Preset Pickers */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-stone-600">Sample Syllabi:</span>
        <button
          onClick={() => handleLoadSample('biochem', 'Biochemistry: Cellular Respiration', 'Molecular Biology')}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium transition-all shadow-2xs cursor-pointer"
        >
          🧬 Cellular Respiration & ATP
        </button>
        <button
          onClick={() => handleLoadSample('distributed', 'Distributed Consensus & Raft', 'Computer Systems')}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium transition-all shadow-2xs cursor-pointer"
        >
          ⚡ Raft & Distributed Consensus
        </button>
        <button
          onClick={() => handleLoadSample('quantum', 'Quantum Computing Principles', 'Physics')}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium transition-all shadow-2xs cursor-pointer"
        >
          ⚛️ Quantum Qubits & Superposition
        </button>
      </div>

      {/* Input Form */}
      <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Deck Title</label>
            <input
              type="text"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="e.g. Neuroscience 101"
              className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Category / Subject</label>
            <input
              type="text"
              value={deckCategory}
              onChange={(e) => setDeckCategory(e.target.value)}
              placeholder="e.g. Medicine, Engineering"
              className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Raw Lecture Notes / Text Excerpt</label>
          <textarea
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            rows={7}
            placeholder="Paste raw bullet points, definitions, or textbook paragraphs..."
            className="w-full p-3 text-xs font-mono bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-800 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-stone-400">
            {notesInput.length} characters • Ready to extract high-yield cards
          </span>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !notesInput.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Extracting Q&A Pairs...' : 'Extract High-Yield Flashcards'}</span>
          </button>
        </div>
      </div>

      {/* Extracted Preview List */}
      {generatedCards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-stone-900">
                Extracted Cards ({generatedCards.length})
              </h3>
            </div>

            <button
              onClick={handleCreateDeck}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Launch Deck in Studio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedCards.map((c, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-400 mb-1">
                    <span>CARD #{idx + 1}</span>
                    <span className="text-indigo-600">{c.tags.join(', ')}</span>
                  </div>
                  <div className="text-xs font-semibold text-stone-800 line-clamp-2">{c.front}</div>
                  <div className="mt-2 text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100 line-clamp-3">
                    {c.back}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-end">
                  <button
                    onClick={() => {
                      setGeneratedCards((prev) => prev.filter((_, i) => i !== idx));
                      sounds.playCardSnap();
                    }}
                    className="text-stone-400 hover:text-rose-500 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

