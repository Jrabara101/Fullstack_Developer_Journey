import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Plus, Eye, EyeOff, Save, Trash2, X, RefreshCw, Upload } from 'lucide-react';
import { Flashcard } from '../../types/flashcards';
import { sounds } from '../../services/soundEffects';

interface Mask {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  label: string;
  revealed?: boolean;
}

interface ImageOcclusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToDeck: (card: Flashcard) => void;
  deckId: string;
}

const PRESET_DIAGRAMS = [
  {
    title: 'Anatomy: Human Heart & Great Vessels',
    url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1000&q=80',
    defaultMasks: [
      { id: 'm-1', x: 22, y: 30, width: 22, height: 16, label: 'Superior Vena Cava', revealed: false },
      { id: 'm-2', x: 52, y: 24, width: 24, height: 18, label: 'Aorta & Arch', revealed: false },
      { id: 'm-3', x: 50, y: 64, width: 26, height: 20, label: 'Left Ventricle Myocardium', revealed: false },
    ],
  },
  {
    title: 'Cloud Systems: Microservices & Event Mesh',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
    defaultMasks: [
      { id: 'ms-1', x: 18, y: 28, width: 26, height: 20, label: 'API Gateway & Envoy Proxy', revealed: false },
      { id: 'ms-2', x: 54, y: 32, width: 28, height: 22, label: 'Distributed Kafka Event Mesh', revealed: false },
      { id: 'ms-3', x: 42, y: 68, width: 26, height: 18, label: 'Redis Replica Cluster', revealed: false },
    ],
  },
];

export const ImageOcclusionModal: React.FC<ImageOcclusionModalProps> = ({
  isOpen,
  onClose,
  onSaveToDeck,
  deckId,
}) => {
  const [selectedDiagramIndex, setSelectedDiagramIndex] = useState<number>(0);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [masks, setMasks] = useState<Mask[]>(PRESET_DIAGRAMS[0].defaultMasks);
  const [activeTab, setActiveTab] = useState<'study' | 'edit'>('study');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [newMaskLabel, setNewMaskLabel] = useState<string>('Anatomical Label');
  const imageContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentImage = customImageUrl || PRESET_DIAGRAMS[selectedDiagramIndex].url;

  // Handle preset change
  const selectPreset = (index: number) => {
    setSelectedDiagramIndex(index);
    setCustomImageUrl(null);
    setMasks(PRESET_DIAGRAMS[index].defaultMasks);
    sounds.playCardSnap();
  };

  // Handle custom upload via file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImageUrl(reader.result as string);
        setMasks([]);
        setActiveTab('edit');
        sounds.playCardSnap();
      };
      reader.readAsDataURL(file);
    }
  };

  // Mouse drawing on image container
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTab !== 'edit' || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPos || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.min(startPos.x, currentX);
    const y = Math.min(startPos.y, currentY);
    const width = Math.abs(currentX - startPos.x);
    const height = Math.abs(currentY - startPos.y);

    setCurrentBox({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox) return;
    setIsDrawing(false);
    if (currentBox.width > 3 && currentBox.height > 3) {
      const newMask: Mask = {
        id: `mask-${Date.now()}`,
        x: Math.round(currentBox.x),
        y: Math.round(currentBox.y),
        width: Math.round(currentBox.width),
        height: Math.round(currentBox.height),
        label: newMaskLabel || `Label #${masks.length + 1}`,
        revealed: false,
      };
      setMasks([...masks, newMask]);
      sounds.playCardSnap();
    }
    setStartPos(null);
    setCurrentBox(null);
  };

  const toggleMaskReveal = (maskId: string) => {
    setMasks((prev) =>
      prev.map((m) => (m.id === maskId ? { ...m, revealed: !m.revealed } : m))
    );
    sounds.playCardFlip();
  };

  const revealAllMasks = () => {
    setMasks((prev) => prev.map((m) => ({ ...m, revealed: true })));
    sounds.playMasteredSound();
  };

  const hideAllMasks = () => {
    setMasks((prev) => prev.map((m) => ({ ...m, revealed: false })));
    sounds.playCardSnap();
  };

  const deleteMask = (maskId: string) => {
    setMasks((prev) => prev.filter((m) => m.id !== maskId));
  };

  const handleSaveCard = () => {
    const cardTitle = customImageUrl
      ? 'Custom Diagram Occlusion Card'
      : PRESET_DIAGRAMS[selectedDiagramIndex].title;

    const newCard: Flashcard = {
      id: `card-occlusion-${Date.now()}`,
      front: `[Image Occlusion] Identify the masked structures in: ${cardTitle}`,
      back: `Revealed structures: ${masks.map((m) => m.label).join('; ')}`,
      deckId,
      tags: ['Image Occlusion', 'Visual Memory'],
      intervalDays: 1,
      easeFactor: 2.5,
      repetitionCount: 0,
      lapseCount: 0,
      lastReviewedAt: null,
      nextReviewAt: Date.now(),
      occlusionData: {
        imageUrl: currentImage,
        imageTitle: cardTitle,
        masks: masks.map((m) => ({ ...m, revealed: false })),
      },
    };

    onSaveToDeck(newCard);
    sounds.playMasteredSound();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Image Occlusion Studio</h2>
              <p className="text-xs text-stone-500">Draw masks over anatomical or schematic labels to test visual recall</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('study')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'study' ? 'bg-white text-indigo-700 shadow-xs' : 'text-stone-600'
                }`}
              >
                Study / Reveal
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'edit' ? 'bg-white text-indigo-700 shadow-xs' : 'text-stone-600'
                }`}
              >
                Draw Masks ({masks.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Selector & Upload Bar */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Choose Diagram:</span>
            {PRESET_DIAGRAMS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => selectPreset(idx)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  !customImageUrl && selectedDiagramIndex === idx
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {preset.title.split(':')[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 cursor-pointer shadow-2xs font-medium">
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Upload Custom Chart</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center">
          {activeTab === 'edit' && (
            <div className="w-full mb-3 flex items-center justify-between bg-indigo-50/70 border border-indigo-200 p-2.5 rounded-xl text-xs text-indigo-900">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Click and drag on the diagram below to mask a label. Enter next label text:</span>
              </div>
              <input
                type="text"
                value={newMaskLabel}
                onChange={(e) => setNewMaskLabel(e.target.value)}
                placeholder="e.g. Left Ventricle"
                className="bg-white px-2.5 py-1 rounded-md border border-indigo-300 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Interactive Image Container */}
          <div
            ref={imageContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`relative rounded-2xl overflow-hidden border-2 border-stone-300 select-none shadow-lg max-w-2xl w-full ${
              activeTab === 'edit' ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            <img
              src={currentImage}
              alt="Occlusion Study Diagram"
              className="w-full h-auto max-h-[50vh] object-cover pointer-events-none"
            />

            {/* Existing Masks */}
            {masks.map((mask, idx) => (
              <div
                key={mask.id}
                onClick={() => {
                  if (activeTab === 'study') toggleMaskReveal(mask.id);
                }}
                style={{
                  left: `${mask.x}%`,
                  top: `${mask.y}%`,
                  width: `${mask.width}%`,
                  height: `${mask.height}%`,
                }}
                className={`absolute rounded-lg border-2 transition-all flex items-center justify-center p-1 text-center shadow-md ${
                  mask.revealed
                    ? 'bg-emerald-500/85 border-emerald-400 text-white backdrop-blur-xs'
                    : 'bg-indigo-600/95 border-indigo-400 text-white hover:scale-102 hover:bg-indigo-700'
                } ${activeTab === 'study' ? 'cursor-pointer' : 'cursor-move'}`}
              >
                {activeTab === 'study' ? (
                  mask.revealed ? (
                    <span className="text-[11px] font-bold tracking-tight drop-shadow-xs">{mask.label}</span>
                  ) : (
                    <span className="text-[11px] font-bold font-mono tracking-wider drop-shadow-xs flex items-center gap-1">
                      [#{idx + 1} Tap]
                    </span>
                  )
                ) : (
                  <div className="flex items-center justify-between w-full px-1">
                    <span className="text-[10px] font-semibold truncate text-white">{mask.label}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMask(mask.id);
                      }}
                      className="text-white hover:text-rose-200 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Currently Drawing Box Preview */}
            {isDrawing && currentBox && (
              <div
                style={{
                  left: `${currentBox.x}%`,
                  top: `${currentBox.y}%`,
                  width: `${currentBox.width}%`,
                  height: `${currentBox.height}%`,
                }}
                className="absolute border-2 border-dashed border-amber-400 bg-amber-400/30 rounded-lg pointer-events-none"
              />
            )}
          </div>

          {/* Mask count and Study Controls */}
          {activeTab === 'study' && (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={revealAllMasks}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Reveal All Labels</span>
              </button>
              <button
                onClick={hideAllMasks}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                <EyeOff className="w-4 h-4 text-stone-500" />
                <span>Hide All Labels</span>
              </button>
              <span className="text-xs text-stone-500 font-mono">
                {masks.filter((m) => m.revealed).length} of {masks.length} Revealed
              </span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-xs text-stone-500 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
            <span>Interactive visual card with {masks.length} occlusion checkpoints</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCard}
              disabled={masks.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save Occlusion Card to Deck</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

