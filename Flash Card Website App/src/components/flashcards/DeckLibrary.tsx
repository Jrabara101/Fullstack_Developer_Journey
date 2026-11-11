import React, { useState } from 'react';
import { Plus, Search, BookOpen, Download, Upload, Trash2, GitFork, Sparkles } from 'lucide-react';
import { Deck, Flashcard } from '../../types/flashcards';
import { SpacedRepetitionEngine } from '../../services/spacedRepetition';
import { sounds } from '../../services/soundEffects';

interface DeckLibraryProps {
  decks: Deck[];
  onSelectDeck: (deckId: string) => void;
  onAddDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onExportDecks: () => void;
  onImportDecks: (decks: Deck[]) => void;
}

export const DeckLibrary: React.FC<DeckLibraryProps> = ({
  decks,
  onSelectDeck,
  onAddDeck,
  onDeleteDeck,
  onExportDecks,
  onImportDecks,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('General');

  const filteredDecks = decks.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDeck: Deck = {
      id: `deck-custom-${Date.now()}`,
      title: newTitle,
      description: newDescription || 'Custom user flashcard collection',
      category: newCategory || 'General',
      cardCount: 1,
      lastStudiedAt: null,
      color: '#4F46E5',
      iconName: 'BookOpen',
      cards: [
        {
          id: `card-${Date.now()}`,
          front: 'Sample Card Question: What is active recall?',
          back: 'Active recall is the process of retrieving information from memory without looking at the answer.',
          deckId: `deck-custom-${Date.now()}`,
          tags: ['Starter'],
          intervalDays: 1,
          easeFactor: 2.5,
          repetitionCount: 0,
          lapseCount: 0,
          lastReviewedAt: null,
          nextReviewAt: Date.now(),
        },
      ],
    };

    onAddDeck(newDeck);
    sounds.playMasteredSound();
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportDecks(parsed);
            sounds.playMasteredSound();
          }
        } catch {
          alert('Invalid JSON decks backup file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header & Search / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Decks & Active Recall Library</h2>
          <p className="text-xs text-stone-500 mt-1">
            Offline-first synchronized collections with automatic SM-2 spaced repetition decay tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export / Import JSON */}
          <button
            onClick={onExportDecks}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium shadow-2xs transition-all cursor-pointer"
            title="Download JSON Backup"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium shadow-2xs transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          {/* New Deck Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Deck</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search decks by subject, title or category..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs text-stone-800"
        />
      </div>

      {/* Grid of Decks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDecks.map((deck) => {
          const health = SpacedRepetitionEngine.getDeckHealth(deck.cards);
          return (
            <div
              key={deck.id}
              className="p-6 rounded-3xl bg-white border border-stone-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                    {deck.category}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                      health.score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : health.score >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {health.score}% Retained
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 mt-2">{deck.title}</h3>
                <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                  {deck.description}
                </p>

                {deck.isForked && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                    <GitFork className="w-3 h-3" />
                    <span>Forked Collection</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-400 font-mono">
                  {deck.cards.length} cards
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`Delete deck "${deck.title}"?`)) {
                        onDeleteDeck(deck.id);
                        sounds.playCardSnap();
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                    title="Delete deck"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      sounds.playCardFlip();
                      onSelectDeck(deck.id);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Study Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Deck Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900">Create New Collection Deck</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Deck Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Molecular Genetics"
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Biology, Languages, Architecture"
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Short description of this deck's scope..."
                  className="w-full p-2.5 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  Create Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

