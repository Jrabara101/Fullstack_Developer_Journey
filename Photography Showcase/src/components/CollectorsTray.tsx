import React, { useState } from 'react';
import type { Photograph, ViewingRoomState } from '../types';
import { VisualIntelligenceEngine } from '../services/visualIntelligence';
import {
  X,
  Columns,
  Share2,
  Send,
  Trash2,
  Check,
  Copy,
  Maximize2
} from 'lucide-react';

interface CollectorsTrayProps {
  isOpen: boolean;
  onClose: () => void;
  collectedPhotos: Photograph[];
  onRemovePhoto: (id: string) => void;
  onClearAll: () => void;
  onInspect: (photo: Photograph) => void;
  onViewingRoomCreated: (state: ViewingRoomState) => void;
}

export const CollectorsTray: React.FC<CollectorsTrayProps> = ({
  isOpen,
  onClose,
  collectedPhotos,
  onRemovePhoto,
  onClearAll,
  onInspect,
  onViewingRoomCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'tray' | 'compare' | 'inquire' | 'share'>('tray');

  // Inquiry Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [inquiryType, setInquiryType] = useState<'Print Acquisition' | 'Commercial Licensing' | 'Editorial Portfolio Review'>('Print Acquisition');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedInquiry, setCopiedInquiry] = useState(false);

  // Share Viewing Room State
  const [roomTitle, setRoomTitle] = useState('Autumn Campaign Selects');
  const [curatorNote, setCuratorNote] = useState('Curated selections for the upcoming fine-art retrospective.');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleGenerateRoom = () => {
    const state: ViewingRoomState = {
      title: roomTitle || 'Private Curated Selection',
      clientName: clientName || undefined,
      note: curatorNote || undefined,
      selectedIds: collectedPhotos.map((p) => p.id),
      createdTimestamp: Date.now(),
    };
    const token = VisualIntelligenceEngine.encodeViewingRoom(state);
    const fullUrl = `${window.location.origin}${window.location.pathname}#room=${token}`;
    setGeneratedLink(fullUrl);
    onViewingRoomCreated(state);
  };

  const copyRoomLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const copyInquirySummary = () => {
    const plateList = collectedPhotos.map((p) => `• FIG. ${p.catalogNumber}: "${p.title}" (${p.aspectRatio}, Max Print: ${p.maxMuseumPrintInches.width}x${p.maxMuseumPrintInches.height}")`).join('\n');
    const summary = `EXHIBITION PRINT & LICENSING INQUIRY\nClient: ${clientName || 'Private Collector'} <${clientEmail || 'N/A'}>\nInquiry Type: ${inquiryType}\nPlates Requested (${collectedPhotos.length}):\n${plateList}\n\nClient Note:\n${inquiryNotes || 'None'}`;
    navigator.clipboard.writeText(summary);
    setCopiedInquiry(true);
    setTimeout(() => setCopiedInquiry(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6 transition-all duration-300">
      <div
        className="relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-t-2xl md:rounded-2xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-400"
        style={{
          backgroundColor: 'var(--canvas-bg)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Drawer Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D93829]" />
            <h2 className="font-serif text-xl tracking-tight font-medium" style={{ color: 'var(--text-primary)' }}>
              Collector’s Curation Tray
            </h2>
            <span className="font-mono text-xs text-neutral-400 tracking-wider">
              [{collectedPhotos.length.toString().padStart(2, '0')} PLATES PINNED]
            </span>
          </div>

          {/* Sub-Tabs: Tray / Compare / Inquire / Share Room */}
          <div className="flex items-center gap-1 p-1 rounded-full border bg-neutral-100 dark:bg-neutral-800 text-xs font-mono" style={{ borderColor: 'var(--border-hairline)' }}>
            <button
              onClick={() => setActiveTab('tray')}
              className={`px-3 py-1 rounded-full transition-all ${
                activeTab === 'tray'
                  ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-xs font-medium'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              disabled={collectedPhotos.length < 2}
              className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                activeTab === 'compare'
                  ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-xs font-medium'
                  : collectedPhotos.length < 2
                  ? 'opacity-40 cursor-not-allowed text-neutral-400'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title={collectedPhotos.length < 2 ? 'Select at least 2 plates to compare' : 'Compare selections side-by-side'}
            >
              <Columns size={12} />
              <span>Compare ({Math.min(collectedPhotos.length, 3)})</span>
            </button>
            <button
              onClick={() => setActiveTab('share')}
              disabled={collectedPhotos.length === 0}
              className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                activeTab === 'share'
                  ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-xs font-medium'
                  : collectedPhotos.length === 0
                  ? 'opacity-40 cursor-not-allowed text-neutral-400'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Share2 size={12} />
              <span>Share Viewing Room</span>
            </button>
            <button
              onClick={() => setActiveTab('inquire')}
              disabled={collectedPhotos.length === 0}
              className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                activeTab === 'inquire'
                  ? 'bg-[#D93829] text-white shadow-xs font-medium'
                  : collectedPhotos.length === 0
                  ? 'opacity-40 cursor-not-allowed text-neutral-400'
                  : 'text-neutral-500 hover:text-[#D93829]'
              }`}
            >
              <Send size={12} />
              <span>Inquire</span>
            </button>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab 1: Overview of Collected Plates */}
        {activeTab === 'tray' && (
          <div className="p-6 overflow-y-auto flex-1">
            {collectedPhotos.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-serif italic text-2xl text-neutral-400 mb-2">
                  No plates currently pinned to your tray.
                </p>
                <p className="font-sans text-xs text-neutral-500 max-w-sm mx-auto">
                  Browse the exhibition or contact sheet and click <span className="font-mono text-[#D93829]">[+ Collect]</span> beneath any photograph to curate your personal acquisition shortlist.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider">
                    Pinned Exhibition Selections
                  </span>
                  <button
                    onClick={onClearAll}
                    className="flex items-center gap-1 text-xs font-mono text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Clear All</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {collectedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group flex flex-col border rounded-xs overflow-hidden transition-all hover:shadow-md"
                      style={{
                        backgroundColor: 'var(--canvas-elevated)',
                        borderColor: 'var(--border-hairline)',
                      }}
                    >
                      <div
                        className="relative w-full aspect-video p-2 flex items-center justify-center cursor-pointer bg-neutral-900/5 dark:bg-neutral-900/50"
                        onClick={() => onInspect(photo)}
                      >
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemovePhoto(photo.id);
                          }}
                          className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-[#D93829] transition-colors"
                          title="Remove plate"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      <div className="p-3">
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono text-[10px] text-neutral-400">
                            FIG. {photo.catalogNumber}
                          </span>
                          <span className="font-mono text-[10px] text-neutral-500">
                            {photo.aspectRatio}
                          </span>
                        </div>
                        <h4 className="font-serif italic text-base tracking-tight truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>
                          {photo.title}
                        </h4>
                        <div className="mt-2 pt-2 border-t text-[10px] font-mono text-neutral-400 flex items-center justify-between" style={{ borderColor: 'var(--border-hairline)' }}>
                          <span>Max: {photo.maxMuseumPrintInches.width}×{photo.maxMuseumPrintInches.height} IN</span>
                          <button
                            onClick={() => onInspect(photo)}
                            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                          >
                            <Maximize2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Compare Side-by-Side */}
        {activeTab === 'compare' && (
          <div className="p-6 overflow-y-auto flex-1">
            <div className="mb-4">
              <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider block">
                Side-by-Side Frame & Tonal Comparison
              </span>
              <p className="font-serif italic text-sm text-neutral-500">
                Comparing up to 3 selected photographic compositions for visual weight and palette harmony.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {collectedPhotos.slice(0, 3).map((photo) => (
                <div
                  key={photo.id}
                  className="flex flex-col p-4 border rounded-xs"
                  style={{
                    backgroundColor: 'var(--canvas-elevated)',
                    borderColor: 'var(--border-hairline)',
                  }}
                >
                  <div
                    className="relative w-full aspect-square flex items-center justify-center p-3 mb-4 bg-neutral-900/10 dark:bg-black/40"
                    style={{ backgroundColor: photo.palette.ambientMattingHex }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <span className="font-mono text-xs text-neutral-400">
                    PLATE {photo.catalogNumber} • {photo.aspectRatio}
                  </span>
                  <h3 className="font-serif italic text-xl tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
                    {photo.title}
                  </h3>

                  <div className="mt-4 pt-3 border-t space-y-1.5 text-xs font-mono text-neutral-500" style={{ borderColor: 'var(--border-hairline)' }}>
                    <div>Light: <span className="text-neutral-800 dark:text-neutral-200 font-sans">{photo.lightQuality}</span></div>
                    <div>Palette: <span className="text-neutral-800 dark:text-neutral-200">{photo.tonalSwatch}</span></div>
                    <div>Lens: <span className="text-neutral-800 dark:text-neutral-200">{photo.exif.lens}</span></div>
                    <div>Camera: <span className="text-neutral-800 dark:text-neutral-200">{photo.exif.camera}</span></div>
                    <div>300 DPI Archival: <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{photo.maxMuseumPrintInches.width} × {photo.maxMuseumPrintInches.height} IN</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Share Private Viewing Room */}
        {activeTab === 'share' && (
          <div className="p-8 max-w-2xl mx-auto overflow-y-auto flex-1">
            <div className="mb-6 text-center">
              <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest block mb-1">
                CLIENT & CURATOR COLLABORATION
              </span>
              <h3 className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
                Create a Private Viewing Room
              </h3>
              <p className="font-serif italic text-sm text-neutral-500 mt-1">
                Package your {collectedPhotos.length} pinned photographs into an exclusive, shareable digital gallery room.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                  Viewing Room Exhibition Title
                </label>
                <input
                  type="text"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="e.g. Autumn Campaign Selects"
                  className="w-full px-4 py-2.5 rounded-sm border bg-transparent font-serif text-lg focus:outline-hidden focus:border-neutral-500"
                  style={{ borderColor: 'var(--border-hairline)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                  Curator’s Note / Client Brief
                </label>
                <textarea
                  rows={3}
                  value={curatorNote}
                  onChange={(e) => setCuratorNote(e.target.value)}
                  placeholder="Add specific instructions, framing preferences, or licensing intentions..."
                  className="w-full px-4 py-2 rounded-sm border bg-transparent font-sans text-xs focus:outline-hidden focus:border-neutral-500 resize-none"
                  style={{ borderColor: 'var(--border-hairline)' }}
                />
              </div>

              <button
                onClick={handleGenerateRoom}
                className="w-full py-3 rounded-sm bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity font-medium"
              >
                Generate Viewing Room URL
              </button>

              {generatedLink && (
                <div className="mt-4 p-4 rounded-sm border bg-neutral-50 dark:bg-neutral-900/60" style={{ borderColor: 'var(--border-hairline)' }}>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                    Persistent Curated Link:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-transparent border rounded-xs select-all truncate"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    />
                    <button
                      onClick={copyRoomLink}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xs bg-[#D93829] text-white text-xs font-mono whitespace-nowrap hover:bg-[#c22e20] transition-colors"
                    >
                      {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Send Print & Licensing Inquiry */}
        {activeTab === 'inquire' && (
          <div className="p-8 max-w-2xl mx-auto overflow-y-auto flex-1">
            {isSubmitted ? (
              <div className="py-12 text-center animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-[#D93829]/10 text-[#D93829] flex items-center justify-center mx-auto mb-4">
                  <Check size={24} />
                </div>
                <h3 className="font-serif text-3xl font-light mb-2">
                  Inquiry Dispatched
                </h3>
                <p className="font-serif italic text-neutral-500 max-w-md mx-auto mb-6">
                  Thank you, {clientName || 'Collector'}. Your curated inquiry for {collectedPhotos.length} archival photographic plates has been prepared with full sensor resolution specs.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={copyInquirySummary}
                    className="flex items-center gap-2 px-4 py-2 rounded-sm border text-xs font-mono"
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    {copiedInquiry ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedInquiry ? 'Copied Specs' : 'Copy Inquiry Text'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-sm bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-mono"
                  >
                    Back to Gallery
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest block mb-1">
                    STUDIO ARCHIVE ACQUISITION
                  </span>
                  <h3 className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
                    Print & Licensing Inquiry
                  </h3>
                  <p className="font-serif italic text-xs text-neutral-500 mt-1">
                    Attached: {collectedPhotos.map((p) => `FIG. ${p.catalogNumber}`).join(', ')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                      Your Name / Organization
                    </label>
                    <input
                      required
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Julian Vance / Christie’s"
                      className="w-full px-3 py-2 rounded-sm border bg-transparent text-sm focus:outline-hidden focus:border-neutral-500"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="curator@gallery.com"
                      className="w-full px-3 py-2 rounded-sm border bg-transparent text-sm focus:outline-hidden focus:border-neutral-500"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                    Inquiry Intent
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value as typeof inquiryType)}
                    className="w-full px-3 py-2 rounded-sm border bg-transparent text-xs font-mono focus:outline-hidden focus:border-neutral-500"
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    <option value="Print Acquisition" className="bg-neutral-900 text-white">Archival Pigment Print Acquisition (Editioned)</option>
                    <option value="Commercial Licensing" className="bg-neutral-900 text-white">Commercial Rights & Brand Campaign Licensing</option>
                    <option value="Editorial Portfolio Review" className="bg-neutral-900 text-white">Curatorial Museum Exhibition / Editorial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                    Special Framing or Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryNotes}
                    onChange={(e) => setInquiryNotes(e.target.value)}
                    placeholder="Specify target dimensions (e.g. 24x36 Raw Oak), project timelines, or gallery installation specs..."
                    className="w-full px-3 py-2 rounded-sm border bg-transparent text-xs focus:outline-hidden focus:border-neutral-500 resize-none"
                    style={{ borderColor: 'var(--border-hairline)' }}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-sm bg-[#D93829] hover:bg-[#c22e20] text-white font-mono text-xs uppercase tracking-widest font-medium transition-colors"
                  >
                    Transmit Curated Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={copyInquirySummary}
                    className="px-4 py-3 rounded-sm border text-xs font-mono hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                    style={{ borderColor: 'var(--border-hairline)' }}
                    title="Copy formatted inquiry to clipboard"
                  >
                    {copiedInquiry ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
