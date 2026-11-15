import React, { useState } from 'react';
import { 
  X, 
  Code, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  FileCode2, 
  FileAudio, 
  ExternalLink 
} from 'lucide-react';
import { MediaAsset, TransformationParams } from '../../types';
import { EdgeService } from '../../services/edgeService';

interface CodeRecipeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asset: MediaAsset;
  params: TransformationParams;
}

export const CodeRecipeDrawer: React.FC<CodeRecipeDrawerProps> = ({
  isOpen,
  onClose,
  asset,
  params,
}) => {
  const [activeTab, setActiveTab] = useState<'react' | 'html' | 'audio' | 'raw'>(
    asset.type === 'audio' ? 'audio' : 'react'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync tab with asset type if asset switches
  React.useEffect(() => {
    setActiveTab(asset.type === 'audio' ? 'audio' : 'react');
  }, [asset.type]);

  if (!isOpen) return null;

  const snippets = EdgeService.generateCodeSnippets(asset, params);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isAudio = asset.type === 'audio';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-edge-panel border-l sm:border border-white/10 sm:rounded-2xl w-full max-w-xl h-full sm:h-auto sm:max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-edge-obsidian/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-edge-cyan/20 border border-edge-cyan/30 flex items-center justify-center text-edge-cyan">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Drop-In Component Recipe</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-edge-cyan/15 text-edge-cyan border border-edge-cyan/30 font-bold uppercase">
                  Zero Layout Shift
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Copy pre-configured code with responsive srcset and BlurHash placeholders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-3 bg-edge-well/60 border-b border-white/5 text-xs font-medium">
          {!isAudio ? (
            <>
              <button
                onClick={() => setActiveTab('react')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'react' ? 'bg-edge-cyan text-edge-obsidian font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>React &lt;EdgeImage /&gt;</span>
              </button>
              <button
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'html' ? 'bg-edge-cyan text-edge-obsidian font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>HTML &lt;picture&gt;</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'audio' ? 'bg-edge-amber text-edge-obsidian font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>React &lt;EdgeAudioPlayer /&gt;</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'raw' ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Raw CDN URL</span>
          </button>
        </div>

        {/* Snippet Code View */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'react' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-[11px]">Next.js / Vite React Component:</span>
                <button
                  onClick={() => handleCopy(snippets.reactImage, 'react')}
                  className="flex items-center gap-1 text-edge-cyan hover:text-cyan-300 transition-colors"
                >
                  {copiedKey === 'react' ? <Check className="w-3.5 h-3.5 text-edge-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'react' ? 'Copied!' : 'Copy React Component'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-edge-obsidian border border-white/10 text-gray-200 overflow-x-auto leading-relaxed shadow-inner">
                {snippets.reactImage}
              </pre>
            </div>
          )}

          {activeTab === 'html' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-[11px]">Semantic Multi-Format HTML5 Picture:</span>
                <button
                  onClick={() => handleCopy(snippets.htmlPicture, 'html')}
                  className="flex items-center gap-1 text-edge-cyan hover:text-cyan-300 transition-colors"
                >
                  {copiedKey === 'html' ? <Check className="w-3.5 h-3.5 text-edge-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'html' ? 'Copied!' : 'Copy HTML Snippet'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-edge-obsidian border border-white/10 text-gray-200 overflow-x-auto leading-relaxed shadow-inner">
                {snippets.htmlPicture}
              </pre>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-[11px]">Adaptive React Audio Component:</span>
                <button
                  onClick={() => handleCopy(snippets.reactAudio, 'audio')}
                  className="flex items-center gap-1 text-edge-amber hover:text-amber-300 transition-colors"
                >
                  {copiedKey === 'audio' ? <Check className="w-3.5 h-3.5 text-edge-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'audio' ? 'Copied!' : 'Copy Audio Component'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-edge-obsidian border border-white/10 text-gray-200 overflow-x-auto leading-relaxed shadow-inner">
                {snippets.reactAudio}
              </pre>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-[11px]">Clean Edge CDN URL:</span>
                <button
                  onClick={() => handleCopy(snippets.rawUrl, 'raw')}
                  className="flex items-center gap-1 text-edge-cyan hover:text-cyan-300 transition-colors"
                >
                  {copiedKey === 'raw' ? <Check className="w-3.5 h-3.5 text-edge-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'raw' ? 'Copied!' : 'Copy URL'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-edge-obsidian border border-white/10 text-gray-200 overflow-x-auto break-all shadow-inner">
                {snippets.rawUrl}
              </pre>
            </div>
          )}
        </div>

        {/* Footer info pill */}
        <div className="p-4 border-t border-white/10 bg-edge-obsidian/80 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5 text-edge-emerald font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Includes Pre-computed CSS aspect-ratio</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
