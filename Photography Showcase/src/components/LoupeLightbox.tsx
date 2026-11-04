import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Photograph, FrameFinish, PrintSize } from '../types';
import { ambientAudio } from '../services/ambientAudio';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  Frame,
  Volume2,
  VolumeX,
  Plus,
  Check,
  Compass,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';

interface LoupeLightboxProps {
  photo: Photograph;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  collectedIds: Set<string>;
  onToggleCollect: (photo: Photograph) => void;
  onOpenInquiry: (photo: Photograph) => void;
}

export const LoupeLightbox: React.FC<LoupeLightboxProps> = ({
  photo,
  onClose,
  onNext,
  onPrev,
  collectedIds,
  onToggleCollect,
  onOpenInquiry,
}) => {
  // UI Idle auto-hide timer (2 seconds)
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  // Active view modes inside lightbox
  const [isLoupeActive, setIsLoupeActive] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showWallPreview, setShowWallPreview] = useState(false);

  // Loupe cursor position
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0, percentX: 50, percentY: 50 });
  const [isHoldingMouseDown, setIsHoldingMouseDown] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Wall scale preview options
  const [frameFinish, setFrameFinish] = useState<FrameFinish>('raw-oak');
  const [printSize, setPrintSize] = useState<PrintSize>('24x36');

  // Sonic Postcard state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [waveformLevels, setWaveformLevels] = useState<number[]>([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);

  // Reset idle timer on any mouse activity
  const handleUserActivity = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      // Don't hide if inspecting with loupe or in wall mode modal
      if (!isHoldingMouseDown && !showStory && !showWallPreview) {
        setIsIdle(true);
      }
    }, 2500);
  }, [isHoldingMouseDown, showStory, showWallPreview]);

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    handleUserActivity();

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [handleUserActivity]);

  // Audio subscribe
  useEffect(() => {
    const unsub = ambientAudio.subscribeWaveform((lvls) => {
      setWaveformLevels(lvls);
    });
    return () => {
      unsub();
      ambientAudio.stop();
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showWallPreview) setShowWallPreview(false);
        else if (showStory) setShowStory(false);
        else onClose();
      } else if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key.toLowerCase() === 'z') {
        setIsLoupeActive((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, showWallPreview, showStory]);

  // Mouse move for Loupe position inside image container
  const handleMouseMoveOnImage = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    setLoupePos({ x, y, percentX, percentY });
  };

  const toggleAudio = () => {
    if (isAudioPlaying) {
      ambientAudio.fadeOutAndStop();
      setIsAudioPlaying(false);
    } else if (photo.sonicPostcard) {
      ambientAudio.play(photo.sonicPostcard.soundType, photo.sonicPostcard.durationSeconds);
      setIsAudioPlaying(true);
    }
  };

  // Switch sound when slide changes if playing
  useEffect(() => {
    if (isAudioPlaying && photo.sonicPostcard) {
      ambientAudio.play(photo.sonicPostcard.soundType, photo.sonicPostcard.durationSeconds);
    }
  }, [photo, isAudioPlaying]);

  // Frame finish styling for "See It on the Wall"
  const getFrameStyle = () => {
    switch (frameFinish) {
      case 'unframed':
        return 'shadow-2xl ring-1 ring-black/10';
      case 'raw-oak':
        return 'border-[16px] border-[#C8A97E] shadow-[0_25px_50px_rgba(0,0,0,0.35)] ring-1 ring-[#9E7B50]';
      case 'matte-black':
        return 'border-[18px] border-[#161616] shadow-[0_25px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10';
    }
  };

  // Scale percentage for print size preview
  const getPrintScalePercentage = () => {
    switch (printSize) {
      case '16x24': return 'scale-70';
      case '24x36': return 'scale-90';
      case '40x60': return 'scale-115';
    }
  };

  const isCollected = collectedIds.has(photo.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center select-none overflow-hidden"
      style={{
        backgroundColor: '#0E0E0E',
      }}
    >
      {/* Ambient Border Matting Tint */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none transition-colors duration-1000"
        style={{
          backgroundColor: photo.palette.ambientMattingHex,
        }}
      />

      {/* Top Floating Whisper Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 h-20 px-8 flex items-center justify-between transition-all duration-400 ${
          isIdle ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">
            FIG. {photo.catalogNumber} / 24
          </span>
          <div className="h-3 w-[1px] bg-white/20" />
          <h2 className="font-serif italic text-white/90 text-lg hidden sm:inline">
            {photo.title}
          </h2>
          <span className="font-mono text-[11px] text-white/40 tracking-wider hidden md:inline">
            [{photo.aspectRatio} • {photo.lightQuality}]
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Loupe Toggle Button */}
          <button
            onClick={() => setIsLoupeActive((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
              isLoupeActive || isHoldingMouseDown
                ? 'bg-white text-black border-white'
                : 'bg-black/50 text-white/80 border-white/20 hover:text-white hover:border-white/50'
            }`}
            title="Toggle Optical Loupe (or press Z, or hold click on image)"
          >
            <Search size={13} />
            <span className="hidden sm:inline">Loupe [Z]</span>
          </button>

          {/* Wall-Scale Toggle Button */}
          <button
            onClick={() => setShowWallPreview((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
              showWallPreview
                ? 'bg-[#C8A97E] text-black border-[#C8A97E] font-medium'
                : 'bg-black/50 text-white/80 border-white/20 hover:text-white hover:border-white/50'
            }`}
            title="See it on the wall (Architectural Print Scale Preview)"
          >
            <Frame size={13} />
            <span className="hidden sm:inline">See on Wall</span>
          </button>

          {/* Behind the Frame / Story Toggle Button */}
          <button
            onClick={() => setShowStory((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
              showStory
                ? 'bg-white text-black border-white font-medium'
                : 'bg-black/50 text-white/80 border-white/20 hover:text-white hover:border-white/50'
            }`}
            title="Behind the Frame (Human Context & Ambient Audio)"
          >
            <BookOpen size={13} />
            <span className="hidden sm:inline">Behind the Frame</span>
          </button>

          {/* Close Lightbox */}
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-white/20 bg-black/50 text-white/80 hover:text-white hover:border-white transition-all ml-2"
            title="Close Lightbox (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={onPrev}
        className={`absolute left-4 md:left-8 z-30 p-3 rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/80 border border-white/10 transition-all ${
          isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        title="Previous Frame (←)"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={onNext}
        className={`absolute right-4 md:right-8 z-30 p-3 rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/80 border border-white/10 transition-all ${
          isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        title="Next Frame (→)"
      >
        <ChevronRight size={22} />
      </button>

      {/* Main Photographic Canvas (Zero-Crop Stage) */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-center p-6 md:p-14"
        onMouseDown={() => setIsHoldingMouseDown(true)}
        onMouseUp={() => setIsHoldingMouseDown(false)}
      >
        {!showWallPreview ? (
          /* Normal Lightbox Stage */
          <div
            ref={imageContainerRef}
            onMouseMove={handleMouseMoveOnImage}
            className="relative max-w-[88vw] max-h-[85vh] flex items-center justify-center cursor-crosshair"
            style={{
              aspectRatio: `${photo.aspectRatioNumeric}`,
            }}
          >
            <img
              src={photo.highResUrl}
              alt={photo.title}
              className="w-full h-full object-contain pointer-events-none shadow-2xl"
              style={{
                borderRadius: '0px',
              }}
            />

            {/* Interactive Optical Loupe Lens Overlay */}
            {(isLoupeActive || isHoldingMouseDown) && (
              <div
                className="absolute pointer-events-none rounded-full border-2 border-white/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden z-40"
                style={{
                  width: '240px',
                  height: '240px',
                  left: `${loupePos.x - 120}px`,
                  top: `${loupePos.y - 120}px`,
                }}
              >
                {/* 2.5x Zoomed Image Layer */}
                <div
                  className="w-full h-full bg-no-repeat"
                  style={{
                    backgroundImage: `url(${photo.highResUrl})`,
                    backgroundPosition: `${loupePos.percentX}% ${loupePos.percentY}%`,
                    backgroundSize: '350%',
                  }}
                />

                {/* Simulated Film Grain & Fine Reticle Crosshair */}
                <div className="absolute inset-0 film-grain-dense pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-8 h-[1px] bg-white" />
                  <div className="h-8 w-[1px] bg-white absolute" />
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest text-white/90 bg-black/60 px-2 py-0.5 rounded-full uppercase">
                  100% CROP • GRAIN INSPECT
                </div>
              </div>
            )}
          </div>
        ) : (
          /* "See It on the Wall" (Print Scale Architectural Preview) */
          <div className="relative w-full h-full flex flex-col items-center justify-center pt-8">
            {/* Wall Setting Background: Neutral Minimalist Gallery Wall */}
            <div className="relative w-full max-w-4xl h-[68vh] bg-[#ECE9E2] dark:bg-[#1C1C1A] border border-neutral-300 dark:border-neutral-800 shadow-inner flex flex-col items-center justify-between p-8 overflow-hidden rounded-xs">
              {/* Gallery Track Lighting Gradient */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

              {/* Framed Artwork on Wall */}
              <div className="flex-1 flex items-center justify-center z-10 w-full">
                <div
                  className={`transition-all duration-500 max-h-[46vh] ${getPrintScalePercentage()} ${getFrameStyle()}`}
                  style={{
                    aspectRatio: `${photo.aspectRatioNumeric}`,
                  }}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Minimalist Linen Sofa & Gallery Credenza Silhouette for Human Scale */}
              <div className="w-full max-w-2xl flex flex-col items-center z-10 opacity-75">
                {/* Teak/Linen Bench Top */}
                <div className="w-full h-3 bg-[#A38B74] dark:bg-[#3A332C] rounded-xs shadow-md" />
                {/* Bench Legs */}
                <div className="w-full flex justify-between px-16 h-12">
                  <div className="w-2 bg-[#705E4D] dark:bg-[#25201B]" />
                  <div className="w-2 bg-[#705E4D] dark:bg-[#25201B]" />
                </div>
              </div>
            </div>

            {/* Architectural Frame & Size Selector Controls */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 px-6 py-3 rounded-full bg-black/80 border border-white/10 backdrop-blur-md z-30">
              {/* Frame Finishes */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Finish:
                </span>
                <button
                  onClick={() => setFrameFinish('raw-oak')}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    frameFinish === 'raw-oak'
                      ? 'border-[#C8A97E] text-[#C8A97E] font-medium bg-[#C8A97E]/10'
                      : 'border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  Raw Oak
                </button>
                <button
                  onClick={() => setFrameFinish('matte-black')}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    frameFinish === 'matte-black'
                      ? 'border-white text-white font-medium bg-white/10'
                      : 'border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  Matte Black
                </button>
                <button
                  onClick={() => setFrameFinish('unframed')}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    frameFinish === 'unframed'
                      ? 'border-white text-white font-medium bg-white/10'
                      : 'border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  Archival Float
                </button>
              </div>

              <div className="h-4 w-[1px] bg-white/20" />

              {/* Physical Print Sizes */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Print Scale:
                </span>
                <button
                  onClick={() => setPrintSize('16x24')}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    printSize === '16x24'
                      ? 'border-white text-white font-medium bg-white/10'
                      : 'border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  16 × 24 IN
                </button>
                <button
                  onClick={() => setPrintSize('24x36')}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    printSize === '24x36'
                      ? 'border-white text-white font-medium bg-white/10'
                      : 'border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  24 × 36 IN
                </button>
                <button
                  onClick={() => setPrintSize('40x60')}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    printSize === '40x60'
                      ? 'border-white text-white font-medium bg-white/10'
                      : 'border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  40 × 60 IN
                </button>
              </div>

              <div className="h-4 w-[1px] bg-white/20" />

              {/* Native Resolution & Museum Quality Rating */}
              <div className="text-[11px] font-mono text-neutral-300">
                Max 300 DPI Archival: <span className="text-white font-medium">{photo.maxMuseumPrintInches.width} × {photo.maxMuseumPrintInches.height} IN</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* "Behind the Frame" Human Story Drawer */}
      {showStory && (
        <aside aria-label="Field notes and backstory" className="absolute bottom-24 left-8 md:left-14 z-40 max-w-lg w-full p-6 rounded-xl border border-white/15 bg-black/85 backdrop-blur-xl shadow-2xl text-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Camera size={14} className="text-[#D93829]" />
              <span className="font-mono text-[11px] tracking-widest uppercase text-neutral-400">
                FIELD NOTE & HUMAN CONTEXT
              </span>
            </div>
            <button
              onClick={() => setShowStory(false)}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X size={14} />
            </button>
          </div>

          {/* Photographer's 2-sentence note */}
          <p className="font-serif italic text-lg leading-relaxed text-neutral-200">
            “{photo.fieldNote}”
          </p>

          {/* Humanized Light & Lens Narrative */}
          <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
              <Compass size={13} className="text-neutral-400" />
              <span>{photo.humanizedLightContext}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
              <Layers size={13} className="text-neutral-400" />
              <span>{photo.lensEditorialTag} ({photo.exif.lens})</span>
            </div>
          </div>

          {/* Sonic Postcard Ambient Audio Player */}
          {photo.sonicPostcard && (
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAudio}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={isAudioPlaying ? 'Mute ambient sound' : 'Play ambient field recording'}
                >
                  {isAudioPlaying ? <Volume2 size={16} className="text-[#D93829]" /> : <VolumeX size={16} />}
                </button>
                <div>
                  <span className="font-mono text-[11px] text-white block">
                    Sonic Postcard: {photo.sonicPostcard.label}
                  </span>
                  <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest">
                    Procedural Acoustic Emulsion
                  </span>
                </div>
              </div>

              {/* Animated Waveform Visualizer */}
              <div className="flex items-end gap-1 h-5 px-2">
                {waveformLevels.map((lvl, idx) => (
                  <span
                    key={idx}
                    className="w-1 bg-[#D93829] rounded-full transition-all duration-75"
                    style={{ height: `${lvl * 20}px` }}
                  />
                ))}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Bottom Whisper Dock */}
      <div
        className={`absolute bottom-6 inset-x-0 z-30 flex items-center justify-between px-8 transition-all duration-400 ${
          isIdle ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="font-mono text-[11px] text-neutral-400 tracking-wider hidden sm:block">
          HOLD CLICK OR [Z] FOR LOUPE • [← / →] TO NAVIGATE
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => onToggleCollect(photo)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white/90 hover:text-white hover:border-white transition-all text-xs font-mono"
          >
            {isCollected ? (
              <>
                <Check size={14} className="text-[#D93829]" />
                <span>In Collector’s Tray</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>+ Collect Plate</span>
              </>
            )}
          </button>

          <button
            onClick={() => onOpenInquiry(photo)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D93829] hover:bg-[#c22e20] text-white transition-all text-xs font-mono font-medium shadow-lg"
          >
            <Sparkles size={14} />
            <span>Inquire Print / Licensing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
