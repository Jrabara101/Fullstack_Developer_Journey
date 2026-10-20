import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Check } from 'lucide-react';
import {
  generateGradientAvatar,
  generateInitialsAvatar,
  generateGeometricSeedAvatar
} from '../../services/avatarGenerator';

export function GenerativeAvatarModal({ isOpen, onClose, currentName, onSelect }) {
  if (!isOpen) return null;

  const [seedName, setSeedName] = useState(currentName || 'Alex Vance');
  const [selectedStyle, setSelectedStyle] = useState('gradient'); // 'gradient' | 'initials' | 'geometric'

  const gradientPreview = generateGradientAvatar(seedName);
  const initialsPreview = generateInitialsAvatar(seedName);
  const geometricPreview = generateGeometricSeedAvatar(seedName);

  const previews = {
    gradient: gradientPreview,
    initials: initialsPreview,
    geometric: geometricPreview
  };

  const handleRandomize = () => {
    const adjectives = ['Quantum', 'Cyber', 'Solar', 'Velvet', 'Astral', 'Prism', 'Echo', 'Neon', 'Vivid'];
    const nouns = ['Pioneer', 'Architect', 'Voyager', 'Matrix', 'Nexus', 'Horizon', 'Atelier', 'Pulse'];
    const randomSeed = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    setSeedName(randomSeed);
  };

  const handleApply = () => {
    onSelect({
      url: previews[selectedStyle],
      altText: `Generative ${selectedStyle} avatar seeded by '${seedName}'`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-2xl shadow-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#181B22] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              Generative Avatar Studio
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="p-6 space-y-5">
          {/* Active Preview Showcase */}
          <div className="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-black/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
            <div className="relative group">
              <img
                src={previews[selectedStyle]}
                alt="Generative avatar preview"
                className="w-28 h-28 rounded-full shadow-xl ring-4 ring-white dark:ring-slate-800 object-cover"
              />
              <span className="absolute bottom-1 right-1 px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-blue-600 text-white uppercase shadow-md">
                {selectedStyle}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
              Seed: "{seedName}"
            </p>
          </div>

          {/* Seed Input & Randomize */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Entropy Seed Generator
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={seedName}
                onChange={(e) => setSeedName(e.target.value)}
                placeholder="Type any word or phrase..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121418] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleRandomize}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Randomize seed words"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Random</span>
              </button>
            </div>
          </div>

          {/* Style Selector Tiles */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Choose Generative Architecture
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Gradient Mesh */}
              <button
                type="button"
                onClick={() => setSelectedStyle('gradient')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  selectedStyle === 'gradient'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <img src={gradientPreview} alt="Gradient" className="w-10 h-10 rounded-full shadow" />
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  Gradient Mesh
                </span>
              </button>

              {/* Clean Initials */}
              <button
                type="button"
                onClick={() => setSelectedStyle('initials')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  selectedStyle === 'initials'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <img src={initialsPreview} alt="Initials" className="w-10 h-10 rounded-full shadow" />
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  Clean Initials
                </span>
              </button>

              {/* Algorithmic SVG Seed */}
              <button
                type="button"
                onClick={() => setSelectedStyle('geometric')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  selectedStyle === 'geometric'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <img src={geometricPreview} alt="Geometric" className="w-10 h-10 rounded-full shadow" />
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  Algorithmic Seed
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Apply Generative Avatar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
